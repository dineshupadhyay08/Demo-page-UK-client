import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";

const hooks = vi.hoisted(() => ({ values: [] as unknown[], refs: [] as { current: unknown }[], state: 0, ref: 0 }));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useEffect: () => {},
  useMemo: (factory: () => unknown) => factory(),
  useState: (initial: unknown) => {
    const index = hooks.state++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (value: unknown) => {
      hooks.values[index] = typeof value === "function" ? value(hooks.values[index]) : value;
    }];
  },
  useRef: (initial: unknown) => {
    const index = hooks.ref++;
    return hooks.refs[index] ?? (hooks.refs[index] = { current: initial });
  },
}));
import { BookingModal } from "@/components/booking/BookingModal";

function render() {
  hooks.state = 0; hooks.ref = 0;
  return BookingModal({ initialTreatment: "General Podiatry Appointment", onClose: () => {} });
}
function submitProps(node: ReactNode): { disabled: boolean; onClick: () => void; children: string } | undefined {
  if (Array.isArray(node)) return node.map(submitProps).find(Boolean);
  if (!isValidElement<{ children?: ReactNode; disabled: boolean; onClick: () => void }>(node)) return;
  if (node.props.children === "Submit appointment request" || node.props.children === "Submitting request…") {
    return node.props as { disabled: boolean; onClick: () => void; children: string };
  }
  return submitProps(node.props.children);
}

function buttonsWithClass(node: ReactNode, token: string): { onClick: () => void }[] {
  if (Array.isArray(node)) return node.flatMap(child => buttonsWithClass(child, token));
  if (!isValidElement<{ children?: ReactNode; className?: string; onClick: () => void }>(node)) return [];
  if (node.type === "button" && node.props.className?.split(" ").includes(token)) return [node.props];
  return buttonsWithClass(node.props.children, token);
}

describe("Review submit handler", () => {
  beforeEach(() => {
    hooks.values = [3, "General Podiatry Appointment", 0, "10:00", [], false, "",
      [new File(["synthetic"], "synthetic.pdf", { type: "application/pdf" })],
      { firstName: "Synthetic", lastName: "Test", email: "synthetic@example.test", phone: "02079460999" },
      "Synthetic note", true, "", "", false, null];
    hooks.refs = [];
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["email", "not-an-email", "valid email"],
    ["phone", "+919999999999", "UK phone"],
    ["firstName", "X".repeat(101), "first name"],
  ])("validates %s before sending and shows an editable error", (field, value, message) => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    hooks.values[8] = { ...(hooks.values[8] as object), [field]: value };
    submitProps(render())!.onClick();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(hooks.values[0]).toBe(2);
    expect(hooks.values[11]).toContain(message);
  });

  it("shows the server's invalid field without echoing submitted values", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: false, error: {
      message: "Request validation failed.", fieldErrors: { "patient.phone": ["private submitted value"] },
    } }, { status: 400 })));
    submitProps(render())!.onClick();
    await vi.waitFor(() => expect(hooks.values[12]).toContain("UK phone"));
    expect(hooks.values[12]).not.toContain("private submitted value");
  });

  it("allows optional local documents, sends one complete POST, and waits for success", async () => {
    let resolve!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>(done => { resolve = done; }));
    vi.stubGlobal("fetch", fetchMock);
    const button = submitProps(render())!;
    expect(button.disabled).toBe(false);
    button.onClick(); button.onClick();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe("/api/appointments");
    expect(call[1].method).toBe("POST");
    expect(JSON.parse(call[1].body as string)).toMatchObject({
      patient: hooks.values[8], patientNote: "Synthetic note", privacyAccepted: true, appointmentTime: "10:00",
    });
    expect(JSON.parse(call[1].body as string)).not.toHaveProperty("documents");
    expect(submitProps(render())).toMatchObject({ disabled: true, children: "Submitting request…" });
    expect(hooks.values[14]).toBeNull();
    resolve(Response.json({ ok: true, data: { bookingReference: "FW-SYNTHETIC", status: "PENDING" } }, { status: 201 }));
    await vi.waitFor(() => expect(hooks.values[14]).toMatchObject({ bookingReference: "FW-SYNTHETIC" }));
    expect(hooks.values[13]).toBe(false);
  });

  it("shows backend errors, releases the guard, and never shows false success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: false, error: { message: "Choose another time." } }, { status: 409 }));
    vi.stubGlobal("fetch", fetchMock);
    submitProps(render())!.onClick();
    await vi.waitFor(() => expect(hooks.values[12]).toBe("Choose another time."));
    expect(hooks.values[14]).toBeNull();
    expect(submitProps(render())!.disabled).toBe(false);
  });

  it("shows missing-slot feedback and returns invalid patient details to the editable step", () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    hooks.values[3] = null;
    submitProps(render())!.onClick();
    expect(hooks.values[12]).toContain("date and time");
    hooks.values[3] = "10:00";
    hooks.values[10] = false;
    submitProps(render())!.onClick();
    expect(hooks.values[0]).toBe(2);
    expect(hooks.values[11]).toContain("privacy");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["older-first", "newer-first"])("ignores obsolete date responses (%s)", async order => {
    hooks.values[0] = 1;
    const resolves: ((response: Response) => void)[] = [];
    const fetchMock = vi.fn<(url: string, options: RequestInit) => Promise<Response>>(() => new Promise<Response>(resolve => resolves.push(resolve)));
    vi.stubGlobal("fetch", fetchMock);
    const dates = buttonsWithClass(render(), "min-w-16");
    dates[0]!.onClick();
    dates[1]!.onClick();
    expect(fetchMock.mock.calls[0]![1].signal?.aborted).toBe(true);
    if (order === "newer-first") {
      resolves[1]!(Response.json({ ok: true, data: { slots: [{ time: "11:00" }] } }));
      await vi.waitFor(() => expect(hooks.values[5]).toBe(false));
      resolves[0]!(Response.json({ ok: true, data: { slots: [{ time: "08:00" }] } }));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(hooks.values[4]).toEqual([{ time: "11:00" }]);
      expect(hooks.values[5]).toBe(false);
      return;
    }
    resolves[0]!(Response.json({ ok: true, data: { slots: [{ time: "08:00" }] } }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(hooks.values[4]).toEqual([]);
    expect(hooks.values[5]).toBe(true);
    resolves[1]!(Response.json({ ok: true, data: { slots: [{ time: "11:00" }] } }));
    await vi.waitFor(() => expect(hooks.values[5]).toBe(false));
    expect(hooks.values[4]).toEqual([{ time: "11:00" }]);
  });

  it("resets loading on failure and on treatment-change cancellation", async () => {
    hooks.values[0] = 1;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: false, error: { message: "Service unavailable" } }, { status: 503 })));
    buttonsWithClass(render(), "min-w-16")[0]!.onClick();
    await vi.waitFor(() => expect(hooks.values[5]).toBe(false));
    expect(hooks.values[6]).toBe("Service unavailable");
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn<(url: string, options: RequestInit) => Promise<Response>>(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    buttonsWithClass(render(), "min-w-16")[0]!.onClick();
    expect(hooks.values[5]).toBe(true);
    hooks.values[0] = 0;
    buttonsWithClass(render(), "min-h-12")[0]!.onClick();
    expect(fetchMock.mock.calls[0]![1].signal?.aborted).toBe(true);
    expect(hooks.values[5]).toBe(false);
    finish(Response.json({ ok: true, data: { slots: [{ time: "08:00" }] } }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(hooks.values[4]).toEqual([]);
    expect(hooks.values[5]).toBe(false);
  });
});
