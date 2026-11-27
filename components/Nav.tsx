"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { localizePath, type Locale } from "@/lib/i18n";
import type { Language } from "@/lib/types";

/**
 * Site navigation. A client component because the locale comes from the
 * URL — the root layout has no locale of its own, so it passes BOTH
 * locales' chrome strings and this component picks by pathname (the
 * same pattern as LocaleHtmlLang). Links stay in the page language
 * via localizePath.
 */
export default function Nav({
  languages,
  strings,
}: {
  languages: Language[];
  /** Localised chrome strings (nav.* + site.tagline), keyed by locale. */
  strings: Record<Locale, Record<string, string>>;
}) {
  const pathname = usePathname() ?? "";
  const locale: Locale = pathname.startsWith("/fr") ? "fr" : "en";
  const s = strings[locale];
  const links = [
    { href: "/", label: s["nav.home"] },
    { href: "/races", label: s["nav.races"] },
    { href: "/methodology", label: s["nav.how_it_works"] },
    { href: "/about", label: s["nav.about"] },
  ];
  return (
    <header className="border-b border-paper-edge bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        {s["nav.skip_link"]}
      </a>
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link
          href={localizePath("/", locale)}
          className="tap-target items-end font-semibold tracking-tight text-ink no-underline"
        >
          <span className="text-lg">Smarter</span>
          <span className="text-lg text-accent">Vote</span>
          <span className="text-lg">.ca</span>
          <span className="ml-2 hidden pb-0.5 text-sm font-normal text-ink-faint sm:inline">
            {s["site.tagline"]}
          </span>
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={localizePath(l.href, locale)}
                className="tap-target rounded px-3 py-2 text-ink-soft no-underline hover:bg-accent-light hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
                </ul>
        <div className="flex items-center gap-1">
          <LanguageSwitcher languages={languages} />
          <a
            href="https://www.gofundme.com/f/smartervoteca-grow-and-cover-more-elections"
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:bg-accent-hover"
          >
            {s["nav.donate"]}
          </a>
        </div>
      </nav>
    </header>
  );
}
