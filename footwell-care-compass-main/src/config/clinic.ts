import {
  Activity,
  Footprints,
  HeartPulse,
  Microscope,
  Printer,
  Scissors,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const CLINIC = {
  name: "Footwell Podiatry",
  phone: "020 7946 0321",
  email: "hello@footwellpodiatry.co.uk",
  address: "42 Wimpole Street, Marylebone, London W1G 8YF",
  practitioner: "Dr Eleanor Hart",
} as const;

export const PRACTITIONER_PROFILE = {
  name: "Dr. Alex Morgan",
  role: "Lead Podiatrist · Qualifications to be confirmed",
  portrait: {
    src: "/practitioner-placeholder.svg",
    alt: "Temporary placeholder portrait for Footwell Care Compass's lead podiatrist",
  },
  introduction:
    "Footwell Care Compass is designed around thoughtful, patient-centred foot care. Our approach focuses on understanding each patient's concerns, explaining available options clearly, and helping them make informed decisions about their care.",
  philosophy:
    "Good foot care starts with listening, understanding your needs, and creating a plan that works for you.",
  credentials: [
    ["Professional registration", "To be confirmed"],
    ["Qualifications", "To be confirmed"],
    ["Clinical interests", "To be confirmed"],
    ["Appointment options", "In-clinic and video consultations, subject to availability"],
    ["Patient approach", "Individualised, patient-centred care"],
  ],
} as const;

export type TreatmentCategory =
  "Routine Foot Care" | "Sports & Biomechanics" | "Minor Surgery" | "Diabetic Foot Health";

export type Treatment = {
  cat: TreatmentCategory;
  name: string;
  mins: number;
  from: number;
  symptoms: string[];
  icon: LucideIcon;
};

export const TREATMENTS: Treatment[] = [
  {
    cat: "Routine Foot Care",
    name: "General Podiatry Appointment",
    mins: 40,
    from: 65,
    symptoms: ["Hard skin", "Corns", "Thickened nails"],
    icon: Footprints,
  },
  {
    cat: "Routine Foot Care",
    name: "Medical Pedicure",
    mins: 50,
    from: 75,
    symptoms: ["Callus", "Cracked heels", "Nail care"],
    icon: Sparkles,
  },
  {
    cat: "Sports & Biomechanics",
    name: "Biomechanical & Gait Assessment",
    mins: 60,
    from: 140,
    symptoms: ["Heel pain", "Runner's knee", "Shin splints"],
    icon: Activity,
  },
  {
    cat: "Sports & Biomechanics",
    name: "Custom 3D-Printed Orthotics",
    mins: 45,
    from: 395,
    symptoms: ["Flat feet", "Arch pain", "Overpronation"],
    icon: Printer,
  },
  {
    cat: "Minor Surgery",
    name: "Partial Nail Avulsion (PNA)",
    mins: 75,
    from: 450,
    symptoms: ["Ingrown toenail", "Recurrent infection"],
    icon: Scissors,
  },
  {
    cat: "Minor Surgery",
    name: "Verruca Treatment (Swift / Needling)",
    mins: 30,
    from: 120,
    symptoms: ["Persistent verruca", "Painful lesion"],
    icon: Microscope,
  },
  {
    cat: "Diabetic Foot Health",
    name: "Diabetic Foot Assessment",
    mins: 45,
    from: 85,
    symptoms: ["Numbness", "Poor circulation", "Annual check"],
    icon: HeartPulse,
  },
  {
    cat: "Diabetic Foot Health",
    name: "Wound & Ulcer Care Review",
    mins: 40,
    from: 90,
    symptoms: ["Slow-healing wound", "Skin breakdown"],
    icon: ShieldCheck,
  },
];

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  "Routine Foot Care",
  "Sports & Biomechanics",
  "Minor Surgery",
  "Diabetic Foot Health",
];

export const PRIMARY_NAVIGATION = [
  ["Treatments & Services", "#treatments"],
  ["Biomechanics & Orthotics", "#technology"],
  ["About the Clinic", "#about"],
  ["Patient Stories", "#stories"],
  ["Advice & Journal", "#journal"],
] as const;
