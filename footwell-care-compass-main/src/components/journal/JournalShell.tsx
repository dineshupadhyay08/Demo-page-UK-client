import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
export function JournalShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">
    <a href="#journal-main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to journal content</a>
    <header className="border-b bg-background"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
      <Link href="/" className="flex items-center gap-2.5 font-serif text-xl text-heading"><Image src="/brand-mark.svg" alt="" width={28} height={28} />Footwell Podiatry</Link>
      <nav aria-label="Journal navigation" className="flex flex-wrap items-center gap-4 text-sm"><Link href="/">Home</Link><Link href="/#journal">Clinical Insights</Link><ThemeToggle /></nav>
    </div></header>
    <main id="journal-main">{children}</main>
    <footer className="mt-16 border-t px-5 py-10 text-center text-sm text-muted-foreground"><p>Footwell Podiatry · Advice & Journal</p><Link href="/" className="mt-3 inline-block underline underline-offset-4">Return to the clinic</Link></footer>
  </div>;
}
