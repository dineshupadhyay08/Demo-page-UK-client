import { z } from "zod";

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
  treatmentName: z.string().min(1).max(160),
  startsAt: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(240),
  consultationMode: z.enum(["IN_CLINIC", "VIDEO"]),
  patientNote: z.string().trim().max(2000).optional(),
  documentMetadata: z.array(appointmentDocumentSchema).max(10).optional(),
});

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;
