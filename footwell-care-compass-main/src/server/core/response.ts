import { ApiError, type ApiErrorCode, type FieldErrors, unknownError } from "@/server/core/errors";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

const publicMessages: Readonly<Record<ApiErrorCode, string>> = {
  APPOINTMENT_UNAVAILABLE: "That appointment time is no longer available. Please choose another time.",
  BOOKING_SERVICE_UNAVAILABLE: "We could not verify your appointment request. Please contact the clinic before submitting again.",
  AUTHENTICATION_REQUIRED: "Authentication is required.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INVALID_REQUEST: "Request validation failed.",
  MISCONFIGURED_SERVER: "The service is not configured correctly.",
  NOT_FOUND: "The requested resource was not found.",
  RATE_LIMITED: "Too many requests. Please try again shortly.",
  SERVICE_UNAVAILABLE: "Appointment availability is temporarily unavailable. Please try again shortly.",
  UNEXPECTED_ERROR: "An unexpected server error occurred.",
};

export function success<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function failure(error: unknown): ApiFailure {
  const normalized = unknownError(error);
  const response: ApiFailure = {
    ok: false,
    error: {
      code: normalized.code,
      message: publicMessages[normalized.code],
    },
  };

  if (normalized.fieldErrors) {
    response.error.fieldErrors = Object.fromEntries(
      Object.keys(normalized.fieldErrors).map((field) => [field, ["Invalid value."]]),
    );
  }
  return response;
}

export function statusFor(error: unknown): number {
  return unknownError(error).status;
}

export function notFound(): ApiError {
  return new ApiError(404, "NOT_FOUND", "The requested resource was not found.");
}
