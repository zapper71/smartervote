import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { localePrefix, NON_DEFAULT_LOCALES } from "@/lib/i18n";

/**
 * hreflang alternates for a page whose English path is `enPath`.
 * The canonical URL is always the English one (decision D1: English
 * keeps today's URLs; every other language lives under its own
 * prefix). All routes — English and every locale wrapper — use the
 * same alternates object.
 */
export function pageAlternates(enPath: string): Metadata["alternates"] {
  const en = `${SITE_URL}${enPath}`;
  const languages: Record<string, string> = { en };
  for (const locale of NON_DEFAULT_LOCALES) {
    const prefix = localePrefix(locale);
    languages[locale] =
      enPath === "/" ? `${SITE_URL}${prefix}` : `${SITE_URL}${prefix}${enPath}`;
  }
  return { canonical: en, languages };
}
