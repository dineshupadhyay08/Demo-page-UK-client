import Link from "next/link";

export default function NotFound() { return <main className="flex min-h-screen items-center justify-center px-4"><div className="text-center"><h1 className="text-3xl text-heading">Page not found</h1><Link href="/" className="mt-6 inline-block text-accent underline">Go home</Link></div></main>; }
