import { ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { JournalArticle } from "@/lib/journal";

type Section = JournalArticle["sections"][number];
type ImagePlacement = {
  id: string;
  title: string;
  alt: string;
  caption: string;
  large?: boolean;
  imageSrc?: string;
  width?: number;
  height?: number;
  layout?: 'image-right' | 'image-left';
};

// Asset briefs with actual image files for Plantar Fasciitis article
const placements: Record<string, Record<string, ImagePlacement>> = {
  "recognising-early-signs-of-plantar-fasciitis": {
    understanding: {
      id: "plantar-fascia-anatomy",
      title: "The plantar fascia",
      alt: "Anatomical illustration of the foot showing the plantar fascia tissue running from the heel to the toes, with the heel attachment point and area of pain highlighted in red",
      caption: "Anatomy: the fibrous band supporting the arch from heel to toes.",
      large: true,
      imageSrc: "/journal/01-plantar-fascia-anatomy.png",
      layout: 'image-left',
    },
    symptoms: {
      id: "plantar-fasciitis-symptoms",
      title: "Common symptoms",
      alt: "Photograph of a foot with red highlighting indicating heel pain, alongside icons showing three common symptoms: sharp pain in the morning, pain after prolonged standing or activity, and tenderness under the heel",
      caption: "Symptoms: morning pain, activity-related discomfort, and heel tenderness are characteristic.",
      imageSrc: "/journal/02-recognising-symptoms.png",
      layout: 'image-right', // Text left, image right
    },
    causes: {
      id: "plantar-fasciitis-causes",
      title: "Causes and risk factors",
      alt: "Photograph of a person jogging outdoors, alongside icons illustrating four risk factors: high-impact activities like running, unsupportive footwear, higher body weight, and prolonged standing",
      caption: "Risk factors: high-impact activities, unsupportive shoes, increased body weight, and prolonged standing increase load on the plantar fascia.",
      imageSrc: "/journal/03-causes-risk-factors.png",
      layout: 'image-left', // Image left, text right
    },
    "self-care": {
      id: "plantar-fasciitis-selfcare",
      title: "Home care strategies",
      alt: "Photograph showing a foot resting on a frozen water bottle on a yoga mat, alongside icons showing four home care strategies: ice rolling, rest and activity reduction, supportive cushioned footwear, and gradual loading as pain settles",
      caption: "Home care: ice therapy, supportive footwear, activity modification, and gradual return to activity.",
      imageSrc: "/journal/04-home-care.png",
      layout: 'image-right',
    },
    exercise: {
      id: "plantar-fasciitis-exercise",
      title: "Stretching techniques",
      alt: "Two photographs showing stretching techniques: left image shows a person performing a calf stretch against a wall; right image shows a person seated, performing a gentle plantar fascia stretch with their hands",
      caption: "Exercise: calf stretch to reduce tension on the heel, and plantar fascia stretch for direct tissue mobility.",
      imageSrc: "/journal/05-stretching-exercise.png",
      layout: 'image-left',
    },
    assessment: {
      id: "plantar-fasciitis-assessment",
      title: "Professional assessment",
      alt: "Photograph showing a clinician in a Footwell Podiatry coat performing a hands-on foot examination, alongside icons describing four assessment components: symptom and function assessment, movement and structure evaluation, identification of contributing factors, and personalised treatment planning",
      caption: "Assessment: comprehensive evaluation of symptoms, movement, structure, and contributing factors.",
      imageSrc: "/journal/06-professional-assessment.png",
      layout: 'image-right',
    },
  },
  "custom-orthotics-vs-off-the-shelf-insoles": {
    definitions: {
      id: "orthotics-foot-anatomy", title: "Understanding Your Foot's Natural Arch",
      alt: "Side-view anatomical illustration showing the foot bones, heel and soft tissues beneath the arch",
      caption: "The arch links the heel and forefoot; this illustration is not an individual assessment.",
      imageSrc: "/journal/Custom Orthotics/01-foot-anatomy-arch-support.png", width: 758, height: 332, layout: "image-left",
    },
    custom: {
      id: "orthotics-custom-construction", title: "Designed Around Individual Foot Needs",
      alt: "Blue contoured orthosis with a raised arch, shaped heel cup and visible layered base",
      caption: "Contour, heel shape and layered construction are visible; suitability depends on the prescription.",
      imageSrc: "/journal/Custom Orthotics/03-custom-orthotic-construction.png", width: 758, height: 330, layout: "image-right",
    },
    prefabricated: {
      id: "orthotics-materials", title: "Different Materials, Different Feel",
      alt: "Layered blue contoured insert beside a grey cushioned insole with a blue heel pad",
      caption: "Cushioning and contour vary between products; no material is universally best.",
      imageSrc: "/journal/Custom Orthotics/05-materials-cushioning-support.png", width: 758, height: 333, layout: "image-left",
    },
    evidence: {
      id: "orthotics-comparison", title: "Compare the Fit, Not Just the Label",
      alt: "A blue contoured layered orthosis beside a flatter grey shoe insole",
      caption: "Two illustrative designs: appearance alone cannot establish whether an insert is custom-made.",
      imageSrc: "/journal/Custom Orthotics/02-custom-vs-standard-insoles.png", width: 757, height: 332, layout: "image-right",
    },
    assessment: {
      id: "orthotics-pressure-assessment", title: "Understanding Foot Pressure and Movement",
      alt: "Illustration of feet on a pressure platform while a clinician views coloured pressure patterns on a tablet",
      caption: "Pressure mapping can describe loading; it is one part of a broader clinical assessment.",
      imageSrc: "/journal/Custom Orthotics/04-foot-pressure-assessment.png", width: 757, height: 330, layout: "image-left",
    },
    footwear: {
      id: "orthotics-everyday-footwear", title: "How Orthotics Fit Into Everyday Footwear",
      alt: "Hands placing a blue contoured insert inside a white lace-up trainer",
      caption: "Check comfort, toe space and heel security with the insert inside the shoes you use.",
      imageSrc: "/journal/Custom Orthotics/06-orthotic-in-everyday-footwear.png", width: 757, height: 333, layout: "image-right",
    },
  },
  "preventing-recurrent-ingrown-nails": {
    meaning: {
      id: "ingrown-nail-anatomy",
      title: "The nail and surrounding skin",
      alt: "Labelled diagram of a toenail and nail folds showing where a nail edge can press into the surrounding skin",
      caption: "Anatomy: the nail edge and the adjacent skin fold.",
      large: true,
    },
    "routine-care": {
      id: "ingrown-nail-prevention",
      title: "Routine care versus a painful nail",
      alt: "Educational illustration of trimming an unaffected toenail across without cutting down its edges",
      caption:
        "Prevention: routine care of an unaffected nail differs from care of a painful ingrown nail.",
    },
    shoes: {
      id: "ingrown-nail-footwear",
      title: "Room around the toes",
      alt: "Comparison of toe room in a spacious shoe and a narrow pointed shoe",
      caption: "Footwear: consider pressure around the toe in work, sport and everyday shoes.",
    },
    procedure: {
      id: "ingrown-nail-treatment",
      title: "Understanding the proposed procedure",
      alt: "Non-graphic diagram identifying a portion of nail discussed during partial nail avulsion consent",
      caption: "Treatment: the clinician should explain the exact procedure and individual risks.",
    },
    aftercare: {
      id: "ingrown-nail-aftercare",
      title: "A clear recovery plan",
      alt: "Clean dressing supplies beside written clinician-provided nail procedure aftercare instructions",
      caption: "Aftercare: follow the instructions from the treating service.",
    },
  },
};

function EducationalImage({ placement }: { placement: ImagePlacement }) {
  // If imageSrc is provided, render the actual image
  if (placement.imageSrc) {
    return (
      <figure id={placement.id} className="min-w-0">
        <div className="relative w-full rounded-2xl overflow-hidden bg-background">
          <Image
            src={placement.imageSrc}
            alt={placement.alt}
            width={placement.width ?? 758}
            height={placement.height ?? 332}
            className="w-full h-auto"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 70vw, 520px"
          />
        </div>
        <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {placement.caption}
        </figcaption>
      </figure>
    );
  }

  // Fallback to placeholder if no imageSrc
  return (
    <figure
      id={placement.id}
      data-image-slot={placement.id}
      data-image-alt={placement.alt}
      className="min-w-0"
    >
      <div
        role="img"
        aria-label={`Future illustration: ${placement.alt}`}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-accent/30 bg-gradient-to-br from-secondary/60 to-background px-5 text-center ${placement.large ? "aspect-[16/9]" : "aspect-[4/3]"}`}
      >
        <ImageIcon aria-hidden="true" strokeWidth={1} className="size-9 text-accent/70" />
        <span className="font-serif text-xl text-heading">{placement.title}</span>
        <span className="text-xs text-muted-foreground">Approved illustration to be added</span>
        <code className="max-w-full break-words text-[10px] text-muted-foreground">
          {placement.id}
        </code>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {placement.caption}
      </figcaption>
    </figure>
  );
}

function SectionText({ section }: { section: Section }) {
  if (section.presentation === "steps")
    return (
      <ol className="space-y-5">
        {section.paragraphs.map((paragraph, index) => (
          <li key={paragraph} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <p className="leading-7">{paragraph}</p>
          </li>
        ))}
      </ol>
    );
  if (section.presentation === "bullets")
    return (
      <ul className="space-y-5">
        {section.paragraphs.map((paragraph) => (
          <li key={paragraph} className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
            <p className="leading-7">{paragraph}</p>
          </li>
        ))}
      </ul>
    );
  return (
    <div className="space-y-5">
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-7">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function EducationalSection({
  article,
  section,
}: {
  article: JournalArticle;
  section: Section;
}) {
  const placement = placements[article.slug]?.[section.id];
  // Pull a short, verbatim introduction into the card; keep every remaining
  // sentence in the full-width body rather than trapping it beside the image.
  const firstParagraph = section.paragraphs[0] ?? "";
  const sentences = firstParagraph.match(/[^.!?]+[.!?]+(?:[”"']|$)?|[^.!?]+$/g) ?? [firstParagraph];
  let contextText = sentences[0]?.trim() ?? "";
  if (sentences[1] && `${contextText} ${sentences[1]}`.trim().split(/\s+/).length <= 65) {
    contextText += sentences[1];
  }
  const paragraphRemainder = firstParagraph.slice(firstParagraph.indexOf(contextText) + contextText.length).trim();
  const remainingParagraphs = [paragraphRemainder, ...section.paragraphs.slice(1)].filter(Boolean);
  const warning = section.presentation === "warning";
  const treatmentComparison =
    article.slug === "recognising-early-signs-of-plantar-fasciitis" && section.id === "options";

  return (
    <section id={article.slug === "custom-orthotics-vs-off-the-shelf-insoles" ? undefined : section.id} className="mb-10 last:mb-0">
      <h2 className="mb-5 font-serif text-3xl leading-snug text-heading">{section.heading}</h2>

      {/* No image placement */}
      {!placement ? (
        <div className={warning ? "rounded-2xl border-l-4 border-gold bg-secondary/60 p-6" : ""}>
          {warning && (
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-heading">
              <AlertCircle aria-hidden="true" className="size-5" />
              When advice matters
            </p>
          )}
          {treatmentComparison ? (
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-left text-sm leading-7">
                <caption className="bg-secondary/60 p-4 text-left font-serif text-xl text-heading">
                  Management options in context
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="p-4">
                      Approach
                    </th>
                    <th scope="col" className="p-4">
                      Role in the plan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.paragraphs.map((paragraph, index) => (
                    <tr key={paragraph} className="border-t">
                      <th scope="row" className="p-4 align-top font-medium text-heading">
                        {index === 0 ? "Combined care and orthoses" : "Further treatment options"}
                      </th>
                      <td className="p-4">{paragraph}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <SectionText section={section} />
          )}
        </div>
      ) : (
        <>
          <div data-editorial-visual-row className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
            <div className={placement.layout === "image-right" ? "min-w-0 lg:order-2" : "min-w-0"}>
              <EducationalImage placement={placement} />
            </div>
            <aside className={`min-w-0 rounded-2xl border border-accent/10 bg-secondary/60 p-5 sm:p-6 ${placement.layout === "image-right" ? "lg:order-1" : ""}`}>
              <h3 className="mb-3 font-serif text-2xl leading-snug text-heading">{placement.title}</h3>
              <p className="text-base leading-7">{contextText}</p>
            </aside>
          </div>
          {remainingParagraphs.length > 0 && <div data-editorial-body className="mt-6">
            <SectionText section={{ ...section, paragraphs: remainingParagraphs }} />
          </div>}
        </>
      )}

      {/* Comparison table if present */}
      {section.comparison && (
        <div
          className="mt-7 overflow-x-auto rounded-2xl border"
          role="region"
          aria-label="Orthoses comparison"
          tabIndex={0}
        >
          <table className="w-full min-w-[30rem] text-left text-sm leading-6">
            <caption className="p-5 text-left font-serif text-xl text-heading">
              Prefabricated and custom orthoses: practical differences
            </caption>
            <thead className="bg-secondary">
              <tr>
                <th scope="col" className="p-4">
                  Feature
                </th>
                <th scope="col" className="p-4">
                  Custom Orthotics
                </th>
                <th scope="col" className="p-4">
                  Off-the-Shelf Insoles
                </th>
              </tr>
            </thead>
            <tbody>
              {section.comparison.map((row) => (
                <tr key={row.label} className="border-t">
                  <th scope="row" className="p-4 align-top font-medium">
                    {row.label}
                  </th>
                  <td className="p-4 align-top">{row.custom}</td>
                  <td className="p-4 align-top">{row.prefabricated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* References */}
      <p className="mt-5 text-xs text-muted-foreground">
        Sources:{" "}
        {section.references.map((n) => {
          const source = article.references[n - 1];
          return source ? (
            <a
              key={n}
              href={source.url}
              className="mr-3 underline underline-offset-4"
              aria-label={`Source ${n}: ${source.organisation}, ${source.title}`}
            >
              [{n}]
            </a>
          ) : null;
        })}
      </p>
    </section>
  );
}
