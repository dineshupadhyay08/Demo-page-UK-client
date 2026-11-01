import "server-only";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { CLINIC } from "@/config/clinic";
import type { CreatedAppointment } from "@/server/appointments/booking-service";
import type { CreateAppointmentRequest } from "@/server/appointments/booking-schema";
import { getTreatmentDuration, londonDateTimeToUtc, UK_TIME_ZONE } from "@/server/appointments/availability";
import { logger } from "@/server/logging/logger";

const configuration = z.object({
  SMTP_HOST: z.literal("smtp-relay.brevo.com"),
  SMTP_PORT: z.enum(["587", "465"]),
  SMTP_USER: z.string().trim().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z.enum(["false", "true"]),
  APPOINTMENT_EMAIL_FROM: z.string().email(),
  CLINIC_NOTIFICATION_EMAIL: z.string().email(),
  CLINIC_CONTACT_EMAIL: z.string().email(),
  CLINIC_CONTACT_PHONE: z.string().trim().min(1).max(80),
}).refine(value => (value.SMTP_PORT === "465") === (value.SMTP_SECURE === "true"));
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

// Stable UUID-shaped provider keys, scoped separately to each recipient purpose.
function deliveryKey(reference: string, audience: string): string {
  const bytes = createHash("sha256").update(`appointment-email-v1:${reference}:${audience}`).digest().subarray(0, 16);
  bytes[6] = (bytes.readUInt8(6) & 0x0f) | 0x40;
  bytes[8] = (bytes.readUInt8(8) & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Called only after a committed booking. No automatic retries or durable delivery claim. */
export async function sendAppointmentNotifications(booking: CreatedAppointment, input: CreateAppointmentRequest): Promise<void> {
  if (process.env["APPOINTMENT_EMAIL_ENABLED"] !== "true") {
    logger.info("appointment.email_skipped", { reason: "disabled" });
    return;
  }
  const parsed = configuration.safeParse(process.env);
  const startsAt = londonDateTimeToUtc(booking.appointmentDate, booking.appointmentTime);
  const duration = getTreatmentDuration(booking.treatmentName);
  if (!parsed.success || !startsAt || duration === null) {
    logger.warn("appointment.email_skipped", { reason: "invalid_configuration" });
    return;
  }
  const config = parsed.data;
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST, port: Number(config.SMTP_PORT), secure: config.SMTP_SECURE === "true",
    requireTLS: true, auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
  });
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: UK_TIME_ZONE, dateStyle: "full" }).format(startsAt);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: UK_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short" }).format(startsAt);
  const common: [string, string][] = [
    ["Patient", `${input.patient.firstName} ${input.patient.lastName}`],
    ["Booking reference", booking.bookingReference], ["Treatment", booking.treatmentName],
    ["Date", date], ["Time", `${time} (${UK_TIME_ZONE})`],
    ["Consultation", "Online video consultation"], ["Duration", `${duration} minutes`],
    ["Status", "PENDING — awaiting clinic review"],
  ];
  await Promise.all((["patient", "clinic"] as const).map(async audience => {
    try {
      const rows: [string, string][] = audience === "patient" ? common : [...common,
        ["Patient email", input.patient.email], ["Patient phone", input.patient.phone],
        ["Privacy acknowledgement", input.privacyAccepted ? "Accepted" : "Not accepted"],
        ...(input.patientNote ? [["Patient note", input.patientNote] as [string, string]] : []),
      ];
      const title = audience === "patient" ? "Appointment request received" : "New appointment request";
      const notice = "The request has been received. This appointment is not confirmed until reviewed by the clinic.";
      const contact = `Clinic contact: ${config.CLINIC_CONTACT_EMAIL} | ${config.CLINIC_CONTACT_PHONE}`;
      const textContent = `${CLINIC.name}\n${title}\n\n${notice}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${contact}`;
      const htmlContent = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#183d38"><div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff"><p>${escapeHtml(CLINIC.name)}</p><h1 style="font-size:24px">${title}</h1><p style="line-height:1.6">${notice}</p><table role="presentation" style="width:100%;border-collapse:collapse;table-layout:fixed">${rows.map(([label, value]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e3e8e6;vertical-align:top;width:35%">${label}</td><td style="padding:10px;border-bottom:1px solid #e3e8e6;overflow-wrap:anywhere;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="line-height:1.6;overflow-wrap:anywhere">${escapeHtml(contact)}</p></div></body></html>`;
      const recipient = audience === "patient" ? input.patient.email : config.CLINIC_NOTIFICATION_EMAIL;
      const result = await transport.sendMail({
        from: { name: CLINIC.name, address: config.APPOINTMENT_EMAIL_FROM },
        to: [{ address: recipient, name: "" }], replyTo: config.CLINIC_CONTACT_EMAIL,
        subject: `${title} — ${booking.bookingReference}`, html: htmlContent, text: textContent,
        // Stable Message-ID aids tracing; SMTP does NOT guarantee deduplication.
        messageId: `<${deliveryKey(booking.bookingReference, audience)}@${config.APPOINTMENT_EMAIL_FROM.split("@")[1]}>`,
      });
      // Never log provider bodies, recipients, references, notes, or raw errors.
      if (result.accepted?.includes(recipient) && !result.rejected?.length) {
        logger.info("appointment.email_accepted", { audience });
      } else {
        logger.warn("appointment.email_failed", { audience, category: "smtp_recipient_not_accepted" });
      }
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      const category = code === "EAUTH" ? "smtp_authentication" : code === "EENVELOPE" ? "smtp_sender_or_recipient_rejected" : "smtp_transport";
      logger.warn("appointment.email_failed", { audience, category });
    }
  }));
}
