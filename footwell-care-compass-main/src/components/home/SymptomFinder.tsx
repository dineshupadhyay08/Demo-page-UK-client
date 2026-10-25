import { useState } from "react";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";

const QUESTIONS = [
  {
    question: "Where is the discomfort?",
    options: ["Heel or arch", "Toenail", "Knee, shin or hip", "Skin or general"],
  },
  { question: "Do you have diabetes or circulation concerns?", options: ["Yes", "No"] },
];

const RECOMMENDATIONS: Record<string, string> = {
  "Heel or arch": "Biomechanical & Gait Assessment",
  Toenail: "Partial Nail Avulsion (PNA)",
  "Knee, shin or hip": "Biomechanical & Gait Assessment",
  "Skin or general": "General Podiatry Appointment",
};

export function SymptomFinder({ onBook }: { onBook: (treatment: string) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const recommendation =
    answers.length < 2
      ? null
      : answers[1] === "Yes"
        ? "Diabetic Foot Assessment"
        : RECOMMENDATIONS[answers[0] ?? ""];

  return (
    <div className="self-start rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5">
      <SectionEyebrow>Symptom finder</SectionEyebrow>
      <h2 className="text-2xl text-heading">Find the right appointment</h2>
      <div className="mt-2 h-1 rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(answers.length / QUESTIONS.length) * 100}%` }}
        />
      </div>
      {recommendation ? (
        <div className="mt-8 animate-in fade-in">
          <p className="text-sm text-muted-foreground">We suggest:</p>
          <p className="mt-1 font-serif text-2xl text-heading">{recommendation}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton onClick={() => onBook(recommendation)}>Request this</ActionButton>
            <ActionButton variant="outline" onClick={() => setAnswers([])}>
              Start again
            </ActionButton>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Guidance only, not a diagnosis.</p>
        </div>
      ) : (
        <fieldset key={answers.length} className="mt-8 animate-in fade-in">
          <legend className="font-medium">{QUESTIONS[answers.length]?.question}</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {QUESTIONS[answers.length]?.options.map((option) => (
              <button
                key={option}
                onClick={() => setAnswers([...answers, option])}
                className="min-h-12 rounded-xl border px-4 text-left text-sm hover:border-accent hover:bg-secondary"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
