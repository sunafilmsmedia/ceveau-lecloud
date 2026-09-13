import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LOCALE } from "@/lib/site";
import "./globals.css";

const manrope = localFont({
  src: "./fonts/Manrope-Variable.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

const bodoni = localFont({
  src: "./fonts/BodoniModa-Italic.woff2",
  variable: "--font-brand",
  display: "swap",
  style: "italic",
  weight: "400 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Diagnostic IA gratuit de ton entreprise · Le Cloud AI",
    template: "%s · Le Cloud AI",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "diagnostic IA",
    "audit intelligence artificielle PME",
    "automatisation entreprise Québec",
    "employé IA",
    "gains de productivité IA",
    "consultation IA",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: SITE_LOCALE,
    title: "Diagnostic IA gratuit de ton entreprise · Le Cloud AI",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnostic IA gratuit de ton entreprise · Le Cloud AI",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${manrope.variable} ${bodoni.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
