-- Historical patient links and contact values are preserved.
ALTER TABLE "Appointment"
  ALTER COLUMN "patientId" DROP NOT NULL,
  ADD COLUMN "guestContact" JSONB,
  ADD COLUMN "noticeVersion" TEXT,
  ADD COLUMN "requestKey" TEXT,
  ADD COLUMN "requestDigest" TEXT,
  ADD CONSTRAINT "Appointment_contact_required" CHECK ("patientId" IS NOT NULL OR "guestContact" IS NOT NULL);
CREATE UNIQUE INDEX "Appointment_requestKey_key" ON "Appointment" ("requestKey");
