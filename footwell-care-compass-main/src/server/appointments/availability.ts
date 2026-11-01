import { TREATMENTS } from "@/config/clinic";

export const UK_TIME_ZONE = "Europe/London";
export const SLOT_INTERVAL_MINUTES = 30;
export const MAX_APPOINTMENT_DURATION_MINUTES = 240;

type LondonDateParts = Readonly<{ year: number; month: number; day: number }>;
type LondonTimeParts = LondonDateParts & Readonly<{ hour: number; minute: number }>;

export type AppointmentInterval = Readonly<{
  startsAt: Date;
  durationMinutes: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}>;

export type BookableSlot = Readonly<{
  time: string;
  startsAt: Date;
}>;

const londonDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: UK_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const londonDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: UK_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const londonOffsetFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: UK_TIME_ZONE,
  timeZoneName: "longOffset",
});

function partsToRecord(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function getDateParts(value: Date): LondonDateParts {
  const parts = partsToRecord(londonDateFormatter.formatToParts(value));
  return { year: Number(parts["year"]), month: Number(parts["month"]), day: Number(parts["day"]) };
}

function getDateTimeParts(value: Date): LondonTimeParts {
  const parts = partsToRecord(londonDateTimeFormatter.formatToParts(value));
  return {
    year: Number(parts["year"]),
    month: Number(parts["month"]),
    day: Number(parts["day"]),
    hour: Number(parts["hour"]),
    minute: Number(parts["minute"]),
  };
}

function parseDate(value: string): LondonDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

function parseTime(value: string): Readonly<{ hour: number; minute: number }> | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function offsetMinutesAt(value: Date): number {
  const offset = londonOffsetFormatter.formatToParts(value).find((part) => part.type === "timeZoneName")?.value;
  if (!offset || offset === "GMT") return 0;
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) throw new Error("Unable to determine London timezone offset.");
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "+" ? minutes : -minutes;
}

export function toLondonDateString(value: Date = new Date()): string {
  const { year, month, day } = getDateParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function londonDateTimeToUtc(date: string, time: string): Date | null {
  const dateParts = parseDate(date);
  const timeParts = parseTime(time);
  if (!dateParts || !timeParts) return null;

  const utcGuess = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, timeParts.hour, timeParts.minute),
  );
  const value = new Date(utcGuess.getTime() - offsetMinutesAt(utcGuess) * 60_000);
  const resolved = getDateTimeParts(value);
  if (
    resolved.year !== dateParts.year ||
    resolved.month !== dateParts.month ||
    resolved.day !== dateParts.day ||
    resolved.hour !== timeParts.hour ||
    resolved.minute !== timeParts.minute
  ) {
    return null;
  }
  return value;
}

export function getTreatmentDuration(treatmentName: string): number | null {
  return TREATMENTS.find((treatment) => treatment.name === treatmentName)?.mins ?? null;
}

function minutesSinceMidnight(time: string): number {
  const parsed = parseTime(time);
  if (!parsed) return Number.NaN;
  return parsed.hour * 60 + parsed.minute;
}

function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function openingHoursFor(date: string): Readonly<{ opensAt: number; closesAt: number }> | null {
  const parts = parseDate(date);
  if (!parts) return null;
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  if (weekday === 0) return null;
  if (weekday === 6) return { opensAt: 9 * 60, closesAt: 13 * 60 };
  if (weekday === 5) return { opensAt: 8 * 60, closesAt: 17 * 60 };
  return { opensAt: 8 * 60, closesAt: 19 * 60 };
}

export function listCandidateSlots(
  date: string,
  durationMinutes: number,
  now: Date = new Date(),
): BookableSlot[] {
  const hours = openingHoursFor(date);
  if (!hours || durationMinutes <= 0 || durationMinutes > MAX_APPOINTMENT_DURATION_MINUTES) return [];

  const slots: BookableSlot[] = [];
  for (
    let candidateMinutes = hours.opensAt;
    candidateMinutes + durationMinutes <= hours.closesAt;
    candidateMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const time = formatTime(candidateMinutes);
    const startsAt = londonDateTimeToUtc(date, time);
    if (startsAt && startsAt.getTime() > now.getTime()) slots.push({ time, startsAt });
  }
  return slots;
}

export function intervalsOverlap(
  firstStart: Date,
  firstDurationMinutes: number,
  secondStart: Date,
  secondDurationMinutes: number,
): boolean {
  const firstEnd = firstStart.getTime() + firstDurationMinutes * 60_000;
  const secondEnd = secondStart.getTime() + secondDurationMinutes * 60_000;
  return firstStart.getTime() < secondEnd && secondStart.getTime() < firstEnd;
}

export function filterAvailableSlots(
  candidates: readonly BookableSlot[],
  durationMinutes: number,
  appointments: readonly AppointmentInterval[],
): BookableSlot[] {
  return candidates.filter((slot) =>
    !appointments.some(
      (appointment) =>
        (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
        intervalsOverlap(slot.startsAt, durationMinutes, appointment.startsAt, appointment.durationMinutes),
    ),
  );
}

export function isCandidateSlot(
  date: string,
  time: string,
  durationMinutes: number,
  now: Date = new Date(),
): Date | null {
  return listCandidateSlots(date, durationMinutes, now).find((slot) => slot.time === time)?.startsAt ?? null;
}

export function rangeForLondonDate(date: string): Readonly<{ startsAt: Date; endsAt: Date }> | null {
  const startsAt = londonDateTimeToUtc(date, "00:00");
  const parts = parseDate(date);
  if (!startsAt || !parts) return null;
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  const nextDate = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  const endsAt = londonDateTimeToUtc(nextDate, "00:00");
  return endsAt ? { startsAt, endsAt } : null;
}

export function isPastLondonDate(date: string, now: Date = new Date()): boolean {
  return date < toLondonDateString(now);
}

export function isRecognisedSlotTime(value: string): boolean {
  return Number.isFinite(minutesSinceMidnight(value));
}
