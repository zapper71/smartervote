"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizePath, type Locale } from "@/lib/i18n";

/**
 * Site footer. A client component because the locale comes from the
 * URL — the root layout has no locale of its own, so it passes BOTH
 * locales' chrome strings and this component picks by pathname (the
 * same pattern as LocaleHtmlLang). Links stay in the page language
 * via localizePath.
 */
export default function Footer({
  strings,
}: {
  /** Localised chrome strings (footer.* + nav.how_it_works), keyed by locale. */
  strings: Record<Locale, Record<string, string>>;
}) {
  const pathname = usePathname() ?? "";
  const locale: Locale = pathname.startsWith("/fr") ? "fr" : "en";
  const s = strings[locale];
  return (
    <footer className="mt-16 border-t border-paper-edge bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-ink-soft">
        {/* R17 mitigation. This is not boilerplate — smartvoting.ca is an
            openly partisan strategic-voting site with a confusingly similar
            name, and being mistaken for it would end this project's
            credibility. It appears on every page, deliberately. */}
        <div className="rounded-lg border border-paper-edge bg-paper-warm p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink">
            {s["footer.independent_heading"]}
          </h2>
          <p className="leading-relaxed">{s["footer.independent_body"]}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href={localizePath("/methodology", locale)} className="link tap-target">
            {s["nav.how_it_works"]}
          </Link>
          <Link href={localizePath("/corrections", locale)} className="link tap-target">
            {s["footer.report_correction"]}
          </Link>
          <Link href={localizePath("/privacy", locale)} className="link tap-target">
            {s["footer.privacy"]}
          </Link>
                    <a
            href="https://www.gofundme.com/f/smartervoteca-grow-and-cover-more-elections"
            className="link tap-target"
            rel="noopener noreferrer"
            target="_blank"
          >
            {s["footer.donate"]}
          </a>
        </div>

        <p className="mt-6 text-xs text-ink-faint">{s["footer.about_site"]}</p>
      </div>
    </footer>
  );
}
