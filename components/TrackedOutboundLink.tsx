"use client";

import type { ReactNode } from "react";
import type { OutboundDestination } from "@/lib/outbound-destinations";

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
