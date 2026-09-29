"use client";

/**
 * "What [Name] told us" — a candidate's full, unedited email reply.
 *
 * The comparison table shows a compact summary + quote per issue for
 * email-sourced positions (source_type = 'candidate_submission'). This
 * component is the other half of that design: the complete reply, split
 * into the candidate's own sections, each deep-linkable, with round-trip
 * navigation back to the comparison table.
 *
 * Deep links look like #resp-tyler-ellis-roads-... — the anchors are stored
 * in candidate_responses.sections and must match what the migration
 * generated (resp-<candidate-slug>-<slugified-heading>).
 *
 * WHY THE EXPLICIT SCROLL. Desktop browsers do not auto-open a closed
 * <details> when jumping to a fragment inside it: the fragment scroll runs
 * while the target is hidden and lands nowhere. So after opening the
 * expander we scroll to the target ourselves. (Mobile Safari auto-opens,
 * which is why this only ever bit desktop.)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatShortDate } from "@/lib/dates";
import type {
  CandidateResponse as CandidateResponseData,
  ResponseSection,
} from "@/lib/types";

interface SplitSection {
  heading: string | null;
  anchor: string;
  issueName: string | null;
  paragraphs: string[];
}

/**
 * Split the reply into its sections. A line that exactly matches a stored
 * heading starts a new section; everything before the first heading is the
 * intro (greeting, preamble). Headings are verified at insert time to occur
 * exactly once each, so the first match wins and the heading is consumed.
 */
function splitResponse(
  bodyText: string,
  sections: ResponseSection[],
  issueNameBySlug: Record<string, string>,
  topAnchor: string
): SplitSection[] {
  const byHeading = new Map(sections.map((s) => [s.heading, s]));
  const out: (Omit<SplitSection, "paragraphs"> & { lines: string[] })[] = [];
  let cur = {
    heading: null as string | null,
    anchor: topAnchor,
    issueName: null as string | null,
    lines: [] as string[],
  };
  out.push(cur);
  for (const rawLine of bodyText.split("\n")) {
    const hit = byHeading.get(rawLine.trim());
    if (hit && rawLine.trim().length > 0) {
      byHeading.delete(rawLine.trim());
      cur = {
        heading: hit.heading,
        anchor: hit.anchor,
        issueName: hit.issue_slug
          ? (issueNameBySlug[hit.issue_slug] ?? null)
          : null,
        lines: [],
      };
      out.push(cur);
    } else {
      cur.lines.push(rawLine);
    }
  }
  return out.map((s) => ({
    heading: s.heading,
    anchor: s.anchor,
    issueName: s.issueName,
    paragraphs: s.lines
      .join("\n")
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean),
  }));
}

/** One paragraph; single newlines inside it become line breaks. */
function Para({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <p className="text-sm leading-relaxed text-ink-soft">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {part}
        </span>
      ))}
    </p>
  );
}

export default function CandidateResponse({
  response,
  firstName,
  candidateSlug,
  raceSlug,
  issueNameBySlug,
}: {
  response: CandidateResponseData;
  firstName: string;
  candidateSlug: string;
  raceSlug: string;
  /** issue slug -> issue name, for the "Back to comparison: X" label. */
  issueNameBySlug: Record<string, string>;
}) {
  const topAnchor = `resp-${candidateSlug}-top`;
  const backHref = `/races/${raceSlug}/compare`;
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const [pillVisible, setPillVisible] = useState(false);
  const [backLabel, setBackLabel] = useState("↑ Back to comparison");

  const sections = useMemo(
    () =>
      splitResponse(
        response.body_text,
        response.sections,
        issueNameBySlug,
        topAnchor
      ),
    [response.body_text, response.sections, issueNameBySlug, topAnchor]
  );

  const refreshPill = useCallback(() => {
    const d = detailsRef.current;
    setPillVisible(!!d && d.open && window.scrollY > 500);
  }, []);

  /** Open the expander and land on the section the URL hash points at. */
  const openForHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const target = sections.find((s) => s.anchor === hash);
    if (!target) return;
    const d = detailsRef.current;
    if (d && !d.open) d.open = true;
    // The browser's own fragment scroll already ran while the target was
    // hidden (or not at all), so scroll explicitly now that it's laid out.
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
      refreshPill();
    });
    setBackLabel(
      target.issueName
        ? `↑ Back to comparison: ${target.issueName}`
        : "↑ Back to comparison"
    );
  }, [sections, refreshPill]);

  useEffect(() => {
    openForHash(); // deep link from a comparison-table cell
    window.addEventListener("hashchange", openForHash);
    window.addEventListener("scroll", refreshPill, { passive: true });
    const d = detailsRef.current;
    d?.addEventListener("toggle", refreshPill);
    return () => {
      window.removeEventListener("hashchange", openForHash);
      window.removeEventListener("scroll", refreshPill);
      d?.removeEventListener("toggle", refreshPill);
    };
  }, [openForHash, refreshPill]);

  return (
    <section aria-labelledby="response-heading" className="card mt-6">
      <h2 id="response-heading" className="text-base">
        What {firstName} told us
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
        Their reply to our candidate review email, received{" "}
        {formatShortDate(response.received_at)} — published in full and
        unedited.
      </p>

      <details ref={detailsRef} id={topAnchor} className="group mt-3">
        {/* min-h mirrors the "Show their words & source" toggle: WCAG 2.2
            SC 2.5.8 wants 24px minimum on a standalone control. */}
        <summary className="inline-flex min-h-[24px] cursor-pointer list-none items-center text-sm font-medium text-accent hover:underline">
          <span className="group-open:hidden">Read the full response</span>
          <span className="hidden group-open:inline">Hide the full response</span>
        </summary>

        <div className="mt-4 space-y-8">
          {sections.map((s) => (
            <section
              key={s.anchor}
              id={s.anchor === topAnchor ? undefined : s.anchor}
              aria-label={s.heading ?? "Introduction"}
            >
              {s.heading && (
                <>
                  {/* Quiet way back, at the top: a deep-linked reader lands
                      on the heading and sees this first. */}
                  <p className="text-xs">
                    <a href={backHref} className="link">
                      {backLabel}
                    </a>
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-ink">
                    {s.heading}
                  </h3>
                </>
              )}
              <div className={`space-y-3 ${s.heading ? "mt-2" : ""}`}>
                {s.paragraphs.map((p, i) => (
                  <Para key={i} text={p} />
                ))}
              </div>
              {s.heading && (
                <p className="mt-3 text-xs">
                  <a href={backHref} className="link">
                    {backLabel}
                  </a>
                </p>
              )}
            </section>
          ))}
        </div>
      </details>

      {/* Floating way back for long responses: appears once you've scrolled
          down inside the open response, so it's always one tap away however
          far the page runs. 44px target (WCAG 2.5.8); reduced-motion is
          handled by the global reset in globals.css. */}
      <a
        href={backHref}
        aria-hidden={!pillVisible}
        tabIndex={pillVisible ? 0 : -1}
        className={`fixed bottom-4 right-4 z-50 inline-flex min-h-[44px] items-center rounded-full bg-ink px-4 text-sm font-medium text-paper shadow-lg transition-opacity motion-reduce:transition-none ${
          pillVisible
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        {backLabel}
      </a>
    </section>
  );
}
