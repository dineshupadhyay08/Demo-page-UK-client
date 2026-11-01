import { describe, expect, it } from "vitest";
import { ApiError } from "@/server/core/errors";
import { prepareOnlineAppointmentRequest } from "@/server/appointments/prepare-request";

const validRequest = {
  patient: {
    firstName: "Avery",
    lastName: "Taylor",
    email: "avery@example.test",
    phone: "020 0000 0000",
  },
  treatmentName: "General Podiatry Appointment",
  startsAt: "2030-06-15T09:00:00.000Z",
  durationMinutes: 40,
  consultationMode: "VIDEO",
  patientNote: "Heel pain for three months.",
};

describe("online appointment request preparation", () => {
  it("creates a validated pending video-consultation draft without persistence", () => {
    const request = prepareOnlineAppointmentRequest(validRequest);

    expect(request).toMatchObject({
      status: "PENDING",
      patient: validRequest.patient,
      treatmentName: validRequest.treatmentName,
      durationMinutes: 40,
      consultationMode: "VIDEO",
    });
    expect(request.startsAt).toBeInstanceOf(Date);
    expect(request).not.toHaveProperty("id");
  });

  it("rejects in-clinic, malformed, and incomplete requests", () => {
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, consultationMode: "IN_CLINIC" })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, patient: { ...validRequest.patient, email: "not-an-email" } })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, patient: { ...validRequest.patient, firstName: "" } })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, treatmentName: "   " })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, durationMinutes: 0 })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest({ ...validRequest, startsAt: "not-a-date" })).toThrow(ApiError);
    expect(() => prepareOnlineAppointmentRequest(undefined)).toThrow(ApiError);
  });
});
