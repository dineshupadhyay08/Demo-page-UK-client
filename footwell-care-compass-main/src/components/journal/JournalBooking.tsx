"use client";
import { useState } from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import { ActionButton } from "@/components/shared/ActionButton";
export function JournalBooking() {
  const [open, setOpen] = useState(false);
  return <><ActionButton onClick={() => setOpen(true)}>Request an online consultation</ActionButton>
    {open && <BookingModal initialTreatment="" onClose={() => setOpen(false)} />}</>;
}
