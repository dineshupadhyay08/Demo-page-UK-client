import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Video, X } from "lucide-react";
import { CLINIC, TREATMENTS } from "@/config/clinic";
import { ActionButton } from "@/components/shared/ActionButton";
import { DocumentUpload } from "@/components/booking/DocumentUpload";
import { createAppointmentRequestSchema } from "@/server/appointments/booking-schema";

const bookingFieldMessages: Record<string, string> = {
  "patient.firstName": "Enter a first name of 1–100 characters.",
  "patient.lastName": "Enter a last name of 1–100 characters.",
  "patient.email": "Enter a valid email address (maximum 254 characters).",
  "patient.phone": "Enter a valid UK phone number, starting with 0 or +44.",
  patientNote: "Keep your appointment note to 2,000 characters or fewer.",
  privacyAccepted: "Please acknowledge the privacy notice before continuing.",
  appointmentDate: "Please select a valid appointment date.",
  appointmentTime: "Please select a valid appointment time.",
  treatmentName: "Please select a treatment.",
};

function bookingValidationMessage(fields: string[]): string {
  return [...new Set(fields.map(field => Object.hasOwn(bookingFieldMessages, field)
    ? bookingFieldMessages[field] : "Please check your appointment details."))].join(" ");
}

const patientDetailsSchema = createAppointmentRequestSchema.pick({
  patient: true, patientNote: true, privacyAccepted: true,
});

type BookingModalProps = {
  initialTreatment: string;
  onClose: () => void;
};

type AvailableSlot = Readonly<{ time: string }>;
type BookingResult = Readonly<{
  bookingReference: string;
  status: "PENDING";
  treatmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: "Europe/London";
  consultationMode: "VIDEO";
}>;

function londonDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const values = Object.fromEntries(parts.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values["year"]}-${values["month"]}-${values["day"]}`;
}

function nextBookingDays(): Date[] {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date;
  }).filter((date) => date.getDay() !== 0);
}

function readApiMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    if ("fieldErrors" in payload.error && payload.error.fieldErrors && typeof payload.error.fieldErrors === "object") {
      return bookingValidationMessage(Object.keys(payload.error.fieldErrors));
    }
    return payload.error.message;
  }
  return fallback;
}

export function BookingModal({ initialTreatment, onClose }: BookingModalProps) {
  const [step, setStep] = useState(initialTreatment ? 1 : 0);
  const [treatment, setTreatment] = useState(initialTreatment);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [patient, setPatient] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [patientNote, setPatientNote] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const availabilityRequestRef = useRef<AbortController | null>(null);
  const submissionInFlightRef = useRef(false);
  const days = useMemo(() => nextBookingDays(), []);
  const selectedDate = day === null ? null : days[day] ? londonDateKey(days[day]) : null;
  const selectedDay = day === null ? undefined : days[day];
  const steps = ["Treatment", "Date & time", "Preferences", "Review"];

  useEffect(() => () => availabilityRequestRef.current?.abort(), []);

  const loadAvailableSlots = async (date: string) => {
    if (!treatment) return;
    availabilityRequestRef.current?.abort();
    const controller = new AbortController();
    availabilityRequestRef.current = controller;
    setIsLoadingSlots(true);
    setAvailabilityError("");
    try {
      const query = new URLSearchParams({ treatmentName: treatment, date });
      const response = await fetch(`/api/appointments/availability?${query.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const payload = (await response.json()) as unknown;
      if (controller.signal.aborted) return;
      if (
        !response.ok ||
        !payload ||
        typeof payload !== "object" ||
        !("ok" in payload) ||
        payload.ok !== true ||
        !("data" in payload) ||
        !payload.data ||
        typeof payload.data !== "object" ||
        !("slots" in payload.data) ||
        !Array.isArray(payload.data.slots)
      ) {
        throw new Error(readApiMessage(payload, "We could not load available appointment times."));
      }
      const nextSlots = payload.data.slots.filter(
        (slot): slot is AvailableSlot =>
          !!slot && typeof slot === "object" && "time" in slot && typeof slot.time === "string",
      );
      setSlots(nextSlots);
      setTime((current) => (nextSlots.some((slot) => slot.time === current) ? current : null));
    } catch (error) {
      if (controller.signal.aborted) return;
      setSlots([]);
      setTime(null);
      setAvailabilityError(error instanceof Error ? error.message : "We could not load available appointment times.");
    } finally {
      if (!controller.signal.aborted) setIsLoadingSlots(false);
    }
  };

  const validatePatientDetails = (): boolean => {
    const parsed = patientDetailsSchema.safeParse({ patient, patientNote, privacyAccepted });
    if (!parsed.success) {
      setPatientError(bookingValidationMessage(parsed.error.issues.map(issue => issue.path.join("."))));
      return false;
    }
    setPatientError("");
    return true;
  };

  const submitBooking = async () => {
    if (submissionInFlightRef.current || bookingResult) return;
    if (!selectedDate || !time) {
      setSubmissionError("Please select an appointment date and time before submitting.");
      return;
    }
    if (!validatePatientDetails()) {
      setStep(2);
      return;
    }
    const parsed = createAppointmentRequestSchema.safeParse({
      patient, treatmentName: treatment, appointmentDate: selectedDate,
      appointmentTime: time, patientNote, privacyAccepted,
    });
    if (!parsed.success) {
      setSubmissionError(bookingValidationMessage(parsed.error.issues.map(issue => issue.path.join("."))));
      return;
    }

    submissionInFlightRef.current = true;
    setIsSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as unknown;
      if (
        !response.ok ||
        !payload ||
        typeof payload !== "object" ||
        !("ok" in payload) ||
        payload.ok !== true ||
        !("data" in payload) ||
        !payload.data ||
        typeof payload.data !== "object" ||
        !("bookingReference" in payload.data) ||
        typeof payload.data.bookingReference !== "string" ||
        !("status" in payload.data) ||
        payload.data.status !== "PENDING"
      ) {
        throw new Error(readApiMessage(payload, "We could not submit your appointment request."));
      }
      setBookingResult(payload.data as BookingResult);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "We could not submit your appointment request.");
    } finally {
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Request an appointment"
    >
      <div
        className="absolute inset-0 bg-primary/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-7 shadow-2xl animate-in zoom-in-95">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Appointment request</p>
        <ol className="mt-4 flex gap-2">
          {steps.map((item, index) => (
            <li
              key={item}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-accent" : "bg-secondary"}`}
              aria-label={item}
            />
          ))}
        </ol>
        <h2 className="mt-5 text-2xl text-heading">{bookingResult ? "Request received" : steps[step]}</h2>

        {step === 0 && (
          <div className="mt-5 grid gap-2">
            {TREATMENTS.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setTreatment(item.name);
                  setTime(null);
                  setSlots([]);
                  setAvailabilityError("");
                  availabilityRequestRef.current?.abort();
                  setIsLoadingSlots(false);
                  setStep(1);
                }}
                className="flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm hover:border-accent hover:bg-secondary"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.mins} min · £{item.from}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-5">
            <p className="text-sm text-muted-foreground">{treatment} with {CLINIC.practitioner}</p>
            <p className="mt-4 text-sm font-medium">Preferred date</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {days.map((date, index) => (
                <button
                  key={londonDateKey(date)}
                  onClick={() => {
                    setDay(index);
                    setTime(null);
                    setSlots([]);
                    setAvailabilityError("");
                    void loadAvailableSlots(londonDateKey(date));
                  }}
                  className={`min-w-16 rounded-xl border px-3 py-2 text-center text-sm ${day === index ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  <span className="block text-xs opacity-70">
                    {date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Europe/London" })}
                  </span>
                  {date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Europe/London" })}
                </button>
              ))}
            </div>
            {selectedDate && (
              <>
                <p className="mt-4 text-sm font-medium">Available online consultation times</p>
                {isLoadingSlots && <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">Loading available times…</p>}
                {availabilityError && <p className="mt-2 text-sm text-destructive" role="alert">{availabilityError}</p>}
                {!isLoadingSlots && !availabilityError && slots.length === 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">No online consultation times are available for this date.</p>
                )}
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setTime(slot.time)}
                      className={`min-h-11 rounded-lg border text-sm ${time === slot.time ? "border-accent bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </>
            )}
            <ActionButton className="mt-6 w-full" disabled={!time || isLoadingSlots} onClick={() => setStep(2)}>
              Continue
            </ActionButton>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            <div className="flex min-h-12 items-center gap-3 rounded-xl border border-accent bg-secondary px-4 text-sm">
              <Video className="h-4 w-4 text-accent" aria-hidden />
              <span>Online video consultation</span>
            </div>
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="text-sm font-medium">Your details</legend>
              <label className="block text-sm font-medium">
                First name
                <input required autoComplete="given-name" value={patient.firstName} onChange={(event) => setPatient((current) => ({ ...current, firstName: event.target.value }))} className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                Last name
                <input required autoComplete="family-name" value={patient.lastName} onChange={(event) => setPatient((current) => ({ ...current, lastName: event.target.value }))} className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Email address
                <input required type="email" autoComplete="email" value={patient.email} onChange={(event) => setPatient((current) => ({ ...current, email: event.target.value }))} className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Phone number
                <input required type="tel" autoComplete="tel" value={patient.phone} onChange={(event) => setPatient((current) => ({ ...current, phone: event.target.value }))} className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" />
              </label>
            </fieldset>
            <DocumentUpload documents={documents} onChange={setDocuments} />
            <label className="block text-sm font-medium">
              Anything we should know?
              <textarea value={patientNote} onChange={(event) => setPatientNote(event.target.value)} className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" rows={3} placeholder="e.g. heel pain for three months" />
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} className="mt-1 accent-[var(--accent)]" />
              <span>I acknowledge that Footwell Podiatry will use these details to manage my appointment request.</span>
            </label>
            {patientError && <p className="text-sm text-destructive" role="alert">{patientError}</p>}
            <ActionButton className="w-full" onClick={() => { if (validatePatientDetails()) setStep(3); }}>
              Review request
            </ActionButton>
          </div>
        )}

        {step === 3 && !bookingResult && (
          <div className="mt-5 text-center">
            <p className="font-serif text-xl text-heading">{treatment}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedDay?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" })} at {time} · Online video consultation
            </p>
            {documents.length > 0 && <p className="mt-4 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">Supporting documents remain only on this device because secure document upload is not configured. You can submit your appointment request without them; selected documents will not be sent.</p>}
            <p className="mt-4 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">Your request will be sent with a pending status. It is not confirmed until the clinic reviews it.</p>
            {submissionError && <p className="mt-4 text-sm text-destructive" role="alert">{submissionError}</p>}
            <ActionButton className="mt-6 w-full" disabled={isSubmitting} aria-busy={isSubmitting} onClick={() => void submitBooking()}>
              {isSubmitting ? "Submitting request…" : "Submit appointment request"}
            </ActionButton>
          </div>
        )}

        {bookingResult && (
          <div className="mt-5 text-center" aria-live="polite">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" aria-hidden />
            <p className="mt-4 font-serif text-xl text-heading">Your appointment request has been received.</p>
            <p className="mt-2 text-sm text-muted-foreground">Reference: <span className="font-semibold text-heading">{bookingResult.bookingReference}</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Status: Pending clinic review</p>
            <p className="mt-1 text-sm text-muted-foreground">{bookingResult.appointmentTime} · {bookingResult.timezone}</p>
            <ActionButton className="mt-6" onClick={onClose}>Close</ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
