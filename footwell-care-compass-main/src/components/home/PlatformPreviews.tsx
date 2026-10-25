import { Calendar, GraduationCap } from "lucide-react";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";

export function PlatformPreviews({ onBook }: { onBook: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="max-w-2xl">
        <SectionEyebrow>Patient services</SectionEyebrow>
        <h2 className="text-3xl text-heading sm:text-4xl">Plan your care with confidence</h2>
        <p className="mt-4 text-muted-foreground">
          Learn about appointment options, consultations and educational resources. Online booking,
          video visits and course enrolment will be introduced only when securely connected to
          clinic systems.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border bg-card p-7">
          <Calendar className="h-7 w-7 text-accent" aria-hidden />
          <h3 className="mt-5 text-xl text-heading">Appointment requests</h3>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Select a treatment and share a preferred appointment time. The clinic will confirm
            availability directly.
          </p>
          <ActionButton variant="accent" className="mt-6" onClick={onBook}>
            Start an appointment request
          </ActionButton>
        </div>
        <div className="flex flex-col rounded-2xl border bg-primary p-7 text-primary-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/10 font-serif text-xl">
            EH
          </div>
          <h3 className="mt-5 text-xl">Video consultations</h3>
          <p className="mt-2 flex-1 text-sm text-primary-foreground/70">
            Where clinically suitable, video consultation availability is arranged directly with the
            clinic after your enquiry.
          </p>
        </div>
        <div className="flex flex-col rounded-2xl border bg-card p-7">
          <GraduationCap className="h-7 w-7 text-accent" aria-hidden />
          <h3 className="mt-5 text-xl text-heading">Foot Health Academy</h3>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Browse practical educational resources. Online enrolment and payments are not yet
            available.
          </p>
        </div>
      </div>
    </section>
  );
}
