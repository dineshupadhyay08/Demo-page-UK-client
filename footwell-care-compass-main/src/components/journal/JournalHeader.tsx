"use client";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BookingModal } from "@/components/booking/BookingModal";

export function JournalHeader() {
  const [booking, setBooking] = useState(false);
  return <><SiteHeader onBook={() => setBooking(true)} />{booking && <BookingModal initialTreatment="" onClose={() => setBooking(false)} />}</>;
}
