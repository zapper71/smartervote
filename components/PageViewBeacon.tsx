"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Anonymous page-view beacon for SmarterVote's own counter.
 *
 * Sends one fire-and-forget request per page view to /api/track with nothing
 * but the path. No cookies, no identifiers, no user agent, no referrer —
 * the server stores path + hour + count and nothing else (see the Privacy
 * page and supabase/21_page_view_counter.sql).
 *
 * Skipped entirely outside production (so local dev and previews don't
 * pollute the counts) and on /admin pages (internal use, not voter traffic).
 */
export default function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {
        /* analytics must never break the page */
      });
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
