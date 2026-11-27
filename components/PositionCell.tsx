import type { ReactNode } from "react";
import Link from "next/link";
import ConfidencePill from "@/components/ConfidencePill";
import TrackedOutboundLink from "@/components/TrackedOutboundLink";
import TranslatedQuote from "@/components/TranslatedQuote";
import TranslatedText from "@/components/TranslatedText";
import { formatShortDate } from "@/lib/dates";
import { formatUi, type Locale, type ResolvedText } from "@/lib/i18n";
import type { PositionLocalization } from "@/components/pages/localize-content";
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
 *
 * Localised rendering: `localized` (from localizePageContent, keyed by
 * position id) + `locale` render summaries, bullets and quotes in the page
 * language — native when written in it, else the translations row, AI with
 * `*` or the original with a language tag when no row exists yet. `strings`
 * localises the chrome (empty notes, toggles, conflict pill, confidence
 * labels). Omit all three for the English behaviour.
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

/** English chrome defaults; `strings` overrides per key when provided. */
const CELL_DEFAULTS = {
  "cell.conflict_pill": "Conflicting Position",
  "cell.conflict_note":
    "This candidate has said different things about this issue in different places. Both are shown below, with their sources. We haven’t chosen between them.",
  "cell.multi_note":
    "This candidate has spoken about this issue more than once. Each statement is shown with its own source.",
  "cell.misread_link": "Think we’ve misread this?",
  "cell.wrong_link": "Think we’ve got this wrong?",
  "cell.show_words": "Show their words & source",
  "cell.hide": "Hide",
  "cell.source_label": "Source: ",
  "cell.confidence_label": "Confidence:",
  "cell.empty_asked_replied":
    "We asked on {date1}. They replied on {date2} but haven’t given a position on this.",
  "cell.empty_asked": "We asked on {date} — no reply yet.",
  "cell.empty_looked": "No public statement found as of {date}.",
  "cell.empty_unreviewed": "Not reviewed yet.",
  "cell.know_something": "Know something?",
  "cell.tell_us": "Tell us if we missed it.",
  "confidence.low": "Low",
  "confidence.medium": "Medium",
  "confidence.high": "High",
  "confidence.title": "Confidence: {level}",
} as const;

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

function ConflictPill({ t }: { t: Record<string, string> }) {
  return (
    <span className="pill border border-red-300 bg-red-50 text-red-800">
      {t["cell.conflict_pill"]}
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
 * Renders nothing when unset. (Extent values stay English in Phase 1 —
 * the extent.* rows are wired by the chrome pass.)
 */
function ExtentNote({ p, className = "" }: { p: Position; className?: string }) {
  if (!p.source_extent) return null;
  return (
    <span className={`text-ink-faint ${className}`}>({p.source_extent})</span>
  );
}

function SourceLine({ p, t }: { p: Position; t: Record<string, string> }) {
  return (
    <p className="mt-2 text-xs text-ink-faint">
      {t["cell.source_label"]}
      {p.source_url ? (
        <TrackedOutboundLink
          href={p.source_url}
          destination="source"
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          {p.source_title ?? p.source_url}
        </TrackedOutboundLink>
      ) : (
        (p.source_title ?? "—")
      )}
      {p.source_date ? ` · ${formatShortDate(p.source_date)}` : ""}
    </p>
  );
}

/**
 * The quote itself, in the page language (decision D2).
 *
 * - Translation row exists and the page language differs from the quote's
 *   native language: the translation, WITHOUT quotation marks, with a link
 *   expanding to the original WITH marks (TranslatedQuote).
 * - Otherwise: the original, with quotation marks — plus a small language
 *   tag when it is shown in a language it wasn't written in and no
 *   translation row exists yet.
 */
function QuoteContent({
  p,
  loc,
  locale,
}: {
  p: Position;
  loc?: PositionLocalization;
  locale: Locale;
}) {
  if (!p.verbatim_quote) return null;
  const nativeLocale = p.verbatim_quote_locale ?? "en";
  if (loc?.quoteIsTranslation && loc.quoteTranslated) {
    return (
      <TranslatedQuote
        translated={loc.quoteTranslated}
        translatedIsAi={loc.quoteTranslatedIsAi}
        original={p.verbatim_quote}
        originalLocale={loc.quoteNativeLocale}
        locale={locale}
      />
    );
  }
  return (
    <blockquote className="border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-ink-soft">
      &ldquo;
      <TranslatedText
        resolved={{
          text: p.verbatim_quote,
          isAiTranslation: false,
          isNative: locale === nativeLocale,
        }}
        nativeLocale={nativeLocale}
        locale={locale}
      />
      &rdquo;
    </blockquote>
  );
}

function SinglePosition({
  p,
  showQuoteInline,
  fullResponseLink,
  loc,
  locale,
  t,
}: {
  p: Position;
  showQuoteInline: boolean;
  fullResponseLink?: FullResponseLink | null;
  loc?: PositionLocalization;
  locale: Locale;
  t: Record<string, string>;
}) {
  // Normalise to ResolvedText so the localised and unlocalised paths
  // render through the same markup. Without a localisation map the
  // summary is native by construction (isNative: true, no tag).
  const summary: ResolvedText | null = loc
    ? loc.summaryShort
    : p.summary_short
      ? { text: p.summary_short, isAiTranslation: false, isNative: true }
      : null;
  const bullets: ResolvedText[] | null = loc
    ? loc.summaryBullets
    : (p.summary_bullets ?? []).map((b) => ({
        text: b,
        isAiTranslation: false,
        isNative: true,
      }));

  return (
    <div>
      {summary && (
        <p className="text-sm font-medium leading-snug text-ink">
          <TranslatedText
            resolved={summary}
            nativeLocale={p.summary_locale ?? "en"}
            locale={locale}
          />
        </p>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-snug text-ink-soft">
          {bullets.map((b, i) => (
            <li key={i}>
              <TranslatedText
                resolved={b}
                nativeLocale={p.summary_locale ?? "en"}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      )}

      {p.verbatim_quote &&
        (showQuoteInline ? (
          <>
            <div className="mt-2">
              <QuoteContent p={p} loc={loc} locale={locale} />
            </div>
            {/* The quote is already visible, so the note rides with the
                source line rather than on a toggle that isn't there.
                Guarded, or an unset extent leaves an empty paragraph with a
                top margin and the source line drifts down for no reason. */}
            {p.source_extent && (
              <p className="mt-1 text-xs">
                <ExtentNote p={p} />
              </p>
            )}
            <SourceLine p={p} t={t} />
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
              <span className="group-open:hidden">{t["cell.show_words"]}</span>
              <span className="hidden group-open:inline">{t["cell.hide"]}</span>{" "}
              {/* Stays visible whether the details element is open or shut:
                  it describes the source, not the disclosure state. */}
              <ExtentNote p={p} className="font-normal" />
            </summary>
            <div className="mt-2">
              <QuoteContent p={p} loc={loc} locale={locale} />
            </div>
            <SourceLine p={p} t={t} />
          </details>
        ))}
      {fullResponseLink && <FullResponseNote link={fullResponseLink} />}
      {/* The confidence belongs to this specific position, so it rides
          with the position's block rather than the cell — a cell can hold
          more than one statement. */}
      <p className="mt-2">
        <span className="mr-1.5 text-xs text-ink-faint">
          {t["cell.confidence_label"]}
        </span>
        <ConfidencePill
          level={p.confidence}
          labels={{
            low: t["confidence.low"],
            medium: t["confidence.medium"],
            high: t["confidence.high"],
            title: t["confidence.title"],
          }}
        />
      </p>
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
  t,
}: {
  contactedAt?: string | null;
  respondedAt?: string | null;
  lookedAt?: string | null;
  t: Record<string, string>;
}) {
  if (contactedAt && respondedAt) {
    return (
      <>
        {formatUi(t["cell.empty_asked_replied"], {
          date1: formatShortDate(contactedAt),
          date2: formatShortDate(respondedAt),
        })}
      </>
    );
  }
  if (contactedAt) {
    return (
      <>
        {formatUi(t["cell.empty_asked"], {
          date: formatShortDate(contactedAt),
        })}
      </>
    );
  }
  if (lookedAt) {
    return (
      <>
        {formatUi(t["cell.empty_looked"], {
          date: formatShortDate(lookedAt),
        })}
      </>
    );
  }
  return <>{t["cell.empty_unreviewed"]}</>;
}

export default function PositionCell({
  positions,
  correctionHref,
  contactedAt,
  respondedAt,
  lookedAt,
  fullResponseLink,
  withdrawn,
  localized,
  locale = "en",
  strings,
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
  /**
   * True when the candidate withdrew after nomination. Their own positions
   * render struck through (name and positions both), because the ballot still
   * carries their name but the positions were published by a campaign that
   * no longer exists. The empty/"not reviewed" note is OUR editorial state,
   * not their words, so it stays unstruck.
   */
  withdrawn?: boolean;
  /** Localised content for these positions, from localizePageContent. */
  localized?: Map<string, PositionLocalization>;
  locale?: Locale;
  /** Localised chrome strings (cell.* + confidence.*). Omit for English. */
  strings?: Record<string, string>;
}) {
  const t: Record<string, string> = { ...CELL_DEFAULTS, ...(strings ?? {}) };
  // Strike their positions, never our editorial chrome.
  const strike = (content: ReactNode) =>
    withdrawn ? <div className="line-through">{content}</div> : content;
  if (positions.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        <span className="italic">
          <EmptyNote
            contactedAt={contactedAt}
            respondedAt={respondedAt}
            lookedAt={lookedAt}
            t={t}
          />
        </span>{" "}
        <Link href={correctionHref} className="link">
          {t["cell.know_something"]}
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
            t={t}
          />
        </span>{" "}
        <Link href={correctionHref} className="link">
          {t["cell.tell_us"]}
        </Link>
      </p>
    );
  }

  if (real.length === 1) {
    return strike(
      <SinglePosition
        p={real[0]}
        showQuoteInline={false}
        fullResponseLink={fullResponseLink}
        loc={localized?.get(real[0].id)}
        locale={locale}
        t={t}
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

  return strike(
    <div>
      {conflicting ? (
        <>
          <ConflictPill t={t} />
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            {t["cell.conflict_note"]}
          </p>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-ink-faint">
          {t["cell.multi_note"]}
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
              loc={localized?.get(p.id)}
              locale={locale}
              t={t}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs">
        <Link href={correctionHref} className="link">
          {conflicting ? t["cell.misread_link"] : t["cell.wrong_link"]}
        </Link>
      </p>
    </div>
  );
}
