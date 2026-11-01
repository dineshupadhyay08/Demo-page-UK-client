-- REVIEW REQUIRED BEFORE DEPLOYMENT
-- This migration was prepared without database access. Before applying it, verify
-- the target database contains Prisma's default quoted "Appointment" table and
-- that its existing rows can safely receive a legacy booking reference.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "bookingReference" TEXT;

ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3);

UPDATE "Appointment"
SET "bookingReference" = 'LEGACY-' || "id"
WHERE "bookingReference" IS NULL;

ALTER TABLE "Appointment"
  ALTER COLUMN "bookingReference" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_bookingReference_key"
  ON "Appointment"("bookingReference");

ALTER TABLE "Appointment"
  DROP CONSTRAINT IF EXISTS "Appointment_practitioner_active_slot_excl";

-- startsAt is TIMESTAMP(3) WITHOUT TIME ZONE in the Prisma schema.
-- Use tsrange to avoid a timezone-dependent cast in the GiST index expression.
-- Half-open bounds allow adjacent appointments while rejecting overlaps.
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_practitioner_active_slot_excl"
  EXCLUDE USING gist (
    "practitionerId" WITH =,
    tsrange(
      "startsAt",
      "startsAt" + ("durationMinutes" * INTERVAL '1 minute'),
      '[)'
    ) WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));
