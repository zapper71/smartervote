"use server";

import { getPublicClient } from "@/lib/supabase";
import { getUiString } from "@/lib/queries";
import { formatUi, localeTag, parseLocale, type Locale } from "@/lib/i18n";

/**
 * Corrections are inserted with the PUBLIC (anon) key, not the secret key.
 *
 * That's deliberate least-privilege: row-level security allows anon to INSERT
 * into corrections and nothing else. Even if this action were somehow abused,
 * the worst it can do is add a row to a queue you review by hand. It cannot
 * read the queue, cannot touch positions, cannot publish anything.
 */

export type CorrectionResult =
  | { ok: true }
  | { ok: false; error: string; values?: Record<string, string> };

const MAX = {
  name: 120,
  email: 200,
  claim: 4000,
  proposed: 4000,
  url: 500,
};

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function submitCorrection(
  _prev: CorrectionResult | null,
  formData: FormData
): Promise<CorrectionResult> {
  // Honeypot. A real person never fills this in because it's hidden;
  // most naive bots fill every field they find. Silently pretend success
  // rather than telling a bot it was detected.
  if (str(formData, "website_url_confirm")) {
    return { ok: true };
  }

  const name = str(formData, "name");
  const email = str(formData, "email");
  const claim = str(formData, "claim");
  const proposed = str(formData, "proposed_text");
  const supporting = str(formData, "supporting_url");
  const isCandidate = formData.get("is_candidate") === "on";
  const pageUrl = str(formData, "page_url");
  // The form's language, from its hidden locale field — validation errors
  // come back in the same language as the form (form.error_* rows).
  const locale: Locale = parseLocale(str(formData, "locale"));
  const err = (key: string, fallback: string) =>
    getUiString(key, locale, fallback);

  const values = { name, email, claim, proposed_text: proposed, supporting_url: supporting, page_url: pageUrl };

  if (!claim) {
    return {
      ok: false,
      error: await err(
        "form.error_empty_claim",
        "Please tell us what's wrong — that field can't be empty."
      ),
      values,
    };
  }
  if (claim.length > MAX.claim) {
    return {
      ok: false,
      error: formatUi(
        await err(
          "form.error_claim_too_long",
          "That’s longer than we can accept ({max} characters max). Could you trim it?"
        ),
        { max: MAX.claim.toLocaleString(localeTag(locale)) }
      ),
      values,
    };
  }
  if (!email) {
    return {
      ok: false,
      error: await err(
        "form.error_no_email",
        "We need an email address so we can reply and tell you what we did."
      ),
      values,
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX.email) {
    return {
      ok: false,
      error: await err(
        "form.error_bad_email",
        "That email address doesn't look right. Could you check it?"
      ),
      values,
    };
  }
  if (name.length > MAX.name || proposed.length > MAX.proposed || supporting.length > MAX.url) {
    return {
      ok: false,
      error: await err(
        "form.error_field_too_long",
        "One of those fields is too long. Could you shorten it?"
      ),
      values,
    };
  }
  if (supporting && !/^https?:\/\//i.test(supporting)) {
    return {
      ok: false,
      error: await err(
        "form.error_bad_url",
        "The supporting link should start with https://"
      ),
      values,
    };
  }

  const db = getPublicClient();
  if (!db) {
    return {
      ok: false,
      error: await err(
        "form.error_save_failed",
        "We couldn't save that — it's a problem on our end, not yours. Please email support.smartervote.ca@gmail.com instead and we'll sort it out."
      ),
      values,
    };
  }

  const { error } = await db.from("corrections").insert({
    submitted_by_name: name || null,
    submitted_by_email: email,
    is_candidate: isCandidate,
    // Keep the page they were looking at — otherwise "this is wrong" with no
    // context is nearly impossible to action.
    claim: pageUrl ? `[Page: ${pageUrl}]\n\n${claim}` : claim,
    proposed_text: proposed || null,
    supporting_url: supporting || null,
    status: "new",
  });

  if (error) {
    return {
      ok: false,
      error: await err(
        "form.error_save_failed",
        "We couldn't save that — it's a problem on our end, not yours. Please email support.smartervote.ca@gmail.com instead and we'll sort it out."
      ),
      values,
    };
  }

  return { ok: true };
}
