import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { CLINIC, TREATMENTS } from "@/config/clinic";
import { ActionButton } from "@/components/shared/ActionButton";
import { DocumentUpload } from "@/components/booking/DocumentUpload";

type BookingModalProps = {
  initialTreatment: string;
  onClose: () => void;
};

export function BookingModal({ initialTreatment, onClose }: BookingModalProps) {
  const [step, setStep] = useState(initialTreatment ? 1 : 0);
  const [treatment, setTreatment] = useState(initialTreatment);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState("In clinic");
  const [documents, setDocuments] = useState<File[]>([]);
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter((d) => d.getDay() !== 0);
  const steps = ["Treatment", "Date & time", "Preferences", "Review"];

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
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Appointment request
        </p>
        <ol className="mt-4 flex gap-2">
          {steps.map((item, index) => (
            <li
              key={item}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-accent" : "bg-secondary"}`}
              aria-label={item}
            />
          ))}
        </ol>
        <h2 className="mt-5 text-2xl text-heading">{steps[step]}</h2>

        {step === 0 && (
          <div className="mt-5 grid gap-2">
            {TREATMENTS.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setTreatment(item.name);
                  setStep(1);
                }}
                className="flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm hover:border-accent hover:bg-secondary"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">
                  {item.mins} min · £{item.from}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-5">
            <p className="text-sm text-muted-foreground">
              {treatment} with {CLINIC.practitioner}
            </p>
            <p className="mt-4 text-sm font-medium">Preferred date</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setDay(index)}
                  className={`min-w-16 rounded-xl border px-3 py-2 text-center text-sm ${day === index ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  <span className="block text-xs opacity-70">
                    {date.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  {date.getDate()}
                </button>
              ))}
            </div>
            {day !== null && (
              <>
                <p className="mt-4 text-sm font-medium">Preferred time</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {["09:00", "10:30", "12:00", "14:15", "15:30", "17:00"]
                    .filter((_, index) => (index + day) % 3 !== 0)
                    .map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`min-h-11 rounded-lg border text-sm ${time === slot ? "border-accent bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
                      >
                        {slot}
                      </button>
                    ))}
                </div>
              </>
            )}
            <ActionButton className="mt-6 w-full" disabled={!time} onClick={() => setStep(2)}>
              Continue
            </ActionButton>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            {["In clinic", "Video consultation"].map((option) => (
              <label
                key={option}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm ${mode === option ? "border-accent bg-secondary" : ""}`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === option}
                  onChange={() => setMode(option)}
                  className="accent-[var(--accent)]"
                />
                {option}
              </label>
            ))}
            <DocumentUpload documents={documents} onChange={setDocuments} />
            <label className="block text-sm font-medium">
              Anything we should know?
              <textarea
                className="mt-2 w-full rounded-xl border bg-background p-3 text-sm"
                rows={3}
                placeholder="e.g. heel pain for three months"
              />
            </label>
            <ActionButton className="w-full" onClick={() => setStep(3)}>
              Review request
            </ActionButton>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" aria-hidden />
            <p className="mt-4 font-serif text-xl text-heading">{treatment}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {day !== null &&
                days[day]?.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
              at {time} · {mode}
            </p>
            {documents.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {documents.length} supporting document{documents.length === 1 ? "" : "s"} selected
                for this request.
              </p>
            )}
            <p className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
              Online appointment requests are not yet connected to the clinic system, so nothing has
              been sent or stored. Please contact the clinic to arrange an appointment.
            </p>
            <ActionButton className="mt-6" onClick={onClose}>
              Close
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
