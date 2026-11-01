import Link from "next/link";
import { JournalHeader } from "@/components/journal/JournalHeader";
export function JournalShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">
    <a href="#journal-main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to journal content</a>
    <JournalHeader />
    <main id="journal-main">{children}</main>
    <footer className="mt-16 border-t px-5 py-10 text-center text-sm text-muted-foreground"><p>Footwell Podiatry · Advice & Journal</p><Link href="/" className="mt-3 inline-block underline underline-offset-4">Return to the clinic</Link></footer>
  </div>;
}
