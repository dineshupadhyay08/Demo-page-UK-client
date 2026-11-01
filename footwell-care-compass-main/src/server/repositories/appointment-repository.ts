export const appointmentStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type ConsultationMode = "IN_CLINIC" | "VIDEO";

export type AppointmentRecord = Readonly<{
  id: string;
  bookingReference: string;
  treatmentName: string;
  startsAt: Date;
  durationMinutes: number;
  consultationMode: ConsultationMode;
  status: AppointmentStatus;
  privacyAcceptedAt: Date | null;
  patientId: string;
  practitionerId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateAppointmentInput = Omit<
  AppointmentRecord,
  "id" | "status" | "createdAt" | "updatedAt"
> & {
  status?: AppointmentStatus;
};

/**
 * Persistence boundary only. A Prisma implementation is intentionally deferred
 * until the approved schema and non-production database are available.
 */
export interface AppointmentRepository {
  findById(id: string): Promise<AppointmentRecord | null>;
  create(input: CreateAppointmentInput): Promise<AppointmentRecord>;
  updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentRecord | null>;
}
