import "server-only";
import { parseServerEnvironment, type ServerEnvironment } from "@/server/config/environment-schema";

export {
  parseServerEnvironment,
  requireBookingPractitionerId,
  requireDatabaseUrl,
  type ServerEnvironment,
} from "@/server/config/environment-schema";

export function getServerEnvironment(): ServerEnvironment {
  return parseServerEnvironment({
    NODE_ENV: process.env["NODE_ENV"],
    DATABASE_URL: process.env["DATABASE_URL"],
    BOOKING_PRACTITIONER_ID: process.env["BOOKING_PRACTITIONER_ID"],
  });
}
