import { z } from "zod";

const patientContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(7).max(40).optional(),
  ),
});

export const appointmentDocumentSchema = z.object({
  storageKey: z.string().min(1).max(512),
  originalName: z.string().min(1).max(255),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  byteSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

export const appointmentRequestSchema = z.object({
  patient: patientContactSchema,
  treatmentName: z.string().trim().min(1).max(160),
  startsAt: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(240),
  consultationMode: z.literal("VIDEO"),
  patientNote: z.string().trim().max(2000).optional(),
  documentMetadata: z.array(appointmentDocumentSchema).max(10).optional(),
});

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;
