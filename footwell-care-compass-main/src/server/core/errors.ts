import { z } from "zod";

export type ApiErrorCode =
  | "APPOINTMENT_UNAVAILABLE"
  | "BOOKING_SERVICE_UNAVAILABLE"
  | "AUTHENTICATION_REQUIRED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "MISCONFIGURED_SERVER"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "UNEXPECTED_ERROR";

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: FieldErrors;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}

export function validationError(error: z.ZodError): ApiError {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "form";
    const messages = fieldErrors[field] ?? [];
    messages.push(issue.message);
    fieldErrors[field] = messages;
  }

  return new ApiError(400, "INVALID_REQUEST", "Request validation failed.", fieldErrors);
}

export function unknownError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(500, "UNEXPECTED_ERROR", "An unexpected server error occurred.");
}

export function appointmentUnavailable(): ApiError {
  return new ApiError(
    409,
    "APPOINTMENT_UNAVAILABLE",
    "The selected appointment time is no longer available.",
  );
}

export function rateLimited(): ApiError {
  return new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again shortly.");
}

export function invalidRequest(): ApiError {
  return new ApiError(400, "INVALID_REQUEST", "Request validation failed.");
}

export function serviceUnavailable(): ApiError {
  return new ApiError(
    503,
    "SERVICE_UNAVAILABLE",
    "Appointment availability is temporarily unavailable.",
  );
}
