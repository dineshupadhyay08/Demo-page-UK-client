import { describe, expect, it } from "vitest";
import {
  filterAvailableSlots,
  getTreatmentDuration,
  intervalsOverlap,
  listCandidateSlots,
  londonDateTimeToUtc,
} from "@/server/appointments/availability";
import {
  appointmentAvailabilityRequestSchema,
  createAppointmentRequestSchema,
} from "@/server/appointments/booking-schema";
import { takePublicRequestQuota } from "@/server/http/public-rate-limit";

const futureNow = new Date("2030-01-01T00:00:00.000Z");

describe("appointment booking validation", () => {
  it("normalizes valid patient contact details and requires privacy acknowledgement", () => {
    const result = createAppointmentRequestSchema.parse({
      patient: {
        firstName: " Avery ",
        lastName: " Taylor ",
        email: "AVERY@EXAMPLE.TEST ",
        phone: "020 7946 0321",
      },
      treatmentName: "General Podiatry Appointment",
      appointmentDate: "2030-01-07",
      appointmentTime: "09:00",
      privacyAccepted: true,
    });

    expect(result.patient).toEqual({
      firstName: "Avery",
      lastName: "Taylor",
      email: "avery@example.test",
      phone: "02079460321",
    });
  });

  it("rejects missing consent, malformed UK phone numbers, invalid dates, and extra client fields", () => {
    const valid = {
      patient: { firstName: "Avery", lastName: "Taylor", email: "avery@example.test", phone: "02079460321" },
      treatmentName: "General Podiatry Appointment",
      appointmentDate: "2030-01-07",
      appointmentTime: "09:00",
      privacyAccepted: true,
    };

    expect(() => createAppointmentRequestSchema.parse({ ...valid, privacyAccepted: false })).toThrow();
    expect(() => createAppointmentRequestSchema.parse({ ...valid, patient: { ...valid.patient, phone: "555" } })).toThrow();
    expect(() => createAppointmentRequestSchema.parse({ ...valid, appointmentDate: "07/01/2030" })).toThrow();
    expect(() => createAppointmentRequestSchema.parse({ ...valid, consultationMode: "IN_CLINIC" })).toThrow();
    expect(() => appointmentAvailabilityRequestSchema.parse({ date: "2030-01-07" })).toThrow();
  });
});

describe("UK appointment availability", () => {
  it("converts London civil times across daylight saving and only generates times within published opening hours", () => {
    expect(londonDateTimeToUtc("2030-07-01", "09:00")?.toISOString()).toBe("2030-07-01T08:00:00.000Z");
    expect(londonDateTimeToUtc("2030-01-07", "09:00")?.toISOString()).toBe("2030-01-07T09:00:00.000Z");

    const duration = getTreatmentDuration("General Podiatry Appointment");
    expect(duration).toBe(40);
    const mondaySlots = listCandidateSlots("2030-01-07", duration ?? 0, futureNow);
    const saturdaySlots = listCandidateSlots("2030-01-12", duration ?? 0, futureNow);
    expect(mondaySlots[0]?.time).toBe("08:00");
    expect(mondaySlots.at(-1)?.time).toBe("18:00");
    expect(saturdaySlots[0]?.time).toBe("09:00");
    expect(saturdaySlots.at(-1)?.time).toBe("12:00");
    expect(listCandidateSlots("2030-01-13", duration ?? 0, futureNow)).toEqual([]);
  });

  it("removes every overlapping pending or confirmed slot while allowing cancelled appointments", () => {
    const duration = 40;
    const candidates = listCandidateSlots("2030-01-07", duration, futureNow).filter((slot) =>
      ["09:00", "09:30", "10:00", "10:30"].includes(slot.time),
    );
    const tenAm = londonDateTimeToUtc("2030-01-07", "10:00");
    if (!tenAm) throw new Error("Expected a valid London test time.");

    expect(intervalsOverlap(candidates[0]?.startsAt ?? tenAm, duration, tenAm, duration)).toBe(false);
    expect(filterAvailableSlots(candidates, duration, [{ startsAt: tenAm, durationMinutes: 40, status: "PENDING" }]).map((slot) => slot.time)).toEqual(["09:00"]);
    expect(filterAvailableSlots(candidates, duration, [{ startsAt: tenAm, durationMinutes: 40, status: "CANCELLED" }]).map((slot) => slot.time)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });
});

describe("public booking endpoint throttling", () => {
  it("permits requests up to the limit and blocks the next request until the window resets", () => {
    const now = 1_000;
    expect(takePublicRequestQuota("test-client", 2, 100, now)).toBe(true);
    expect(takePublicRequestQuota("test-client", 2, 100, now + 1)).toBe(true);
    expect(takePublicRequestQuota("test-client", 2, 100, now + 2)).toBe(false);
    expect(takePublicRequestQuota("test-client", 2, 100, now + 100)).toBe(true);
  });
});

