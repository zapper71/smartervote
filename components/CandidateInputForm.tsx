"use client";

import { useActionState } from "react";
import {
  submitSubmissionAction,
  type SubmitReport,
} from "@/app/races/[race]/[candidate]/input/actions";
import type { Issue } from "@/lib/types";

const INITIAL: SubmitReport = {
  ok: false,
  needsConfirmation: false,
  manual: false,
  skippedDuplicates: 0,
  positionCount: 0,
  errors: [],
};

/**
 * The candidate self-input form. Deliberately no photo field: by
 * standing rule (Oct 28, 2026) photo uploads are never accepted here —
 * photos influence perception rather than positions. Do not add one.
 */
export default function CandidateInputForm({
  raceSlug,
  candidateSlug,
  candidateName,
  rosterEmail,
  issues,
}: {
  raceSlug: string;
  candidateSlug: string;
  candidateName: string;
  rosterEmail: string | null;
  issues: Issue[];
}) {
  const [state, action, pending] = useActionState(submitSubmissionAction, INITIAL);

  if (state.ok) {
    return (
      <div className="card border-accent/30 bg-accent-light">
        <h2 className="text-lg">Received — thank you, {candidateName}.</h2>
        {state.needsConfirmation ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            A confirmation email will be sent to the address on your official
            candidate listing. Click the link in it to confirm this submission —
            it then goes to SmarterVote for review. Nothing goes live until
            that review is complete.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            There is no official email address on file for you, so this
            submission will be manually verified before review. Nothing goes
            live until that review is complete.
          </p>
        )}
        {state.positionCount > 0 && (
          <p className="mt-2 text-sm text-ink-soft">
            {state.positionCount} position{state.positionCount === 1 ? "" : "s"} submitted.
            {state.skippedDuplicates > 0 &&
              ` ${state.skippedDuplicates} skipped as exact duplicates of positions already on file.`}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-8">
      <input type="hidden" name="race_slug" value={raceSlug} />
      <input type="hidden" name="candidate_slug" value={candidateSlug} />

      {state.errors.length > 0 && (
        <div className="rounded-md border border-flag/40 bg-flag-light px-4 py-3">
          <h2 className="text-base">Please fix the following</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
            {state.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="card">
        <h2 className="text-lg">About you</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Your contact email is private and never displayed. Your public
          campaign email appears below your name on your race, compare and
          candidate pages.
        </p>
        <label className="mt-4 block text-sm">
          Contact email (private, required)
          <input
            type="email"
            name="contact_email"
            required
            className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-3 block text-sm">
          Public campaign email (shown on your pages)
          <input
            type="email"
            name="public_email"
            defaultValue={rosterEmail ?? ""}
            className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-3 block text-sm">
          Bio
          <textarea
            name="bio"
            rows={4}
            className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-3 block text-sm">
          Campaign website
          <input
            type="url"
            name="website"
            placeholder="https://"
            className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(["facebook", "instagram", "x"] as const).map((key) => (
            <label key={key} className="block text-sm capitalize">
              {key}
              <input
                type="url"
                name={`social_${key}`}
                placeholder="https://"
                className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg">Where you stand</h2>
        <p className="mt-1 text-sm text-ink-soft">
          One block per issue your office can actually act on. Leave any
          block blank to skip that issue. Each position needs your own words
          as a quote, and the short summary is at most 140 characters.
        </p>
        <div className="mt-4 space-y-5">
          {issues.map((issue) => (
            <article key={issue.id} className="card">
              <h3 className="text-base">{issue.name}</h3>
              {issue.voter_question && (
                <p className="mt-1 text-sm italic text-ink-faint">{issue.voter_question}</p>
              )}
              <label className="mt-3 block text-sm">
                Short summary (max 140 characters)
                <input
                  type="text"
                  name={`summary_${issue.slug}`}
                  maxLength={140}
                  className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                Key points (one per line, optional)
                <textarea
                  name={`bullets_${issue.slug}`}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                Your words (quote, required if you fill in this issue)
                <textarea
                  name={`quote_${issue.slug}`}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
                />
              </label>
            </article>
          ))}
        </div>
        {issues.length === 0 && (
          <p className="mt-4 text-sm text-ink-soft">
            No issues are listed for this race yet — your bio and contact
            details above can still be submitted.
          </p>
        )}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-sm text-ink-soft">
        Nothing here goes live until SmarterVote reviews it.
      </p>
    </form>
  );
}
