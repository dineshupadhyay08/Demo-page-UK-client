import { randomUUID } from "node:crypto";
import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
const target = process.env["FOOTWELL_PHASE1_TEST_URL"];
describe.skipIf(!target)("isolated PostgreSQL booking", () => {
  it("isolates guest identity, replays committed submissions and serializes competing slots", async () => {
    const url = new URL(target!);
    if (url.hostname !== "127.0.0.1" || !/^\/footwell_test_[a-f0-9]+$/.test(url.pathname) ||
        process.env["DATABASE_URL"] !== target) throw new Error("Disposable test database required");
    const { prisma } = await import("@/server/db/prisma");
    const { createAppointment } = await import("@/server/appointments/booking-service");
    const practitioner = await prisma.practitioner.create({ data: { email: "staff@example.test", displayName: "Test" } });
    vi.stubEnv("BOOKING_PRACTITIONER_ID", practitioner.id);
    const patient = { firstName: "Guest", lastName: "One", email: "shared@example.test", phone: "02079460999" };
    try {
      const historical = await prisma.patientProfile.create({ data: { ...patient, firstName: "Historical" } });
      const input = { patient, treatmentName: "General Podiatry Appointment", appointmentDate: "2099-01-05",
        appointmentTime: "10:00", privacyAccepted: true as const };
      const key = randomUUID();
      const submit = () => createAppointment(input, new Date(), key);
      const pair = await Promise.all([submit(), submit()]);
      expect(pair[0].booking.bookingReference).toBe(pair[1].booking.bookingReference);
      expect(pair.filter(result => result.replay)).toHaveLength(1);
      expect((await submit()).replay).toBe(true);
      await expect(createAppointment({ ...input, appointmentTime: "15:00" }, new Date(), key)).rejects.toMatchObject({ status: 409 });
      const second = { ...input, appointmentTime: "12:00", patient: { ...patient, firstName: "Other" } };
      const competing = await Promise.allSettled([createAppointment(second), createAppointment(second)]);
      expect(competing.filter(x => x.status === "fulfilled")).toHaveLength(1);
      const rows = await prisma.appointment.findMany({ orderBy: { startsAt: "asc" } });
      expect(rows.map(row => row.patientId)).toEqual([null, null]);
      expect(rows.map(row => row.guestContact)).toEqual([patient, second.patient]);
      expect(await prisma.patientProfile.findUnique({ where: { id: historical.id } })).toEqual(historical);
    } finally {
      vi.unstubAllEnvs();
      await prisma.$disconnect();
    }
  });
});
