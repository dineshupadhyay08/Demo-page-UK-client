import { z } from "zod";
import { ApiError } from "@/server/core/errors";

const nodeEnvironmentSchema = z.enum(["development", "test", "production"]).optional().default("development");

const databaseUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      try {
        const protocol = new URL(value).protocol;
        return protocol === "postgres:" || protocol === "postgresql:";
      } catch {
        return false;
      }
    },
    "DATABASE_URL must use a PostgreSQL connection URL.",
  );

const serverEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema,
  DATABASE_URL: databaseUrlSchema.optional(),
  BOOKING_PRACTITIONER_ID: z.string().uuid().optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(input: {
  NODE_ENV?: string | undefined;
  DATABASE_URL?: string | undefined;
  BOOKING_PRACTITIONER_ID?: string | undefined;
}): ServerEnvironment {
  const parsed = serverEnvironmentSchema.safeParse(input);
  if (parsed.success) return parsed.data;

  throw new ApiError(
    500,
    "MISCONFIGURED_SERVER",
    "Server environment configuration is invalid.",
  );
}

export function requireDatabaseUrl(environment: ServerEnvironment): string {
  if (!environment.DATABASE_URL) {
    throw new ApiError(
      500,
      "MISCONFIGURED_SERVER",
      "Database access has not been configured.",
    );
  }

  return environment.DATABASE_URL;
}

export function requireBookingPractitionerId(environment: ServerEnvironment): string {
  if (!environment.BOOKING_PRACTITIONER_ID) {
    throw new ApiError(
      500,
      "MISCONFIGURED_SERVER",
      "Booking has not been configured for a practitioner.",
    );
  }

  return environment.BOOKING_PRACTITIONER_ID;
}
