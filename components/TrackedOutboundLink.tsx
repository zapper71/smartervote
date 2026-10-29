"use client";

import type { ReactNode } from "react";

/**
 * An outbound link that counts the click, anonymously, in aggregate.
 *
 * Mirrors the PageViewBeacon pattern (components/PageViewBeacon.tsx):
 * one fire-and-forget request to /api/track-click carrying nothing but
 * the destination type. No cookies, no identifiers, no user agent, no
 * referrer, no path, no candidate — the server stores destination type
 * + hour + count and nothing else (see
 * supabase/45_link_click_counter.sql).
 *
 * The beacon never delays navigation and never breaks the page: it
 * uses sendBeacon where available, falls back to a keepalive fetch,
 * and swallows every failure. Skipped entirely outside production
 * (so local dev and previews don't pollute the counts) and on /admin
 * pages (internal use, not voter traffic).
 */

export type OutboundDestination =
  | "source"
  | "website"
  | "facebook"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "email"
  | "other";

/** Map a verified-link platform string to its click-count bucket. */
export function platformToDestination(platform: string): OutboundDestination {
  switch (platform.toLowerCase()) {
    case "facebook":
      return "facebook";
    case "instagram":
      return "instagram";
    case "youtube":
      return "youtube";
    case "linkedin":
      return "linkedin";
    case "tiktok":
      return "tiktok";
    default:
      return "other";
  }
}

export default function TrackedOutboundLink({
  href,
  destination,
  className,
  rel,
  target,
  children,
}: {
  href: string;
  destination: OutboundDestination;
  className?: string;
  rel?: string;
  target?: string;
  children: ReactNode;
}) {
  const handleClick = () => {
    try {
      if (process.env.NODE_ENV !== "production") return;
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
      )
        return;
      const body = JSON.stringify({ destination_type: destination });
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        navigator.sendBeacon(
          "/api/track-click",
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch("/api/track-click", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {
          /* analytics must never break the page */
        });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <a
      href={href}
      className={className}
      rel={rel}
      target={target}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
