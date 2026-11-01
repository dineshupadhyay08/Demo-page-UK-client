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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      throw invalidRequest();
    }
    if (!takePublicRequestQuota(`booking:${publicRequestKey(request.headers.get("x-forwarded-for"))}`, 5, 10 * 60_000)) {
      throw rateLimited();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
    const input = parseRequest(createAppointmentRequestSchema, body);
    const booking = await createAppointment(input);
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
    ...(diagnostic.transactionReason ? { transactionReason: diagnostic.transactionReason } : {}),
    ...(diagnostic.transactionDetail ? { transactionDetail: diagnostic.transactionDetail } : {}),
  });

  return NextResponse.json(failure(normalized), {
    status: statusFor(normalized),
  });
}
}
