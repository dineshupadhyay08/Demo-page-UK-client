import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  practitioner: vi.fn(), conflicts: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), transaction: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/server/db/prisma", () => ({ prisma: {
  $transaction: mocks.transaction,
  practitioner: { findUnique: mocks.practitioner }, appointment: { findMany: mocks.conflicts },
} }));
vi.mock("@/server/config/environment", () => ({
  getServerEnvironment: () => ({}), requireBookingPractitionerId: () => "private-practitioner-id",
}));
vi.mock("@/server/logging/logger", () => ({ logger: {
  info: mocks.info, warn: mocks.warn, error: mocks.error,
} }));
import { GET } from "@/app/api/appointments/availability/route";
import { POST } from "@/app/api/appointments/route";

const request = () => new Request("http://localhost/api/appointments/availability?treatmentName=General+Podiatry+Appointment&date=2030-01-07");

describe("availability timing diagnostics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    vi.clearAllMocks();
    mocks.practitioner.mockResolvedValue({ id: "private-practitioner-id" });
    mocks.conflicts.mockResolvedValue([]);
  });
  afterEach(() => vi.useRealTimers());

  it("does not spend the booking quota when browsing availability", async () => {
    const headers = { "x-forwarded-for": "quota-isolation-test" };
    for (let i = 0; i < 6; i++) {
      expect((await GET(new Request(request(), { headers }))).status).toBe(200);
    }
    for (let i = 0; i < 5; i++) {
      expect((await POST(new Request("http://localhost/api/appointments", {
        method: "POST", headers, body: "{}",
      }))).status).toBe(400);
    }
    expect((await POST(new Request("http://localhost/api/appointments", {
      method: "POST", headers, body: "{}",
    }))).status).toBe(429);
  });

  it("correlates successful stage/handler timings without request or result data", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    const records = mocks.info.mock.calls;
    expect(records).toHaveLength(3);
    expect(new Set(records.map(([, c]) => c.diagnosticId)).size).toBe(1);
    expect(records.slice(0, 2).map(([, c]) => c.stage).sort()).toEqual([
      "appointment_conflict_lookup", "practitioner_lookup",
    ]);
    for (const [, context] of records) {
      expect(context.outcome).toBe("success");
      expect(context.durationMs).toBeGreaterThanOrEqual(0);
    }
    const serialized = JSON.stringify(records);
    expect(serialized).not.toContain("private-practitioner-id");
    expect(serialized).not.toContain("2030-01-07");
    expect(serialized).not.toContain("General Podiatry");
  });

  it("retains bounded abuse protection when database attempts fail", async () => {
    mocks.transaction.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("transaction failed", {
      code: "P2028", clientVersion: "6", meta: { error: "Unable to start a transaction in the given time." },
    }));
    const submit = () => POST(new Request("http://localhost/api/appointments", {
      method: "POST", headers: { "x-forwarded-for": "database-failure-quota-test" },
      body: JSON.stringify({ patient: { firstName: "Synthetic", lastName: "Test", email: "synthetic@example.test", phone: "02079460999" },
        treatmentName: "General Podiatry Appointment", appointmentDate: "2030-01-07", appointmentTime: "10:00", privacyAccepted: true }),
    }));
    for (let i = 0; i < 5; i++) expect((await submit()).status).toBe(503);
    expect((await submit()).status).toBe(429);
    expect(mocks.transaction).toHaveBeenCalledTimes(5);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect((await submit()).status).toBe(503);
  });

  it("preserves the timeout and records late settlement without cancellation or retries", async () => {
    let resolve!: (value: { id: string }) => void;
    mocks.practitioner.mockReturnValue(new Promise((done) => { resolve = done; }));
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(8000);
    expect((await pending).status).toBe(503);
    resolve({ id: "private-practitioner-id" });
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.info).toHaveBeenCalledWith("appointment.availability_lookup_timing", expect.objectContaining({
      stage: "practitioner_lookup", outcome: "success", settledAfterLookupWait: true,
    }));
    expect(mocks.practitioner).toHaveBeenCalledTimes(1);
    expect(mocks.conflicts).not.toHaveBeenCalled();
  });

  it("does not log raw query errors and releases handler counters on failure", async () => {
    mocks.practitioner.mockRejectedValue(new Error("secret database credential"));
    expect((await GET(request())).status).toBe(500);
    expect(JSON.stringify([...mocks.info.mock.calls, ...mocks.error.mock.calls])).not.toContain("secret database credential");
    expect(mocks.info).toHaveBeenCalledWith("appointment.availability_request_timing", expect.objectContaining({
      outcome: "error", activeHandlersAtStart: 1, activeHandlersAtEnd: 0,
    }));
  });

  it("counts overlapping handlers within the module instance", async () => {
    let resolve!: (value: { id: string }) => void;
    const lookup = new Promise((done) => { resolve = done; });
    mocks.practitioner.mockReturnValue(lookup);
    const first = GET(request());
    const second = GET(request());
    expect(mocks.conflicts).not.toHaveBeenCalled();
    resolve({ id: "private-practitioner-id" });
    expect((await Promise.all([first, second])).map(r => r.status)).toEqual([200, 200]);
    const totals = mocks.info.mock.calls.filter(([event]) => event === "appointment.availability_request_timing");
    expect(totals.map(([, c]) => c.activeHandlersAtStart)).toEqual([1, 2]);
    expect(totals.at(-1)?.[1].activeHandlersAtEnd).toBe(0);
  });

  it("distinguishes fully booked availability from database failure", async () => {
    mocks.conflicts.mockResolvedValue([{ startsAt: new Date("2030-01-07T00:00:00Z"), durationMinutes: 1440, status: "PENDING" }]);
    const empty = await GET(request());
    expect(empty.status).toBe(200);
    expect((await empty.json()).data.slots).toEqual([]);
    mocks.conflicts.mockRejectedValue(new Error("P1001: database unreachable"));
    const failed = await GET(request());
    expect(failed.status).toBe(503);
    expect(await failed.json()).toMatchObject({ ok: false, error: { code: "SERVICE_UNAVAILABLE" } });
  });

  it("allows a slow first lookup and conflict query within one bounded request", async () => {
    mocks.practitioner.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: "test" }), 3300)));
    mocks.conflicts.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 1000)));
    let settled = false;
    const pending = GET(request()).then(response => { settled = true; return response; });
    await vi.advanceTimersByTimeAsync(2500);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1800);
    const response = await pending;
    expect(response.status).toBe(200);
    expect((await response.json()).data.slots.length).toBeGreaterThan(0);
    expect(mocks.practitioner).toHaveBeenCalledTimes(1);
    expect(mocks.conflicts).toHaveBeenCalledTimes(1);
  });

  it("retries a transient first connection failure once inside the same deadline", async () => {
    mocks.practitioner.mockImplementationOnce(() => new Promise((_, reject) => setTimeout(() => reject(
      new Prisma.PrismaClientInitializationError("private host", "6", "P1001")), 1000)));
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(1200);
    expect((await pending).status).toBe(200);
    expect(mocks.practitioner).toHaveBeenCalledTimes(2);
    expect(mocks.conflicts).toHaveBeenCalledTimes(1);
  });

  it("stops after one failed retry and never exposes a false empty result", async () => {
    mocks.practitioner.mockRejectedValue(new Prisma.PrismaClientInitializationError("private host", "6", "P1001"));
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(200);
    const response = await pending;
    expect(response.status).toBe(503);
    expect((await response.json()).ok).toBe(false);
    expect(mocks.practitioner).toHaveBeenCalledTimes(2);
    expect(mocks.conflicts).not.toHaveBeenCalled();
  });

  it("retries the observed initialization connection error without an errorCode", async () => {
    mocks.practitioner.mockRejectedValueOnce(new Prisma.PrismaClientInitializationError("Can't reach database server at `private-host:5432`", "6"));
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(200);
    expect((await pending).status).toBe(200);
    expect(mocks.practitioner).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(mocks.info.mock.calls)).not.toContain("private-host");
  });

  it("does not retry authentication failure or a missing practitioner", async () => {
    mocks.practitioner.mockRejectedValueOnce(new Prisma.PrismaClientInitializationError("private", "6", "P1000"));
    expect((await GET(request())).status).toBe(503);
    expect(mocks.practitioner).toHaveBeenCalledTimes(1);
    mocks.practitioner.mockResolvedValueOnce(null);
    expect((await GET(request())).status).toBe(503);
    expect(mocks.practitioner).toHaveBeenCalledTimes(2);
    expect(mocks.conflicts).not.toHaveBeenCalled();
  });

  it("bounds a slow conflict read and does not retry it", async () => {
    mocks.conflicts.mockReturnValue(new Promise(() => {}));
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(8000);
    expect((await pending).status).toBe(503);
    expect(mocks.conflicts).toHaveBeenCalledTimes(1);
  });
});
