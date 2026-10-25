import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "../styles.css";

export const metadata: Metadata = {
  title: "Footwell Podiatry | Specialist Podiatrist in Marylebone, London",
  description: "HCPC-registered podiatry in Marylebone: gait analysis, custom orthotics, nail surgery and diabetic foot care for all ages.",
  applicationName: "Footwell Podiatry",
  openGraph: { type: "website", siteName: "Footwell Podiatry" },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
};

const themeInitializer = `(() => {
  try {
    const stored = localStorage.getItem("footwell-theme");
    const preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const resolved = preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {themeInitializer}
        </Script>
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
