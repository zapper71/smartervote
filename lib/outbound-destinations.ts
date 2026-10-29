/**
 * Outbound-link click buckets (tech-debt #1).
 *
 * This module deliberately has NO "use client" directive: the bucket
 * mapping is needed by server components (WebsiteLink runs on the
 * server) as well as by the client-side tracked link. Putting this
 * function inside the client TrackedOutboundLink module broke the
 * production build — Next.js refuses to let server code call a plain
 * function exported from a client module ("Attempted to call
 * platformToDestination() from the server but platformToDestination
 * is on the client"), failing static page generation. Shared,
 * framework-neutral code lives here instead.
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
