import type { AppointmentRequest } from "@/lib/validations/appointment";
import { appointmentRequestSchema } from "@/lib/validations/appointment";
import { parseRequest } from "@/server/core/validation";

export type PendingOnlineAppointmentRequest = Readonly<{
  status: "PENDING";
  patient: AppointmentRequest["patient"];
  treatmentName: string;
  startsAt: Date;
  durationMinutes: number;
  consultationMode: "VIDEO";
  patientNote?: string | undefined;
  documentMetadata?: AppointmentRequest["documentMetadata"];
}>;

/**
 * Validates and prepares a request for a later persistence adapter.
 * This function does not create an appointment, contact a database, or upload documents.
 */
export function prepareOnlineAppointmentRequest(input: unknown): PendingOnlineAppointmentRequest {
  const request = parseRequest(appointmentRequestSchema, input);

  return {
    status: "PENDING",
    patient: request.patient,
    treatmentName: request.treatmentName,
    startsAt: request.startsAt,
    durationMinutes: request.durationMinutes,
    consultationMode: request.consultationMode,
    ...(request.patientNote ? { patientNote: request.patientNote } : {}),
    ...(request.documentMetadata ? { documentMetadata: request.documentMetadata } : {}),
  };
}
