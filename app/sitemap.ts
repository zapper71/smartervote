import type { MetadataRoute } from "next";
import { getRacesWithCandidates } from "@/lib/queries";
import { INDEXABLE, SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml
 *
 * Empty until the site is indexable, so there is nothing for a crawler to
 * follow into an unfinished site. /admin and /status are never listed:
 * /admin does not exist in production, and /status is a diagnostic for you,
 * not a page a voter should land on from a search result.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!INDEXABLE) return [];

  const now = new Date();

  const staticPages = ["", "/races", "/methodology", "/about", "/corrections", "/privacy"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  // If the database is unreachable at build time we still want a valid
  // sitemap of the static pages rather than a failed build.
  let racePages: MetadataRoute.Sitemap = [];
  try {
    const races = await getRacesWithCandidates();
    racePages = races.flatMap((race) => [
      {
        url: `${SITE_URL}/races/${race.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/races/${race.slug}/compare`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      ...race.candidates.map((c) => ({
        url: `${SITE_URL}/races/${race.slug}/${c.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ]);
  } catch {
    racePages = [];
  }

  return [...staticPages, ...racePages];
}
