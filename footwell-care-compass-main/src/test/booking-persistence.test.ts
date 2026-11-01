import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const db = vi.hoisted(() => ({
  transaction: vi.fn(), lock: vi.fn(), practitioner: vi.fn(), conflicts: vi.fn(),
  patient: vi.fn(), appointment: vi.fn(), warn: vi.fn(), after: vi.fn(), notify: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/server", async importOriginal => ({ ...await importOriginal<typeof import("next/server")>(), after: db.after }));
vi.mock("@/server/email/appointment-notifications", () => ({ sendAppointmentNotifications: db.notify }));
vi.mock("@/server/db/prisma", () => ({ prisma: { $transaction: db.transaction, practitioner: { findUnique: db.practitioner } } }));
vi.mock("@/server/config/environment", () => ({
  getServerEnvironment: () => ({}), requireBookingPractitionerId: () => "test-practitioner",
}));
vi.mock("@/server/logging/logger", () => ({ logger: { info: vi.fn(), warn: db.warn } }));
vi.mock("@/server/http/public-rate-limit", () => ({
  publicRequestKey: () => "test", takePublicRequestQuota: () => true,
}));
import { POST } from "@/app/api/appointments/route";

const payload = {
  patient: { firstName: "Synthetic", lastName: "Test", email: "synthetic@example.test", phone: "02079460999" },
  treatmentName: "General Podiatry Appointment", appointmentDate: "2099-01-05",
  appointmentTime: "10:00", privacyAccepted: true,
};
const request = (body: unknown = payload) => new Request("http://localhost/api/appointments", {
  method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" },
});

describe("booking persistence boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.practitioner.mockResolvedValue({ id: "test-practitioner" });
    db.conflicts.mockResolvedValue([]);
    db.patient.mockResolvedValue({ id: "test-patient" });
    db.appointment.mockResolvedValue({});
    db.transaction.mockImplementation(async (callback) => callback({
      $executeRaw: db.lock,
      appointment: { findMany: db.conflicts, create: db.appointment },
      patientProfile: { upsert: db.patient },
    }));
  });

  it("returns success only after transaction completion and retains serializable isolation", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(db.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 3000,
      timeout: 5000,
    });
    expect(db.appointment).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      consultationMode: "VIDEO", status: "PENDING", practitionerId: "test-practitioner",
    }) }));
    expect(db.lock).toHaveBeenCalledTimes(1);
    expect(db.after).toHaveBeenCalledTimes(1);
    expect(db.notify).not.toHaveBeenCalled();
    await db.after.mock.calls[0]![0]();
    expect(db.notify).toHaveBeenCalledTimes(1);
    expect(db.notify).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING" }), payload);
  });

  it("checks practitioner before opening the transaction and handles independent bookings", async () => {
    expect((await POST(request())).status).toBe(201);
    expect((await POST(request({ ...payload, appointmentTime: "12:00" }))).status).toBe(201);
    expect(db.practitioner).toHaveBeenCalledTimes(2);
    expect(db.practitioner.mock.invocationCallOrder[0]!).toBeLessThan(db.transaction.mock.invocationCallOrder[0]!);
    expect(db.appointment).toHaveBeenCalledTimes(2);
    db.practitioner.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(503);
    expect(db.transaction).toHaveBeenCalledTimes(2);
  });

  it("recognises expiration in the top-level Prisma message without leaking invocation data", async () => {
    db.transaction.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError(
      "private patient@example.test Transaction already closed: A commit cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 5800 ms passed since the start of the transaction.",
      { code: "P2028", clientVersion: "6" },
    ));
    expect((await POST(request())).status).toBe(503);
    expect(db.warn).toHaveBeenCalledWith("appointment.create_rejected", expect.objectContaining({
      transactionReason: "expired", transactionDetail: expect.stringContaining("5800 ms"),
    }));
    expect(JSON.stringify(db.warn.mock.calls)).not.toMatch(/private|patient@example.test/);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.after).not.toHaveBeenCalled();
  });

  it("returns no success when commit fails after the callback completes", async () => {
    const normal = db.transaction.getMockImplementation()!;
    db.transaction.mockImplementation(async (...args) => {
      await normal(...args);
      throw new Error("private database credential");
    });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(db.after).not.toHaveBeenCalled();
    expect((await response.json()).ok).toBe(false);
    expect(JSON.stringify(db.warn.mock.calls)).not.toContain("private database credential");
  });

  it("rejects an overlapping pending appointment without writing patient or appointment", async () => {
    db.conflicts.mockResolvedValue([{ startsAt: new Date("2099-01-05T10:00:00Z"), durationMinutes: 40, status: "PENDING" }]);
    expect((await POST(request())).status).toBe(409);
    expect(db.patient).not.toHaveBeenCalled();
    expect(db.after).not.toHaveBeenCalled();
    expect(db.appointment).not.toHaveBeenCalled();
  });

  it("does not schedule another notification when the same booking is submitted again", async () => {
    expect((await POST(request())).status).toBe(201);
    db.conflicts.mockResolvedValue([{ startsAt: new Date("2099-01-05T10:00:00Z"), durationMinutes: 40, status: "PENDING" }]);
    expect((await POST(request())).status).toBe(409);
    expect(db.after).toHaveBeenCalledTimes(1);
    expect(db.appointment).toHaveBeenCalledTimes(1);
  });

  it("keeps committed success when scheduling or notification processing fails", async () => {
    db.after.mockImplementationOnce(() => { throw new Error("private scheduler details"); });
    expect((await POST(request())).status).toBe(201);
    db.notify.mockRejectedValueOnce(new Error("private mail details"));
    expect((await POST(request())).status).toBe(201);
    await expect(db.after.mock.calls[1]![0]()).resolves.toBeUndefined();
    expect(JSON.stringify(db.warn.mock.calls)).not.toContain("private");
  });

  it("rejects serialization conflicts, missing practitioner and invalid/past inputs", async () => {
    db.transaction.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2034", clientVersion: "6" }));
    expect((await POST(request())).status).toBe(409);
    db.practitioner.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(503);
    expect((await POST(request({ ...payload, appointmentDate: "2000-01-01" }))).status).toBe(409);
    expect((await POST(request({}))).status).toBe(400);
    expect(db.after).not.toHaveBeenCalled();
    expect(db.appointment).not.toHaveBeenCalled();
  });

  it.each([
    ["Unable to start a transaction in the given time.", "acquisition-timeout"],
    ["Transaction already closed: A query cannot be executed on an expired transaction.", "expired"],
    ["private transaction detail patient@example.test", "unclassified"],
  ])("returns controlled P2028 failure without retrying or notifying: %s", async (detail, reason) => {
    db.transaction.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("private invocation and credentials", {
      code: "P2028", clientVersion: "6", meta: { error: detail },
    }));
    const response = await POST(request());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error.code).toBe("BOOKING_SERVICE_UNAVAILABLE");
    expect(body.error.message).toContain("contact the clinic before submitting again");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.after).not.toHaveBeenCalled();
    expect(db.warn).toHaveBeenCalledWith("appointment.create_rejected", expect.objectContaining({
      prismaCode: "P2028", transactionReason: reason,
    }));
    expect(JSON.stringify([body, db.warn.mock.calls])).not.toMatch(/private|patient@example.test/);
    expect(JSON.stringify(body)).not.toContain("expired transaction");
  });

  it("maps Prisma initialization connection failure safely without retrying", async () => {
    db.transaction.mockRejectedValueOnce(new Prisma.PrismaClientInitializationError("private database host", "6", "P1001"));
    expect((await POST(request())).status).toBe(503);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.after).not.toHaveBeenCalled();
    expect(db.warn).toHaveBeenCalledWith("appointment.create_rejected", expect.objectContaining({
      databaseCategory: "database-connectivity", prismaCode: "P1001",
    }));
  });

  it("handles concurrent submissions when the database rejects one serialization", async () => {
    const normal = db.transaction.getMockImplementation()!;
    db.transaction.mockImplementationOnce(async (...args) => normal(...args));
    db.transaction.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2034", clientVersion: "6" }));
    const responses = await Promise.all([POST(request()), POST(request())]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    expect(db.appointment).toHaveBeenCalledTimes(1);
    expect(db.after).toHaveBeenCalledTimes(1);
  });
});
