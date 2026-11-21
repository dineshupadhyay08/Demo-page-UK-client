import { after, NextResponse } from "next/server";
import { sendAppointmentNotifications } from "@/server/email/appointment-notifications";
import { createAppointment } from "@/server/appointments/booking-service";
import { createAppointmentRequestSchema } from "@/server/appointments/booking-schema";
import { failure, success, statusFor } from "@/server/core/response";
import { parseRequest } from "@/server/core/validation";
import { ApiError, invalidRequest, rateLimited, unknownError } from "@/server/core/errors";
import { publicRequestKey, takePublicRequestQuota } from "@/server/http/public-rate-limit";
import { logger } from "@/server/logging/logger";
import { databaseErrorDiagnostic, isDatabaseAvailabilityFailure } from "@/server/db/diagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

async function readBookingJson(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  if ((origin !== null && origin !== new URL(request.url).origin) ||
      request.headers.get("sec-fetch-site") === "cross-site" ||
      request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") throw invalidRequest();
  const reader = request.body?.getReader();
  if (!reader) throw invalidRequest();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw invalidRequest();
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw invalidRequest();
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      throw invalidRequest();
    }
    if (!takePublicRequestQuota(`booking:${publicRequestKey(request.headers.get("x-forwarded-for"))}`, 5, 10 * 60_000)) {
      throw rateLimited();
    }

    const key = request.headers.get("idempotency-key");
    if (key !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) throw invalidRequest();
    const input = parseRequest(createAppointmentRequestSchema, await readBookingJson(request));
    const { booking, replay } = await createAppointment(input, new Date(), key?.toLowerCase());
    if (replay) return NextResponse.json(success(booking), { status: 201 });
    // Persistence has committed. Notification failures must never undo booking success.
    try {
      after(async () => {
        try {
          await sendAppointmentNotifications(booking, input);
        } catch {
          logger.warn("appointment.email_failed", { category: "notification_task" });
        }
      });
    } catch {
      logger.warn("appointment.email_failed", { category: "scheduling" });
    }
    return NextResponse.json(success(booking), { status: 201 });
 } catch (error) {
  const diagnostic = databaseErrorDiagnostic(error);
  // A database failure may have an ambiguous commit outcome. Never retry writes
  // automatically or tell the patient to resubmit without checking with the clinic.
  const normalized = error instanceof ApiError ? error
    : isDatabaseAvailabilityFailure(diagnostic.category)
      ? new ApiError(503, "BOOKING_SERVICE_UNAVAILABLE", "Booking could not be verified.")
      : unknownError(error);

  // Log only known field paths, never raw Zod issues or submitted values.
  const knownFields = ["patient.firstName", "patient.lastName", "patient.email", "patient.phone",
    "patientNote", "privacyAccepted", "appointmentDate", "appointmentTime", "treatmentName"];

  logger.warn("appointment.create_rejected", {
    code: normalized.code,
    databaseCategory: diagnostic.category,
    errorType: diagnostic.errorName,
    ...(normalized.fieldErrors ? {
      invalidFields: knownFields.filter(field => Object.hasOwn(normalized.fieldErrors!, field)).join(",") || "form",
    } : {}),
    ...(diagnostic.prismaCode ? { prismaCode: diagnostic.prismaCode } : {}),
    ...(diagnostic.schemaField ? { schemaField: diagnostic.schemaField } : {}),
    ...(diagnostic.transactionReason ? { transactionReason: diagnostic.transactionReason } : {}),
    ...(diagnostic.transactionDetail ? { transactionDetail: diagnostic.transactionDetail } : {}),
  });

  return NextResponse.json(failure(normalized), {
    status: statusFor(normalized),
  });
}
}
