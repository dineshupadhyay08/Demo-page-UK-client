"use client";

import { useEffect, useRef, useState } from "react";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { TREATMENTS } from "@/config/clinic";

// Original mappings are preview-only until reviewed by the responsible clinician.
const PREVIEW_SUGGESTIONS: Record<string, string> = {
  "Heel or arch": "Biomechanical & Gait Assessment",
  Toenail: "Partial Nail Avulsion (PNA)",
  "Knee, shin or hip": "Biomechanical & Gait Assessment",
  "Skin or general": "General Podiatry Appointment",
};

const QUESTIONS = [
  { question: "Where is the discomfort?", options: ["Heel or arch", "Toenail", "Knee, shin or hip", "Skin or general"] },
  { question: "Do you have diabetes or circulation concerns?", options: ["Yes", "No"] },
];

const control = "min-h-11 rounded-lg border border-[#E8E1EF] px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7136BA]";

export function SymptomFinder({ onBook }: { onBook: (treatment: string) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const complete = step === QUESTIONS.length;
  const question = QUESTIONS[step];
  const preview = process.env["SYMPTOM_FINDER_PREVIEW"] === "true";
  const suggestedName = complete && preview
    ? answers[1] === "Yes" ? "Diabetic Foot Assessment" : PREVIEW_SUGGESTIONS[answers[0] ?? ""]
    : undefined;
  const suggestion = TREATMENTS.find(treatment => treatment.name === suggestedName);

  useEffect(() => {
    if (interacted.current) heading.current?.focus({ preventScroll: true });
  }, [step]);

  function move(next: number) {
    interacted.current = true;
    setStep(next);
    if (next === step) heading.current?.focus({ preventScroll: true });
  }

  return (
    <aside aria-labelledby="symptom-finder-heading" className="min-w-0 self-start rounded-2xl border border-[#E8E1EF] bg-[#F5F0FF] p-5 text-[#231A31] sm:p-6">
      <SectionEyebrow>Symptom finder</SectionEyebrow>
      <h2 id="symptom-finder-heading" className="text-2xl font-bold">Find the right appointment</h2>
      <p className="mt-3 text-sm leading-relaxed">This guide is for general information and does not provide a medical diagnosis.</p>
      <p className="mt-2 text-sm leading-relaxed">It does not assess urgency. Answers stay on this page and are not sent with your booking.</p>
      {preview && <p role="note" className="mt-2 text-sm font-semibold">Preview only — service suggestions await clinician approval and must not guide patient care.</p>}
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Guide progress" aria-valuemin={0} aria-valuemax={2} aria-valuenow={step} aria-valuetext={complete ? "Questions complete" : `Question ${step + 1} of 2`}>
        <div className="h-full bg-[#7136BA]" style={{ width: `${step / QUESTIONS.length * 100}%` }} />
      </div>
      <p className="mt-2 text-xs">{complete ? "Questions complete" : `Question ${step + 1} of 2`}</p>
      <h3 ref={heading} tabIndex={-1} id="symptom-question" className="mt-5 rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7136BA]">
        {complete ? suggestion ? "We suggest:" : "Suggestions awaiting clinical approval" : question?.question}
      </h3>
      {complete ? (
        <div className="mt-3 space-y-4 text-sm leading-relaxed">
          {suggestion ? <p className="text-xl font-bold">{suggestion.name}</p> : <p>Automatic service suggestions are not enabled. Contact the clinic if you are unsure which service to choose.</p>}
          <p>Online consultations cannot provide hands-on examinations or physical treatments. Requests remain pending until the clinic reviews them.</p>
          {suggestion && <button type="button" onClick={() => onBook(suggestion.name)} className={`${control} bg-[#7136BA] text-white hover:bg-[#5B2EA6]`}>Request this</button>}
          <p className="text-xs">Guidance only, not a diagnosis.</p>
        </div>
      ) : (
        <div role="group" aria-labelledby="symptom-question" className="mt-4 grid gap-2 sm:grid-cols-2">
          {question?.options.map(option => (
            <button key={option} type="button" aria-pressed={answers[step] === option}
              onClick={() => setAnswers(previous => { const next = [...previous]; next[step] = option; return next; })}
              className={`${control} text-left font-normal ${answers[step] === option ? "border-[#7136BA] bg-white text-[#5B2EA6]" : "bg-white/70 hover:border-[#7136BA]"}`}>
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {step > 0 && <button type="button" onClick={() => move(step - 1)} className={`${control} bg-white text-[#5B2EA6]`}>Back</button>}
        {!complete && <button type="button" disabled={!answers[step]} onClick={() => { if (answers[step]) move(step + 1); }} className={`${control} bg-[#7136BA] text-white hover:bg-[#5B2EA6] disabled:cursor-not-allowed disabled:opacity-50`}>Next</button>}
        <button type="button" onClick={() => { setAnswers([]); move(0); }} className={`${control} border-transparent text-[#5B2EA6] hover:bg-white`}>Start Again</button>
      </div>
    </aside>
  );
}
