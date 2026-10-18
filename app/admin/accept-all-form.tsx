"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptAllAction,
  type AcceptAllResult,
} from "./actions";

const INITIAL: AcceptAllResult = {
  ok: false,
  positionsPublished: 0,
  positionsSkipped: 0,
  responsesPublished: 0,
  error: null,
};

/**
 * "Accept all" for the review queue: one confirmed click publishes
 * everything currently in_review — every position and every candidate
 * response, across all municipalities.
 *
 * The count shown is the queue total, not the filtered view: what you are
 * about to publish is everything waiting, so the number must be the whole
 * number. The server action enforces the publish guard (rows missing both
 * a quote and a source URL, without the no-public-position flag, stay in
 * review) and reports what it did.
 */
export function AcceptAllForm({
  positions,
  responses,
}: {
  positions: number;
  responses: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(acceptAllAction, INITIAL);
  const done = state.ok;

  // The page renders the queue from the server; refresh it once the run
  // finishes so the published rows leave the queue on screen.
  useEffect(() => {
    if (done) router.refresh();
  }, [done, router]);

  if (done) {
    return (
      <div className="mt-6 rounded-md border border-accent/30 bg-accent-light px-4 py-3">
        <h2 className="text-lg">Published</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {state.positionsPublished} position
          {state.positionsPublished === 1 ? "" : "s"} and{" "}
          {state.responsesPublished} full response
          {state.responsesPublished === 1 ? "" : "s"} published.{" "}
          {state.positionsSkipped > 0 && (
            <>
              {state.positionsSkipped} position
              {state.positionsSkipped === 1 ? "" : "s"} stayed in review —
              they were missing a quote and a source URL (no
              no-public-position flag), so the publish guard held them back.
            </>
          )}
        </p>
        <button
          onClick={() => router.refresh()}
          className="tap-target mt-2 rounded-md border border-paper-edge px-3 py-1.5 text-sm"
        >
          Refresh queue
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="mt-6 rounded-md border border-flag/40 bg-flag-light px-4 py-3">
        <h2 className="text-lg">Publish everything awaiting review?</h2>
        <p className="mt-1 text-sm text-ink-soft">
          This will publish <strong>{positions} positions</strong>
          {responses > 0 && (
            <>
              {" "}and <strong>{responses} full responses</strong>
            </>
          )}{" "}
          — the entire queue, every municipality, in one go. It is the same
          publish the per-row button does, including the reviewed-by stamp.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Rows missing a quote and a source URL (without the
          no-public-position flag) will <em>not</em> be published — the
          database&rsquo;s publish guard excludes them, and they stay in the
          queue for your eye.
        </p>
        <form action={action} className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Publishing…" : `Yes, publish all ${positions}`}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        onClick={() => setConfirming(true)}
        className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Accept all — publish {positions} positions
      </button>
      <p className="text-xs text-ink-faint">
        Publishes everything in the review queue, across all municipalities.
        You confirm on the next step.
      </p>
    </div>
  );
}
