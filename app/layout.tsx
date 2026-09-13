import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartervote.ca"),
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
  robots: { index: true, follow: true },
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
      </body>
    </html>
  );
}
