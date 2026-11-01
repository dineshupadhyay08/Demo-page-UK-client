import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function normalizeUkPhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, "");
  return compact.startsWith("0044") ? `+44${compact.slice(4)}` : compact;
}

const ukPhoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(32)
  .transform(normalizeUkPhone)
  .refine(
    (value) => /^(?:0\d{9,10}|\+44\d{9,10})$/.test(value),
    "Enter a valid UK phone number.",
  );

const patientSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: ukPhoneSchema,
  })
  .strict();

export const appointmentAvailabilityRequestSchema = z
  .object({
    date: z.string().regex(datePattern, "Enter a valid appointment date."),
    treatmentName: z.string().trim().min(1).max(160),
  })
  .strict();

export const createAppointmentRequestSchema = z
  .object({
    patient: patientSchema,
    treatmentName: z.string().trim().min(1).max(160),
    appointmentDate: z.string().regex(datePattern, "Enter a valid appointment date."),
    appointmentTime: z.string().regex(timePattern, "Enter a valid appointment time."),
    patientNote: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().max(2000).optional(),
    ),
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: "Please acknowledge the privacy notice." }),
    }),
  })
  .strict();

export type AppointmentAvailabilityRequest = z.infer<typeof appointmentAvailabilityRequestSchema>;
export type CreateAppointmentRequest = z.infer<typeof createAppointmentRequestSchema>;
