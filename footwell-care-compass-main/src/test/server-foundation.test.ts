import { describe, expect, it } from "vitest";
import {
  hasPermission,
  isAuthenticatedActor,
  requireAuthentication,
  requirePermission,
  type AuthenticatedActor,
} from "@/server/auth/authorization";
import { parseServerEnvironment, requireDatabaseUrl } from "@/server/config/environment-schema";
import { ApiError } from "@/server/core/errors";
import { failure, success } from "@/server/core/response";
import { parseRequest } from "@/server/core/validation";
import { createLogger, redactContext } from "@/server/logging/logger";
import { databaseErrorDiagnostic } from "@/server/db/diagnostics";
import { z } from "zod";

const patient: AuthenticatedActor = {
  userId: "patient-1",
  role: "PATIENT",
  sessionId: "session-1",
};

const practitioner: AuthenticatedActor = {
  userId: "practitioner-1",
  role: "PRACTITIONER",
  sessionId: "session-2",
};

const administrator: AuthenticatedActor = {
  userId: "administrator-1",
  role: "ADMINISTRATOR",
  sessionId: "session-3",
};

describe("server foundation", () => {
  it("returns a consistent validation failure for invalid, missing, and malformed input", () => {
    const schema = z.object({ treatmentName: z.string().min(1) });

    expect(() => parseRequest(schema, { treatmentName: "" })).toThrow(ApiError);
    expect(() => parseRequest(schema, undefined)).toThrow(ApiError);
    expect(() => parseRequest(schema, null)).toThrow(ApiError);
    expect(() => parseRequest(schema, [])).toThrow(ApiError);
    let caughtError: unknown;
    try {
      parseRequest(schema, { treatmentName: "" });
    } catch (error) {
      caughtError = error;
    }
    const response = failure(caughtError);

    expect(response).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST", fieldErrors: { treatmentName: ["Invalid value."] } },
    });
    expect(success({ accepted: true })).toEqual({ ok: true, data: { accepted: true } });
  });

  it("does not expose internal error messages in API failures", () => {
    const failureResponse = failure(new Error("database password is exposed"));
    const apiFailureResponse = failure(
      new ApiError(500, "UNEXPECTED_ERROR", "connection string postgresql://private"),
    );

    expect(failureResponse.error.message).toBe("An unexpected server error occurred.");
    expect(apiFailureResponse.error.message).toBe("An unexpected server error occurred.");
    expect(JSON.stringify([failureResponse, apiFailureResponse])).not.toContain("postgresql://private");
    expect(JSON.stringify([failureResponse, apiFailureResponse])).not.toContain("database password");
  });

  it("validates server configuration without requiring a database connection", () => {
    expect(parseServerEnvironment({ NODE_ENV: "test" }).DATABASE_URL).toBeUndefined();
    expect(
      parseServerEnvironment({
        DATABASE_URL: "postgresql://user:password@localhost:5432/footwell_test",
      }).DATABASE_URL,
    ).toContain("postgresql://");
    expect(() => parseServerEnvironment({ DATABASE_URL: "not-a-url" })).toThrow(ApiError);
    expect(() => parseServerEnvironment({ DATABASE_URL: "https://database.example.test" })).toThrow(ApiError);
    expect(() => parseServerEnvironment({ NODE_ENV: "staging" })).toThrow(ApiError);
    expect(() => requireDatabaseUrl({ NODE_ENV: "test" })).toThrow("Database access has not been configured.");
  });

  it("enforces role-based permissions and rejects malformed runtime actors", () => {
    expect(requirePermission(patient, "appointment:read:own")).toBe(patient);
    expect(requirePermission(practitioner, "appointment:manage")).toBe(practitioner);
    expect(requirePermission(administrator, "admin:manage")).toBe(administrator);
    expect(() => requirePermission(patient, "appointment:manage")).toThrow(ApiError);
    expect(() => requireAuthentication(null)).toThrow("Authentication is required.");

    const malformedActor = { userId: "attacker", role: "SUPERUSER", sessionId: "session-4" };
    expect(isAuthenticatedActor(malformedActor)).toBe(false);
    expect(hasPermission(malformedActor, "admin:manage")).toBe(false);
    expect(() => requirePermission(malformedActor, "admin:manage")).toThrow(ApiError);
  });

  it("redacts nested personal, clinical, and credential-like logging fields", () => {
    const context = redactContext({
      email: "patient@example.test",
      booking: {
        phone: "020 0000 0000",
        address: "42 Wimpole Street",
        dateOfBirth: "2000-01-01",
        medicalRecord: "clinical detail",
        apiKey: "api-key",
        signature: "signature",
        reference: "safe-reference",
      },
      documents: [{ originalName: "scan.pdf", storageKey: "private-key" }],
      unlabelledValues: ["patient@example.test", 42],
      token: "do-not-log",
    });

    expect(context).toEqual({
      email: "[REDACTED]",
      booking: {
        phone: "[REDACTED]",
        address: "[REDACTED]",
        dateOfBirth: "[REDACTED]",
        medicalRecord: "[REDACTED]",
        apiKey: "[REDACTED]",
        signature: "[REDACTED]",
        reference: "safe-reference",
      },
      documents: "[REDACTED]",
      unlabelledValues: ["[REDACTED]", "[REDACTED]"],
      token: "[REDACTED]",
    });
  });

  it("sends only redacted structured records to an injected log sink", () => {
    const records: unknown[] = [];
    const testLogger = createLogger((record) => records.push(record));

    testLogger.warn("appointment.request_rejected", { patientName: "Example Patient", requestId: "req-1" });

    expect(records).toEqual([
      {
        level: "warn",
        event: "appointment.request_rejected",
        context: { patientName: "[REDACTED]", requestId: "req-1" },
      },
    ]);
  });

  it("classifies database failures without retaining connection details", () => {
    const connectivity = databaseErrorDiagnostic(new Error("P1001: Can't reach database server"));
    const schema = databaseErrorDiagnostic(new Error('P2022: The column does not exist'));
    const timeout = new Error("availability query timed out");
    timeout.name = "AvailabilityLookupTimeoutError";

    expect(connectivity).toEqual({ category: "database-connectivity", errorName: "Error" });
    expect(schema).toEqual({ category: "database-schema", errorName: "Error" });
    expect(databaseErrorDiagnostic(timeout)).toEqual({ category: "database-timeout", errorName: "AvailabilityLookupTimeoutError" });
    expect(JSON.stringify([connectivity, schema])).not.toContain("database server");
  });
});
