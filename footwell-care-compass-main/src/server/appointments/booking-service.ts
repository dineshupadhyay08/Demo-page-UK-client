import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Prisma, type AppointmentStatus } from "@prisma/client";
import { isKnownDatabaseError } from "@/server/db/diagnostics";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import {
  MAX_APPOINTMENT_DURATION_MINUTES,
  filterAvailableSlots,
  getTreatmentDuration,
  isCandidateSlot,
  listCandidateSlots,
  rangeForLondonDate,
} from "@/server/appointments/availability";
import type {
  AppointmentAvailabilityRequest,
  CreateAppointmentRequest,
} from "@/server/appointments/booking-schema";
import { getServerEnvironment, requireBookingPractitionerId } from "@/server/config/environment";
import { ApiError, appointmentUnavailable } from "@/server/core/errors";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/logging/logger";

const blockingStatuses: AppointmentStatus[] = ["PENDING", "CONFIRMED"];
// Observed cold reads take ~3.3s, followed by ~1s for conflict lookup.
// A fast connection failure may retry once if 5s + backoff remain in this budget.
const AVAILABILITY_LOOKUP_TIMEOUT_MS = 8_000;
// Read-only probes observed concurrent transaction acquisition at 2.65s.
// Allow up to the existing 3s connection budget; execution stays capped at 5s.
const BOOKING_TRANSACTION_MAX_WAIT_MS = 3_000;

type StoredAppointmentInterval = Readonly<{
  startsAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
}>;

export type AppointmentAvailability = Readonly<{
  date: string;
  slots: ReadonlyArray<Readonly<{ time: string }>>;
}>;

export type CreatedAppointment = Readonly<{
  bookingReference: string;
  status: "PENDING";
  treatmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: "Europe/London";
  consultationMode: "VIDEO";
}>;

function getBookingPractitionerId(): string {
  return requireBookingPractitionerId(getServerEnvironment());
}

function requireTreatmentDuration(treatmentName: string): number {
  const durationMinutes = getTreatmentDuration(treatmentName);
  if (!durationMinutes) throw appointmentUnavailable();
  return durationMinutes;
}

function requireDateRange(date: string): Readonly<{ startsAt: Date; endsAt: Date }> {
  const range = rangeForLondonDate(date);
  if (!range) throw appointmentUnavailable();
  return range;
}

class AvailabilityLookupTimeoutError extends Error {
  constructor() {
    super("Appointment availability lookup timed out.");
    this.name = "AvailabilityLookupTimeoutError";
  }
}

async function withAvailabilityLookupTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new AvailabilityLookupTimeoutError()), AVAILABILITY_LOOKUP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function configuredPractitionerNotFound(): ApiError {
  return new ApiError(
    503,
    "MISCONFIGURED_SERVER",
    "The configured booking practitioner could not be found.",
  );
}

async function readSchedule(practitionerId: string, date: string): Promise<StoredAppointmentInterval[]> {
  const { startsAt, endsAt } = requireDateRange(date);
  const earliest = new Date(startsAt.getTime() - MAX_APPOINTMENT_DURATION_MINUTES * 60_000);
  // One snapshot and one round trip. A null interval means the practitioner
  // exists with no active bookings; zero rows means the configuration is invalid.
  type Row = StoredAppointmentInterval | { startsAt: null; durationMinutes: null; status: null };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT a."startsAt", a."durationMinutes", a."status"
    FROM "Practitioner" p
    LEFT JOIN "Appointment" a ON a."practitionerId" = p."id"
      AND a."status" IN ('PENDING', 'CONFIRMED')
      AND a."startsAt" >= (${earliest.toISOString()}::timestamptz AT TIME ZONE 'UTC')
      AND a."startsAt" < (${endsAt.toISOString()}::timestamptz AT TIME ZONE 'UTC')
    WHERE p."id" = ${practitionerId}
  `;
  if (!rows.length) throw configuredPractitionerNotFound();
  return rows.filter((row): row is StoredAppointmentInterval => row.startsAt !== null);
}

function createBookingReference(): string {
  return `FW-${randomBytes(12).toString("hex").toUpperCase()}`;
}

function isBookingReferenceConflict(error: unknown): boolean {
  return (
    isKnownDatabaseError(error) &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.["target"]) &&
    error.meta["target"].includes("bookingReference")
  );
}

function isTransactionConflict(error: unknown): boolean {
  return isKnownDatabaseError(error) && error.code === "P2034";
}

export async function getAppointmentAvailability(
  request: AppointmentAvailabilityRequest,
  now: Date = new Date(),
  diagnosticId: string = randomUUID(),
  signal?: AbortSignal,
): Promise<AppointmentAvailability> {
  const lookupStartedAt = performance.now();
  const durationMinutes = requireTreatmentDuration(request.treatmentName);
  const candidates = listCandidateSlots(request.date, durationMinutes, now);
  if (candidates.length === 0) return { date: request.date, slots: [] };
  const practitionerId = getBookingPractitionerId();
  let lookupWaitEnded = false;
  async function lookupSchedule() {
    const lookup = () => readSchedule(practitionerId, request.date);
    try {
      return await lookup();
    } catch (error) {
      const code = error instanceof PrismaClientInitializationError ? error.errorCode
        : isKnownDatabaseError(error) ? error.code : undefined;
      // Prisma's engine can omit errorCode for this exact connection failure.
      const uncodedConnectionFailure = error instanceof PrismaClientInitializationError
        && !code && /Can't reach database server at/.test(error.message);
      // Only retry a failed read connection, never validation, missing records,
      // conflict results or writes. The outer deadline covers both attempts.
      if (lookupWaitEnded || signal?.aborted
        || performance.now() - lookupStartedAt > 2_800
        || (code !== "P1001" && code !== "P1002" && !uncodedConnectionFailure)) throw error;
      await new Promise(resolve => setTimeout(resolve, 200));
      if (lookupWaitEnded || signal?.aborted) throw new AvailabilityLookupTimeoutError();
      logger.info("appointment.availability_connection_retry", { diagnosticId, attempt: 1 });
      return await lookup();
    }
  }
  // Includes lazy connection/pool wait, transport and execution, not acquisition alone.
  async function timedLookup<T>(stage: string, operation: () => PromiseLike<T>): Promise<T> {
    const startedAt = performance.now();
    let outcome = "error";
    try {
      const result = await operation();
      outcome = "success";
      return result;
    } finally {
      logger.info("appointment.availability_lookup_timing", {
        diagnosticId,
        stage,
        outcome,
        durationMs: Math.round(performance.now() - startedAt),
        settledAfterLookupWait: lookupWaitEnded,
      });
    }
  }
  const appointments = await withAvailabilityLookupTimeout(
    timedLookup("schedule_lookup", lookupSchedule),
  ).finally(() => { lookupWaitEnded = true; });
  const slots = filterAvailableSlots(candidates, durationMinutes, appointments).map(({ time }) => ({ time }));

  return { date: request.date, slots };
}

export async function createAppointment(
  request: CreateAppointmentRequest,
  now: Date = new Date(),
  requestKey?: string,
): Promise<{ booking: CreatedAppointment; replay: boolean }> {
  const digest = createHash("sha256").update(JSON.stringify(request)).digest("hex");
  function receipt(bookingReference: string): CreatedAppointment {
    return { bookingReference, status: "PENDING", treatmentName: request.treatmentName,
      appointmentDate: request.appointmentDate, appointmentTime: request.appointmentTime,
      timezone: "Europe/London", consultationMode: "VIDEO" };
  }
  async function previousReceipt() {
    if (!requestKey) return null;
    const row = await prisma.appointment.findUnique({ where: { requestKey },
      select: { requestDigest: true, bookingReference: true } });
    if (!row) return null;
    if (row.requestDigest !== digest) throw new ApiError(409, "INVALID_REQUEST", "Request key already used.");
    return { booking: receipt(row.bookingReference), replay: true };
  }
  const previous = await previousReceipt();
  if (previous) return previous;
  const durationMinutes = requireTreatmentDuration(request.treatmentName);
  const startsAt = isCandidateSlot(request.appointmentDate, request.appointmentTime, durationMinutes, now);
  if (!startsAt) throw appointmentUnavailable();
  const practitionerId = getBookingPractitionerId();

  const { endsAt } = requireDateRange(request.appointmentDate);
  const searchStartsAt = new Date(startsAt.getTime() - MAX_APPOINTMENT_DURATION_MINUTES * 60_000);
  const lockKey = `footwell-booking:${practitionerId}:${request.appointmentDate}`;
  // Independent preparation warms the connection without consuming transaction
  // lifetime. The appointment foreign key still enforces practitioner integrity.
  const practitioner = await prisma.practitioner.findUnique({
    where: { id: practitionerId }, select: { id: true },
  });
  if (!practitioner) throw configuredPractitionerNotFound();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const bookingReference = createBookingReference();
    try {
      await prisma.$transaction(
        async (transaction) => {
          await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

          const conflicts = await transaction.appointment.findMany({
            where: {
              practitionerId,
              status: { in: blockingStatuses },
              startsAt: { gte: searchStartsAt, lt: endsAt },
            },
            select: { startsAt: true, durationMinutes: true, status: true },
          });
          const available = filterAvailableSlots(
            [{ time: request.appointmentTime, startsAt }],
            durationMinutes,
            conflicts,
          );
          if (available.length === 0) throw appointmentUnavailable();

          await transaction.appointment.create({
            data: {
              bookingReference,
              treatmentName: request.treatmentName,
              startsAt,
              durationMinutes,
              consultationMode: "VIDEO",
              status: "PENDING",
              privacyAcceptedAt: new Date(),
              ...(request.patientNote ? { patientNote: request.patientNote } : {}),
              guestContact: request.patient,
              noticeVersion: request.noticeVersion ?? null,
              ...(requestKey ? { requestKey, requestDigest: digest } : {}),
              practitionerId,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: BOOKING_TRANSACTION_MAX_WAIT_MS,
          timeout: 5_000,
        },
      );

      return { booking: receipt(bookingReference), replay: false };
    } catch (error) {
      const committed = await previousReceipt();
      if (committed) return committed;
      if (isKnownDatabaseError(error) && error.message.includes("Appointment_practitioner_active_slot_excl")) throw appointmentUnavailable();
      if (isBookingReferenceConflict(error) && attempt < 2) continue;
      if (isTransactionConflict(error)) throw appointmentUnavailable();
      throw error;
    }
  }

  throw appointmentUnavailable();
}
