import type { Socials, VerifiedLink } from "@/lib/types";

/**
 * Everywhere a candidate is listed, this shows how to reach them directly:
 * their campaign website and their social accounts, in one consistent block.
 *
 * Why it's one component: the same wording and the same visual weight must
 * appear on every page, or the site starts treating candidates differently
 * depending on where you happen to be looking. That's the fairness rule from
 * the methodology page, enforced by there being only one place to change it.
 *
 * ============================================================
 * WE NEVER CONSTRUCT A SOCIAL MEDIA URL. EVER. READ THIS FIRST.
 * ============================================================
 *
 * An earlier version of this component built URLs from the handles the Town
 * publishes — turning `"facebook":"jamesbowler"` into facebook.com/jamesbowler.
 * That link went to a completely different James Bowler, in South Carolina.
 *
 * That is not a broken link. It is a FABRICATED FACT: an assertion that a
 * particular page belongs to a particular candidate, which nobody ever
 * checked. It attaches a stranger's identity and posts to someone standing
 * for office. If that stranger writes something ugly, a Huntsville voter could
 * reasonably attribute it to their District council candidate.
 *
 * It is the same failure the `published_needs_source` database constraint
 * exists to prevent for quotes — asserting something without a source — and it
 * slipped through only because links weren't covered by that rule.
 *
 * THE RULE NOW:
 *   - `website` is LINKED. The Town published it as a URL on the certified
 *     candidate list; we are passing along a published address, not inventing
 *     one.
 *   - `socials` is TEXT, never a link. The Town publishes these as free-text
 *     handles and page names, which are not addresses and cannot be turned
 *     into addresses by guessing.
 *   - `verified_links` is LINKED. A URL earns a place there two ways:
 *       (a) the candidate published the address themselves on their own
 *           campaign site — we are relaying an address they chose to give
 *           out, exactly as we do with `website`; or
 *       (b) a person here opened the page and confirmed it is them.
 *     Either way the row records where it came from, so any link on this
 *     site can be traced back to why we believed it.
 *
 * The distinction that matters is NOT "how confident are we". It is whether
 * the address was PUBLISHED BY SOMEONE or ASSEMBLED BY US. A published
 * address can be wrong, and then it is the publisher's error and is
 * correctable. A constructed address is our assertion about a stranger's
 * page, made from a name — and names repeat.
 *
 * If you are tempted to reintroduce URL construction because "most of them
 * work": most is not all, and the ones that fail defame people.
 */

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  twitter: "X",
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // Never let a malformed URL in the data break a page render.
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export default function WebsiteLink({
  website,
  socials,
  verifiedLinks,
  candidateName,
  className = "",
}: {
  website: string | null | undefined;
  socials?: Socials | null;
  /**
   * Social URLs a person has actually opened and confirmed belong to this
   * candidate. ONLY these get linked. Anything not in here is shown as text.
   */
  verifiedLinks?: VerifiedLink[] | null;
  candidateName: string;
  className?: string;
}) {
  const entries = Object.entries(socials ?? {}).filter(
    ([, v]) => typeof v === "string" && v.trim().length > 0
  ) as [string, string][];

  const verified = (verifiedLinks ?? []).filter((l) => l?.url && l?.label);
  const verifiedPlatforms = new Set(
    verified.map((l) => l.platform?.toLowerCase()).filter(Boolean)
  );

  if (!website && entries.length === 0 && verified.length === 0) {
    return (
      <span className={`text-ink-faint ${className}`}>
        No website or social media listed
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      {website && (
        <a
          href={website}
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          {hostname(website)}
          <span className="sr-only">
            {" "}
            — {candidateName}&rsquo;s campaign website, opens in a new tab
          </span>
          <span aria-hidden="true" className="ml-0.5 text-xs">
            ↗
          </span>
        </a>
      )}

      {/* Verified links: a person opened these and confirmed the identity. */}
      {verified.map((l) => (
        <a
          key={l.url}
          href={l.url}
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          {l.label}
          <span className="sr-only">
            {" "}
            — {candidateName} on {l.label}, verified, opens in a new tab
          </span>
          <span aria-hidden="true" className="ml-0.5 text-xs">
            ↗
          </span>
        </a>
      ))}

      {/* Unverified: the Town's free text, shown as text. Never a link.
          Skipped entirely if we already have a verified link for that
          platform, so a candidate isn't listed twice. */}
      {entries
        .filter(([platform]) => !verifiedPlatforms.has(platform.toLowerCase()))
        .map(([platform, handle]) => (
          <span key={platform} className="text-ink-faint">
            {SOCIAL_LABELS[platform] ?? platform}: {handle}
          </span>
        ))}
    </span>
  );
}
