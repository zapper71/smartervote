import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

/**
 * /robots.txt
 *
 * Two states, and only two.
 *
 * Before launch: disallow everything. The meta robots tag in layout.tsx says
 * the same thing, and saying it twice is deliberate — a crawler that ignores
 * one may honour the other, and the cost of belt-and-braces here is a file
 * nobody reads.
 *
 * After launch: allow everything except /admin. Note that /admin does not
 * exist in production at all — ADMIN_PASSWORD is deliberately unset there, so
 * the route renders a "no admin here" page rather than a login. The disallow
 * is defence in depth for a day when that changes and somebody forgets.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
