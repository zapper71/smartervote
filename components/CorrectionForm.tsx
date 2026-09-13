"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitCorrection, type CorrectionResult } from "@/app/corrections/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-target rounded-md bg-accent px-5 py-2.5 font-medium text-white disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send correction"}
    </button>
  );
}

/**
 * `about` and `pageUrl` are passed in from the server rather than read with
 * useSearchParams.
 *
 * That matters more than it looks: useSearchParams forces this component
 * behind a Suspense boundary, which meant the form was ABSENT from the
 * server-rendered HTML and only appeared after hydration. Anyone with
 * JavaScript blocked, or on a connection slow enough that hydration lagged,
 * saw a grey box and had no way to report a correction at all.
 *
 * With props, the form is in the initial HTML and the server action
 * progressively enhances — so it submits even with JavaScript off entirely.
 */
export default function CorrectionForm({
  about = "",
  pageUrl = "",
}: {
  about?: string;
  pageUrl?: string;
}) {
  const [state, action] = useActionState<CorrectionResult | null, FormData>(
    submitCorrection,
    null
  );
  const v = (state && !state.ok && state.values) || {};

  if (state?.ok) {
    return (
      <div
        className="card border-accent/30 bg-accent-light"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-base text-ink">Thank you — we&rsquo;ve got it</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your correction is in the queue and a person will read it. You&rsquo;ll get a
          reply either way, including if we decide not to change something.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          If this is urgent — voting is open, or it concerns your own candidate page —
          email{" "}
          <a href="mailto:support.smartervote.ca@gmail.com" className="link">
            support.smartervote.ca@gmail.com
          </a>{" "}
          as well and we&rsquo;ll prioritise it.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5" noValidate>
      {about && (
        <p className="rounded-md border border-accent/20 bg-accent-light px-4 py-3 text-sm text-ink-soft">
          About: <strong className="text-ink">{about}</strong>
        </p>
      )}
      <input type="hidden" name="page_url" defaultValue={pageUrl} />

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-md border border-flag/40 bg-flag-light px-4 py-3 text-sm text-ink"
        >
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="claim" className="block text-sm font-medium text-ink">
          What&rsquo;s wrong? <span className="text-flag">*</span>
        </label>
        <p className="mt-1 text-sm text-ink-faint">
          Tell us what&rsquo;s inaccurate, missing or out of date.
        </p>
        <textarea
          id="claim"
          name="claim"
          rows={5}
          required
          maxLength={4000}
          defaultValue={v.claim ?? ""}
          className="mt-2 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="proposed_text" className="block text-sm font-medium text-ink">
          What should it say instead?
        </label>
        <p className="mt-1 text-sm text-ink-faint">Optional, but it speeds things up a lot.</p>
        <textarea
          id="proposed_text"
          name="proposed_text"
          rows={4}
          maxLength={4000}
          defaultValue={v.proposed_text ?? ""}
          className="mt-2 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="supporting_url" className="block text-sm font-medium text-ink">
          A link we can check
        </label>
        <p className="mt-1 text-sm text-ink-faint">
          Optional. A page, article or post that backs this up.
        </p>
        <input
          id="supporting_url"
          name="supporting_url"
          type="url"
          inputMode="url"
          placeholder="https://"
          maxLength={500}
          defaultValue={v.supporting_url ?? ""}
          className="mt-2 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            defaultValue={v.name ?? ""}
            className="mt-2 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Your email <span className="text-flag">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            defaultValue={v.email ?? ""}
            className="mt-2 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="is_candidate"
          name="is_candidate"
          type="checkbox"
          className="mt-1 h-4 w-4"
        />
        <label htmlFor="is_candidate" className="text-sm text-ink-soft">
          <span className="font-medium text-ink">
            I&rsquo;m a candidate in this election.
          </span>{" "}
          Corrections from candidates about their own page are handled first.
        </label>
      </div>

      {/* Honeypot — hidden from people, tempting to bots. Not a CAPTCHA:
          those are an accessibility burden and this site doesn't need one. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website_url_confirm">Leave this field empty</label>
        <input
          id="website_url_confirm"
          name="website_url_confirm"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="text-sm text-ink-faint">
        We use your email only to reply about this correction. It is never published,
        sold or shared.
      </p>

      <SubmitButton />
    </form>
  );
}
