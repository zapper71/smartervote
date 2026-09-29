import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SmarterVote — Huntsville 2026 municipal election",
    template: "%s · SmarterVote",
  },
  description:
    "A free, non-partisan guide to the candidates in the Town of Huntsville's 2026 municipal and school board election. Compare what candidates actually say, side by side, with a source for every claim.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "SmarterVote",
  },
  // Off until SITE_INDEXABLE=true is set in Vercel. See lib/site.ts — the
  // site is deployed before it is finished, and an unfinished snapshot in
  // Google is slow to correct and unfair to the candidates in it.
  robots: INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-CA">
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
