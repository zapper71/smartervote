import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * hreflang alternates for a page whose English path is `enPath`.
 * The canonical URL is always the English one (decision D1: English
 * keeps today's URLs; French lives under /fr/…). Both the English
 * route and its /fr wrapper use the same alternates object.
 */
export function pageAlternates(enPath: string): Metadata["alternates"] {
  const en = `${SITE_URL}${enPath}`;
  const fr = enPath === "/" ? `${SITE_URL}/fr` : `${SITE_URL}/fr${enPath}`;
  return { canonical: en, languages: { en, fr } };
}
