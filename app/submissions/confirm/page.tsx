import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { hashConfirmationToken } from "@/lib/submissions";

export const dynamic = "force-dynamic";

/**
 * Confirmation landing page. The link in the confirmation email points
 * here with ?token=... — the token is the proof of mailbox control:
 * only the holder of the roster address could have received it.
 *
 * The email itself is NOT sent by the app (no mail credential lives
 * here). A Muse-side Gmail-connector sweep generates the token,
 * stores its hash + expiry, and sends the link to the roster address.
 * See supabase/42_candidate_submissions.sql.
 */
export default async function ConfirmSubmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  let heading = "That confirmation link does not look right";
  let body =
    "The link may have been copied incompletely, or this submission was already handled. If you just submitted your positions, try submitting again from your candidate page.";
  let confirmed = false;

  if (token) {
    const db = getServiceClient();
    const hash = hashConfirmationToken(token);
    const { data } = await db
      .from("candidate_submissions")
      .select("id, status, confirmation_expires_at")
      .eq("confirmation_token_hash", hash)
      .maybeSingle();
    if (!data) {
      // No row matches: invalid token, or already superseded/rejected.
    } else if (data.status === "new" || data.status === "approved") {
      heading = "Already confirmed";
      body =
        "This submission was already confirmed and is awaiting (or has completed) SmarterVote review. Nothing further is needed.";
      confirmed = true;
    } else if (data.status === "pending_confirmation") {
      const expired =
        data.confirmation_expires_at !== null &&
        new Date(data.confirmation_expires_at).getTime() < Date.now();
      if (expired) {
        heading = "That confirmation link has expired";
        body =
          "Confirmation links last 30 days. Please submit your positions again from your candidate page and confirm the new link.";
      } else {
        const { error } = await db
          .from("candidate_submissions")
          .update({
            status: "new",
            confirmed_at: new Date().toISOString(),
            confirmation_token_hash: null,
            confirmation_expires_at: null,
          })
          .eq("id", data.id)
          .eq("status", "pending_confirmation");
        if (!error) {
          heading = "Confirmed — thank you";
          body =
            "Your submission is now awaiting SmarterVote review. Nothing goes live until that review is complete.";
          confirmed = true;
        }
      }
    } else {
      heading = "This submission is no longer pending";
      body =
        "It may have been superseded by a newer submission or rejected in review. If you meant to submit positions, please submit again from your candidate page.";
    }
  }

  return (
    <div>
      <h1 className="text-3xl">{heading}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{body}</p>
      {confirmed && (
        <p className="mt-4 text-sm">
          <Link href="/" className="link">
            Back to SmarterVote.ca &rarr;
          </Link>
        </p>
      )}
    </div>
  );
}
