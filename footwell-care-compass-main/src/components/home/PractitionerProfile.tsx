import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PRACTITIONER_PROFILE } from "@/config/clinic";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";

export function PractitionerProfile() {
  const profile = PRACTITIONER_PROFILE;

  return (
    <section
      id="about"
      className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14"
      aria-labelledby="about-practitioner-heading"
    >
      <div className="overflow-hidden rounded-[2rem] bg-secondary">
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          width={720}
          height={860}
          className="aspect-[5/6] w-full object-cover"
        />
      </div>
      <div className="max-w-2xl">
        <SectionEyebrow>About the clinic</SectionEyebrow>
        <h2 id="about-practitioner-heading" className="text-3xl text-heading sm:text-4xl">
          {profile.name}
        </h2>
        <p className="mt-2 text-sm font-medium text-accent">{profile.role}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">{profile.introduction}</p>
        <blockquote className="mt-6 border-l-2 border-accent pl-5 font-serif text-xl italic leading-relaxed text-heading">
          “{profile.philosophy}”
        </blockquote>
        <dl className="mt-8 divide-y border-y">
          {profile.credentials.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="flex items-center gap-2 text-sm font-medium text-heading">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                {label}
              </dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
