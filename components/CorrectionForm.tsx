"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/lib/i18n";
import { submitCorrection, type CorrectionResult } from "@/app/corrections/actions";

/** English chrome defaults; `strings` overrides per key when provided. */
const FORM_DEFAULTS = {
  "form.submit": "Send correction",
  "form.sending": "Sending…",
  "form.thanks_heading": "Thank you — we’ve got it",
  "form.thanks_body1":
    "Your correction is in the queue and a person will read it. You’ll get a reply either way, including if we decide not to change something.",
  "form.thanks_body2":
    "If this is urgent — voting is open, or it concerns your own candidate page — email {email} as well and we’ll prioritise it.",
  "form.about_label": "About: {about}",
  "form.claim_label": "What’s wrong?",
  "form.claim_hint": "Tell us what’s inaccurate, missing or out of date.",
  "form.proposed_label": "What should it say instead?",
  "form.proposed_hint": "Optional, but it speeds things up a lot.",
  "form.url_label": "A link we can check",
  "form.url_hint": "Optional. A page, article or post that backs this up.",
  "form.name_label": "Your name",
  "form.email_label": "Your email",
  "form.candidate_checkbox": "I’m a candidate in this election.",
  "form.candidate_note":
    "Corrections from candidates about their own page are handled first.",
  "form.privacy_note":
    "We use your email only to reply about this correction. It is never published, sold or shared.",
} as const;

const SUPPORT_EMAIL = "support.smartervote.ca@gmail.com";

function SubmitButton({ labels }: { labels: { submit: string; sending: string } }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-target rounded-md bg-accent px-5 py-2.5 font-medium text-white disabled:opacity-60"
    >
      {pending ? labels.sending : labels.submit}
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
 *
 * `locale` is sent as a hidden field so the server action returns its
 * validation errors in the form's language (form.error_* rows).
 */
export default function CorrectionForm({
  about = "",
  pageUrl = "",
  locale = "en",
  strings,
}: {
  about?: string;
  pageUrl?: string;
  /** Page locale — labels, placeholders and the action's errors. */
  locale?: Locale;
  /** Localised chrome strings (form.*). Omit for English. */
  strings?: Record<string, string>;
}) {
  const t: Record<string, string> = { ...FORM_DEFAULTS, ...(strings ?? {}) };
  const [state, action] = useActionState<CorrectionResult | null, FormData>(
    submitCorrection,
    null
  );
  const v = (state && !state.ok && state.values) || {};

  if (state?.ok) {
    const [thanksBefore, thanksAfter] = t["form.thanks_body2"].split("{email}");
    return (
      <div
        className="card border-accent/30 bg-accent-light"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-base text-ink">{t["form.thanks_heading"]}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {t["form.thanks_body1"]}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {thanksBefore}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="link">
            {SUPPORT_EMAIL}
          </a>
          {thanksAfter}
        </p>
      </div>
    );
  }

  const [aboutBefore, aboutAfter] = t["form.about_label"].split("{about}");

  return (
    <form action={action} className="mt-6 space-y-5" noValidate>
      {about && (
        <p className="rounded-md border border-accent/20 bg-accent-light px-4 py-3 text-sm text-ink-soft">
          {aboutBefore}
          <strong className="text-ink">{about}</strong>
          {aboutAfter}
        </p>
      )}
      <input type="hidden" name="page_url" defaultValue={pageUrl} />
      <input type="hidden" name="locale" defaultValue={locale} />

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
          {t["form.claim_label"]} <span className="text-flag">*</span>
        </label>
        <p className="mt-1 text-sm text-ink-faint">{t["form.claim_hint"]}</p>
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
          {t["form.proposed_label"]}
        </label>
        <p className="mt-1 text-sm text-ink-faint">{t["form.proposed_hint"]}</p>
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
          {t["form.url_label"]}
        </label>
        <p className="mt-1 text-sm text-ink-faint">{t["form.url_hint"]}</p>
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
            {t["form.name_label"]}
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
            {t["form.email_label"]} <span className="text-flag">*</span>
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
            {t["form.candidate_checkbox"]}
          </span>{" "}
          {t["form.candidate_note"]}
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

      <p className="text-sm text-ink-faint">{t["form.privacy_note"]}</p>

      <SubmitButton
        labels={{ submit: t["form.submit"], sending: t["form.sending"] }}
      />
    </form>
  );
}
