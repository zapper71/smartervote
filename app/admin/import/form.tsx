"use client";

import { useActionState } from "react";
import { importJsonAction, type ImportReport } from "../actions";

const INITIAL: ImportReport = {
  ok: false,
  positionsImported: 0,
  positionsSkipped: [],
  responsesImported: 0,
  responsesSkipped: [],
  warnings: [],
  errors: [],
};

const SAMPLE = `{
  "positions": [
    {
      "candidate": "candidate-slug",
      "issue": "issue-slug",
      "summary_short": "One-line summary, about 140 characters.",
      "summary_bullets": ["Supporting point one.", "Supporting point two."],
      "verbatim_quote": "The candidate's exact words.",
      "source_url": "https://example.com/platform",
      "source_title": "Candidate website",
      "source_type": "candidate_website",
      "source_date": "2026-10-01",
      "source_extent": "a few sentences",
      "model_confidence": 0.9
    }
  ],
  "responses": [
    {
      "candidate": "candidate-slug",
      "received_at": "2026-10-01",
      "subject": "Re: SmarterVote review",
      "body_text": "The candidate's full reply, verbatim.",
      "sections": [
        { "heading": "Taxes", "anchor": "resp-candidate-slug-taxes", "issue_slug": "issue-slug" }
      ]
    }
  ]
}`;

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export function ImportForm() {
  const [state, action, pending] = useActionState(importJsonAction, INITIAL);
  const attempted = state.errors.length > 0 || state.positionsImported > 0 || state.responsesImported > 0 || state.positionsSkipped.length > 0 || state.responsesSkipped.length > 0;

  return (
    <div className="mt-6">
      <details className="rounded-md border border-paper-edge px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">Expected format</summary>
        <p className="mt-2 text-ink-soft">
          Slugs, not IDs. <code className="rounded bg-paper-warm px-1">source_type</code> is
          one of <code className="rounded bg-paper-warm px-1">candidate_website</code>,{" "}
          <code className="rounded bg-paper-warm px-1">candidate_social</code>,{" "}
          <code className="rounded bg-paper-warm px-1">local_news</code>,{" "}
          <code className="rounded bg-paper-warm px-1">all_candidates_meeting</code>,{" "}
          <code className="rounded bg-paper-warm px-1">candidate_submission</code> (replies
          sent to us directly — the only type allowed without a URL). A bare array is
          treated as positions.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-paper-warm p-3 text-xs leading-relaxed">
          {SAMPLE}
        </pre>
      </details>

      <form action={action} className="mt-4">
        <label
          htmlFor="payload"
          className="block text-xs font-medium uppercase tracking-wide text-ink-faint"
        >
          Paste JSON
        </label>
        <textarea
          id="payload"
          name="payload"
          rows={16}
          required
          spellCheck={false}
          placeholder='{"positions": [ ... ], "responses": [ ... ]}'
          className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 font-mono text-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Importing…" : "Validate & import"}
          </button>
          <a href="/admin" className="link text-sm">
            Back to the review queue
          </a>
        </div>
      </form>

      {attempted && (
        <div
          className={`mt-6 rounded-md border px-4 py-3 ${
            state.ok
              ? "border-accent/30 bg-accent-light"
              : "border-flag/40 bg-flag-light"
          }`}
        >
          <h2 className="text-lg">
            {state.ok ? "Imported" : "Import finished with errors"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {state.positionsImported} position{state.positionsImported === 1 ? "" : "s"}{" "}
            and {state.responsesImported} response{state.responsesImported === 1 ? "" : "s"}{" "}
            staged for review.{" "}
            {state.ok && (state.positionsImported > 0 || state.responsesImported > 0) && (
              <a href="/admin" className="link">
                Open the review queue →
              </a>
            )}
          </p>
          <ReportList title="Errors" items={state.errors} />
          <ReportList title="Warnings" items={state.warnings} />
          <ReportList title="Skipped positions" items={state.positionsSkipped} />
          <ReportList title="Skipped responses" items={state.responsesSkipped} />
        </div>
      )}
    </div>
  );
}
