import Link from "next/link";
import { formatShortDate } from "@/lib/dates";
import type { Position } from "@/lib/types";

/**
 * One candidate's answer on one issue.
 *
 * Takes an ARRAY, not a single position, because a candidate can have said
 * materially different things in different places. When that happens we show
 * every statement with its own quote and source, flagged as conflicting —
 * rather than picking one and quietly discarding the other, which would be an
 * editorial judgment about which statement "really" counts.
 *
 * A cell is never silently empty. Every state is labelled.
 */

/**
 * Deep link to the candidate's full email reply.
 *
 * Shown under a cell only when the cell holds a position parsed from that
 * reply (source_type = 'candidate_submission') — the parent decides that
 * and passes the link, so this component never has to know what an email
 * reply is.
 */
export interface FullResponseLink {
  href: string;
  label: string;
}

function FullResponseNote({ link }: { link: FullResponseLink }) {
  // Same-page anchors stay a native <a>: the response component on the
  // candidate page listens for hashchange to auto-open the expander, and
  // a Next.js client-side nav would swallow that event. Cross-page links
  // use Next <Link>; the destination page opens the expander from the
  // hash on mount instead.
  return (
    <p className="mt-2 text-xs">
      {link.href.startsWith("#") ? (
        <a href={link.href} className="link">
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className="link">
          {link.label}
        </Link>
      )}
    </p>
  );
}

function ConflictPill() {

  return (
    <span className="pill border border-red-300 bg-red-50 text-red-800">
      Conflicting Position
    </span>
  );
}

/**
 * How much the candidate published on this issue, in brackets.
 *
 * This is the only thing on the page that speaks to the DEPTH of an answer,
 * and it is deliberately the dullest possible treatment: plain text, same
 * muted grey as the source line, no colour, no icon, no scale, no ordering.
 *
 * A filled/half/empty dot was the obvious design and is the wrong one. A
 * visual scale is a rating, and this would be rating candidates on how much
 * they wrote — which tracks money, staff and web savvy far better than it
 * tracks conviction. The fact goes on the page; the conclusion stays with
 * the reader.
 *
 * Renders nothing when unset.
 */
function ExtentNote({ p, className = "" }: { p: Position; className?: string }) {
  if (!p.source_extent) return null;
  return (
    <span className={`text-ink-faint ${className}`}>({p.source_extent})</span>
  );
}

function SourceLine({ p }: { p: Position }) {
  return (
    <p className="mt-2 text-xs text-ink-faint">
      Source:{" "}
      {p.source_url ? (
        <a
          href={p.source_url}
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          {p.source_title ?? p.source_url}
        </a>
      ) : (
        (p.source_title ?? "—")
      )}
      {p.source_date ? ` · ${formatShortDate(p.source_date)}` : ""}
    </p>
  );
}

function SinglePosition({
  p,
  showQuoteInline,
  fullResponseLink,
}: {
  p: Position;
  showQuoteInline: boolean;
  fullResponseLink?: FullResponseLink | null;
}) {
  return (
    <div>
      {p.summary_short && (
        <p className="text-sm font-medium leading-snug text-ink">{p.summary_short}</p>
      )}

      {p.summary_bullets && p.summary_bullets.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-snug text-ink-soft">
          {p.summary_bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {p.verbatim_quote &&
        (showQuoteInline ? (
          <>
            <blockquote className="mt-2 border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-ink-soft">
              &ldquo;{p.verbatim_quote}&rdquo;
            </blockquote>
            {/* The quote is already visible, so the note rides with the
                source line rather than on a toggle that isn't there.
                Guarded, or an unset extent leaves an empty paragraph with a
                top margin and the source line drifts down for no reason. */}
            {p.source_extent && (
              <p className="mt-1 text-xs">
                <ExtentNote p={p} />
              </p>
            )}
            <SourceLine p={p} />
          </>
        ) : (
          <details className="group mt-2">
            {/* min-h-[24px] is WCAG 2.2 SC 2.5.8 (Target Size). At text-xs
                this control was about 16px tall. The inline exception does
                not rescue it: it sits on its own line rather than inside a
                sentence, so the 24x24 minimum applies. This is the control a
                reader uses to check our evidence — it should not be the
                hardest thing on the page to hit. */}
            <summary className="inline-flex min-h-[24px] cursor-pointer list-none items-center text-xs font-medium text-accent hover:underline">
              <span className="group-open:hidden">Show their words &amp; source</span>
              <span className="hidden group-open:inline">Hide</span>{" "}
              {/* Stays visible whether the details element is open or shut:
                  it describes the source, not the disclosure state. */}
              <ExtentNote p={p} className="font-normal" />
            </summary>
            <blockquote className="mt-2 border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-ink-soft">
              &ldquo;{p.verbatim_quote}&rdquo;
            </blockquote>
            <SourceLine p={p} />
          </details>
        ))}
      {fullResponseLink && <FullResponseNote link={fullResponseLink} />}
    </div>
  );
}

/**
 * What an empty cell says.
 *
 * This is the most-read text on the site, because most cells are empty for
 * most candidates, and it is the easiest place to be quietly unfair.
 *
 * "No public statement found" is true but it describes the candidate. If we
 * have written to them and heard nothing, the honest line describes US
 * instead — we asked, on this date, and are still waiting. A reader can
 * weigh that. They cannot weigh a blank.
 *
 * The order matters: the strongest fact we hold about our own effort goes
 * first, so that the least-covered candidates — who are disproportionately
 * first-time and lower-resourced — are not left looking evasive for a gap
 * that is ours.
 */
function EmptyNote({
  contactedAt,
  respondedAt,
  lookedAt,
}: {
  contactedAt?: string | null;
  respondedAt?: string | null;
  lookedAt?: string | null;
}) {
  if (contactedAt && respondedAt) {
    return (
      <>
        We asked on {formatShortDate(contactedAt)}. They replied on{" "}
        {formatShortDate(respondedAt)} but haven&rsquo;t given a position on this.
      </>
    );
  }
  if (contactedAt) {
    return <>We asked on {formatShortDate(contactedAt)} &mdash; no reply yet.</>;
  }
  if (lookedAt) {
    return <>No public statement found as of {formatShortDate(lookedAt)}.</>;
  }
  return <>Not reviewed yet.</>;
}

export default function PositionCell({
  positions,
  correctionHref,
  contactedAt,
  respondedAt,
  lookedAt,
  fullResponseLink,
}: {
  positions: Position[];
  correctionHref: string;
  /** When we emailed this candidate, if we have. */
  contactedAt?: string | null;
  /** When they replied, if they did. */
  respondedAt?: string | null;
  /** When we last searched the public record for them. */
  lookedAt?: string | null;
  /** Deep link to their full email reply; shown only under email-built cells. */
  fullResponseLink?: FullResponseLink | null;
}) {
  if (positions.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        <span className="italic">
          <EmptyNote
            contactedAt={contactedAt}
            respondedAt={respondedAt}
            lookedAt={lookedAt}
          />
        </span>{" "}
        <Link href={correctionHref} className="link">
          Know something?
        </Link>
      </p>
    );
  }

  const real = positions.filter((p) => !p.no_public_position);

  // Every row is a "we looked and found nothing" marker. Guarding on
  // real.length rather than positions.length matters: now that a candidate can
  // have several rows per issue, "one row, no public position" is no longer the
  // only shape this state can take, and indexing real[0] on an empty array
  // would crash the whole page.
  if (real.length === 0) {
    const reviewedAt = positions.find((p) => p.reviewed_at)?.reviewed_at ?? null;
    return (
      <p className="text-sm text-ink-faint">
        <span className="italic">
          <EmptyNote
            contactedAt={contactedAt}
            respondedAt={respondedAt}
            lookedAt={reviewedAt ?? lookedAt}
          />
        </span>{" "}
        <Link href={correctionHref} className="link">
          Tell us if we missed it.
        </Link>
      </p>
    );
  }

  if (real.length === 1) {
    return (
      <SinglePosition
        p={real[0]}
        showQuoteInline={false}
        fullResponseLink={fullResponseLink}
      />
    );
  }

  // MORE THAN ONE STATEMENT ON THE SAME ISSUE.
  //
  // Two rows does NOT mean the candidate contradicted themselves. It usually
  // means they said compatible things in two places — a campaign website and an
  // all-candidates meeting, say. An earlier version of this component treated
  // `real.length > 1` as proof of conflict, which would have printed a red
  // "Conflicting Position" pill over a candidate who had simply been consistent
  // twice. That is an accusation, not a layout choice, and it is exactly the
  // class of unearned assertion the rest of this site is built to prevent.
  //
  // Only the is_conflicting flag — set deliberately, by a person, on every row
  // of the set — means conflict.
  const conflicting = real.some((p) => p.is_conflicting);

  return (
    <div>
      {conflicting ? (
        <>
          <ConflictPill />
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            This candidate has said different things about this issue in
            different places. Both are shown below, with their sources. We
            haven&rsquo;t chosen between them.
          </p>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-ink-faint">
          This candidate has spoken about this issue more than once. Each
          statement is shown with its own source.
        </p>
      )}

      {/* Quotes show inline rather than behind a toggle whenever there is more
          than one. If a voter is being shown several statements, hiding the
          evidence behind a click defeats the point of showing them. */}
      <div className="mt-3 space-y-3">
        {real.map((p, i) => (
          <div
            key={p.id}
            className={i > 0 ? "border-t border-paper-edge pt-3" : undefined}
          >
               <SinglePosition
              p={p}
              showQuoteInline
              fullResponseLink={fullResponseLink}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs">
        <Link href={correctionHref} className="link">
          {conflicting ? "Think we’ve misread this?" : "Think we’ve got this wrong?"}
        </Link>
      </p>
    </div>
  );
}
