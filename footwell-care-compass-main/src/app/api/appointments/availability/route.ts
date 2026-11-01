import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAppointmentAvailability } from "@/server/appointments/booking-service";
import { appointmentAvailabilityRequestSchema } from "@/server/appointments/booking-schema";
import { ApiError, rateLimited, serviceUnavailable, unknownError } from "@/server/core/errors";
import { failure, success, statusFor } from "@/server/core/response";
import { parseRequest } from "@/server/core/validation";
import { databaseErrorDiagnostic, isDatabaseAvailabilityFailure } from "@/server/db/diagnostics";
import { publicRequestKey, takePublicRequestQuota } from "@/server/http/public-rate-limit";
import { logger } from "@/server/logging/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Module-instance scope only: not a pool-connection or deployment-wide count.
let activeHandlers = 0;

export async function GET(request: Request): Promise<NextResponse> {
  const startedAt = performance.now();
  const diagnosticId = randomUUID();
  const activeHandlersAtStart = ++activeHandlers;
  let outcome = "error";
  try {
    if (!takePublicRequestQuota(`availability:${publicRequestKey(request.headers.get("x-forwarded-for"))}`, 60, 60_000)) {
      throw rateLimited();
    }
    const url = new URL(request.url);
    const availability = await getAppointmentAvailability(
      parseRequest(appointmentAvailabilityRequestSchema, {
        date: url.searchParams.get("date"),
        treatmentName: url.searchParams.get("treatmentName"),
      }),
      new Date(),
      diagnosticId,
      request.signal,
    );
    outcome = "success";
    return NextResponse.json(success(availability), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const diagnostic = databaseErrorDiagnostic(error);
    const normalized =
      error instanceof ApiError
        ? error
        : isDatabaseAvailabilityFailure(diagnostic.category)
          ? serviceUnavailable()
          : unknownError(error);
    const context = {
      diagnosticId,
      code: normalized.code,
      databaseCategory: diagnostic.category,
      errorType: diagnostic.errorName,
      durationMs: Math.round(performance.now() - startedAt),
      ...(diagnostic.prismaCode ? { prismaCode: diagnostic.prismaCode } : {}),
    };
    if (normalized.code === "INVALID_REQUEST" || normalized.code === "RATE_LIMITED") {
      logger.warn("appointment.availability_rejected", context);
    } else {
      logger.error("appointment.availability_failed", context);
    }
    return NextResponse.json(failure(normalized), { status: statusFor(normalized) });
  } finally {
    --activeHandlers;
    logger.info("appointment.availability_request_timing", {
      diagnosticId,
      outcome,
      durationMs: Math.round(performance.now() - startedAt),
      activeHandlersAtStart,
      activeHandlersAtEnd: activeHandlers,
    });
  }
}
