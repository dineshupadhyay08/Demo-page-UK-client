import { BOOKING_NOTICE_VERSION } from "@/config/booking-privacy";
export default function BookingPrivacy() {
  return <main className="mx-auto max-w-2xl space-y-5 px-6 py-12">
    <h1 className="text-3xl font-semibold">Booking privacy notice</h1>
    <p>Version {BOOKING_NOTICE_VERSION}. Interim booking information pending clinic approval.</p>
    <p>The booking form stores your submitted contact details, selected treatment, appointment time and any optional note with your request. The form records when you acknowledge this notice.</p>
    <p>If email notifications are enabled, a request acknowledgement is sent to the address supplied and a notification to the clinic. Supporting files selected in the form stay on your device.</p>
    <p>The clinic still needs to confirm its lawful basis, retention periods, processor information and contact for privacy rights requests before production use.</p>
  </main>;
}
