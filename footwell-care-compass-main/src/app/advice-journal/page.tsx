import { redirect } from "next/navigation";

// Preserve old bookmarks without maintaining a second article listing.
export default function JournalPage() {
  redirect("/#journal");
}
