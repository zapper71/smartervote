import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageViewBeacon from "@/components/PageViewBeacon";
import LocaleHtmlLang from "@/components/LocaleHtmlLang";
import { getLanguages, getUiStrings } from "@/lib/queries";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import { ALL_LOCALES, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SmarterVote — Canadian elections. Candidates side-by-side on the issues. No BS.",
    template: "%s · SmarterVote",
  },
  description:
    "Canadian elections. Candidates side-by-side on the issues. No BS.",
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

/**
 * Chrome strings for Nav + Footer, in every enabled locale. The root
 * layout has no locale of its own, so it fetches each language and the
 * client Nav/Footer pick by pathname (same pattern as LocaleHtmlLang).
 * A failed read degrades to the English fallbacks — the chrome never
 * blocks a page. Locales with no rows yet (a language enabled before
 * its translations land) render English chrome.
 */
const CHROME_KEYS = {
  "site.tagline": "Candidates side-by-side on the issues. No BS.",
  "nav.skip_link": "Skip to main content",
  "nav.home": "Home",
  "nav.races": "Races",
  "nav.how_it_works": "How this works",
  "nav.about": "About",
  "nav.donate": "Donate",
  "footer.independent_heading": "SmarterVote is independent and non-partisan",
  "footer.independent_body":
    "We do not endorse, rank or recommend any candidate, and we do not tell anyone how to vote. We are not affiliated with any political party, campaign, or with any other similarly named website. Everything here is drawn from what candidates have published themselves or from local news reporting, and every claim carries a link to its source.",
  "footer.report_correction": "Report a correction",
  "footer.privacy": "Privacy",
  "footer.donate": "Donate to support SmarterVote",
  "footer.about_site":
    "Built and run by one person, for free, with no advertising. Reader donations help keep it running. Candidate information is sourced from the official candidate lists published by the election authority for each race. For official information about voting — registering, where and when to vote, deadlines, and results — always check the authority running your election.",
} as const;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const languages = await getLanguages();
  const chromeEn = await getUiStrings("en", CHROME_KEYS);
  const byLocale: Record<string, Record<string, string>> = { en: chromeEn };
  await Promise.all(
    languages
      .filter((l) => l.code !== "en")
      .map(async (l) => {
        byLocale[l.code] = await getUiStrings(l.code, CHROME_KEYS);
      })
  );
  const strings = {} as Record<Locale, Record<string, string>>;
  for (const loc of ALL_LOCALES) strings[loc] = byLocale[loc] ?? chromeEn;
  return (
    <html lang="en-CA">
      <body className="flex min-h-screen flex-col">
        <LocaleHtmlLang />
        <Nav languages={languages} strings={strings} />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer strings={strings} />
        <Analytics />
        <PageViewBeacon />
      </body>
    </html>
  );
}
