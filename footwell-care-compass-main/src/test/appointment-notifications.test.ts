import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ send: vi.fn(), transport: vi.fn(), info: vi.fn(), warn: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("nodemailer", () => ({ default: { createTransport: mocks.transport } }));
vi.mock("@/server/logging/logger", () => ({ logger: { info: mocks.info, warn: mocks.warn } }));
import { sendAppointmentNotifications } from "@/server/email/appointment-notifications";
const booking = { bookingReference: "FW-SYNTHETIC", status: "PENDING", treatmentName: "General Podiatry Appointment", appointmentDate: "2099-07-06", appointmentTime: "10:00", timezone: "Europe/London", consultationMode: "VIDEO" } as const;
const input = { ...booking, patient: { firstName: "<Synthetic>", lastName: "Test", email: "patient@example.test", phone: "02079460999" }, privacyAccepted: true as const, patientNote: "Private <script>note</script>" };
describe("SMTP appointment notifications", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    for (const [key,value] of Object.entries({ APPOINTMENT_EMAIL_ENABLED: "true", SMTP_HOST: "smtp-relay.brevo.com", SMTP_PORT: "587", SMTP_USER: "synthetic-login", SMTP_PASS: "test-secret", SMTP_SECURE: "false", APPOINTMENT_EMAIL_FROM: "sender@example.test", CLINIC_NOTIFICATION_EMAIL: "clinic@gmail.com", CLINIC_CONTACT_EMAIL: "contact@example.test", CLINIC_CONTACT_PHONE: "+448956756577" })) vi.stubEnv(key,value);
    mocks.transport.mockReturnValue({ sendMail: mocks.send });
    mocks.send.mockImplementation(async mail => ({ accepted: [mail.to[0].address], rejected: [], messageId: "smtp-id" }));
  });
  afterEach(() => vi.unstubAllEnvs());
  it("uses authenticated STARTTLS and sends separate patient and clinic messages", async () => {
    await sendAppointmentNotifications(booking,input);
    expect(mocks.transport).toHaveBeenCalledWith(expect.objectContaining({ host: "smtp-relay.brevo.com", port: 587, secure: false, requireTLS: true, auth: { user: "synthetic-login", pass: "test-secret" }, logger: false, debug: false }));
    expect(mocks.send).toHaveBeenCalledTimes(2);
    const patient=mocks.send.mock.calls[0]![0], clinic=mocks.send.mock.calls[1]![0];
    expect(patient.to[0].address).toBe(input.patient.email);
    expect(clinic.to[0].address).toBe("clinic@gmail.com");
    for(const mail of [patient,clinic]) {
      expect(mail.html).toContain("&lt;Synthetic&gt;");
      expect(mail.html).not.toContain("<script>");
      expect(mail.text).toContain("10:00 BST (Europe/London)");
      expect(mail.text).toContain("40 minutes");
      expect(mail.text).toContain("not confirmed until reviewed");
      expect(mail.text).toContain("+448956756577");
      expect(mail.attachments).toBeUndefined();
    }
    expect(patient.text).not.toContain(input.patientNote);
    expect(clinic.text).toContain(input.patientNote);
    expect(mocks.info).toHaveBeenCalledWith("appointment.email_accepted",{audience:"patient"});
    expect(mocks.info).toHaveBeenCalledWith("appointment.email_accepted",{audience:"clinic"});
  });
  it.each(["SMTP_PASS","SMTP_USER","SMTP_HOST","SMTP_PORT","SMTP_SECURE","APPOINTMENT_EMAIL_FROM","CLINIC_NOTIFICATION_EMAIL","CLINIC_CONTACT_EMAIL","CLINIC_CONTACT_PHONE"])("skips missing %s", async key => {
    vi.stubEnv(key,""); await sendAppointmentNotifications(booking,input);
    expect(mocks.transport).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it("preserves disabled behaviour",async()=>{vi.stubEnv("APPOINTMENT_EMAIL_ENABLED","false");await sendAppointmentNotifications(booking,input);expect(mocks.transport).not.toHaveBeenCalled();});
  it("rejects inconsistent TLS configuration",async()=>{vi.stubEnv("SMTP_SECURE","true");await sendAppointmentNotifications(booking,input);expect(mocks.transport).not.toHaveBeenCalled();});
  it.each([["EAUTH","smtp_authentication"],["EENVELOPE","smtp_sender_or_recipient_rejected"],["ETIMEDOUT","smtp_transport"]])("handles %s safely without retries",async(code,category)=>{
    mocks.send.mockRejectedValueOnce(Object.assign(new Error("test-secret patient@example.test"),{code}));
    await expect(sendAppointmentNotifications(booking,input)).resolves.toBeUndefined();
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(mocks.warn).toHaveBeenCalledWith("appointment.email_failed",{audience:"patient",category});
    expect(mocks.info).toHaveBeenCalledWith("appointment.email_accepted",{audience:"clinic"});
    expect(JSON.stringify([mocks.info.mock.calls,mocks.warn.mock.calls])).not.toMatch(/test-secret|example.test|Private/);
  });
  it("never logs provider response bodies or message identifiers", async () => {
    mocks.send.mockImplementation(async (mail) => ({ accepted: [mail.to[0].address], rejected: [], messageId: "private-message-id", response: "250 private@example.test sensitive-provider-text" }));
    await sendAppointmentNotifications(booking, input);
    expect(mocks.info).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(mocks.info.mock.calls)).not.toMatch(/private-message-id|private@example|sensitive-provider/);
  });
  it("never calls recipient rejection delivery success",async()=>{mocks.send.mockResolvedValue({accepted:[],rejected:["private@example.test"],response:"private rejection text"});await sendAppointmentNotifications(booking,input);expect(mocks.info).not.toHaveBeenCalled();expect(mocks.warn).toHaveBeenCalledTimes(2);expect(JSON.stringify(mocks.warn.mock.calls)).not.toContain("private");});
  it("uses London GMT in winter",async()=>{await sendAppointmentNotifications({...booking,appointmentDate:"2099-01-05"},input);expect(mocks.send.mock.calls[0]![0].text).toContain("10:00 GMT (Europe/London)");});
});
