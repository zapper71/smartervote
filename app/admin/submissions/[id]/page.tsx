import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import { AdminDisabled, AdminLogin } from "../../gate";
import { getServiceClient } from "@/lib/supabase";
import { getIssues } from "@/lib/queries";
import AdminNav from "@/components/AdminNav";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "../actions";
import type { CandidateSubmission } from "@/lib/submissions";

export const dynamic = "force-dynamic";

function FieldDiff({
  label,
  current,
  proposed,
}: {
  label: string;
  current: string | null | undefined;
  proposed: string | null | undefined;
}) {
  if (!proposed) return null;
  return (
    <div className="mt-3">
      <h3 className="text-sm font-medium">{label}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Current: {current || <em>(none on file)</em>}
      </p>
      <p className="mt-1 text-sm">
        Proposed: <strong>{proposed}</strong>
      </p>
    </div>
  );
}

export default async function AdminSubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!adminEnabled()) return <AdminDisabled />;
  if (!(await isSignedIn()))
    return <AdminLogin error={false} next="/admin/submissions" />;

  const { id } = await params;
  const db = getServiceClient();
  const { data: submission } = await db
    .from("candidate_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!submission) notFound();
  const s = submission as CandidateSubmission;

  const { data: candidate } = await db
    .from("candidates")
    .select("*")
    .eq("id", s.candidate_id)
    .maybeSingle();
  if (!candidate) notFound();
  const { data: race } = await db
    .from("races")
    .select("*")
    .eq("id", candidate.race_id)
    .maybeSingle();
  if (!race) notFound();
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issueNameBySlug = new Map(issues.map((i) => [i.slug, i.name]));

  const approvable = s.status === "new";
  const contactMatches =
    candidate.email !== null &&
    s.contact_email.trim().toLowerCase() === candidate.email.trim().toLowerCase();
  const currentSocials = (candidate.socials ?? {}) as Record<string, string>;
  const proposedSocials = Object.entries(s.socials).filter(([, v]) => Boolean(v));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm">
            <Link href="/admin/submissions" className="link">
              &larr; All submissions
            </Link>
          </p>
          <h1 className="mt-3 text-3xl">{candidate.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {race.name} · submitted{" "}
            {new Date(s.submitted_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}
          </p>
        </div>
        <AdminNav current="submissions" />
      </div>

      <div className="card mt-6">
        <h2 className="text-lg">Verification</h2>
        {s.status === "pending_confirmation" && (
          <p className="mt-2 text-sm">
            <strong className="text-flag">Awaiting email confirmation — not approvable yet.</strong>{" "}
            {s.confirmation_sent_at
              ? "The confirmation email has been sent to the roster address and not yet clicked."
              : "The confirmation email has not been sent yet (Muse-side sweep pending)."}
          </p>
        )}
        {s.status === "new" && s.manual_verification && (
          <p className="mt-2 text-sm">
            <strong className="text-flag">Manual verification required.</strong> No roster
            email is on file — check this sender out of band before approving.
          </p>
        )}
        {s.status === "new" && !s.manual_verification && s.confirmed_at && (
          <p className="mt-2 text-sm">Confirmed via the emailed link on{" "}
            {new Date(s.confirmed_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}.
          </p>
        )}
        <p className="mt-2 text-sm text-ink-soft">
          Contact email (private, never displayed): {s.contact_email}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Roster email: {candidate.email ?? <em>(none on file)</em>}
        </p>
        {candidate.email && (
          <p className="mt-1 text-sm text-ink-soft">
            {contactMatches
              ? "Contact address matches roster (signal only — not proof of control)."
              : "Contact address differs from roster — check before approving."}
          </p>
        )}
        {s.status === "approved" && (
          <p className="mt-2 text-sm">
            Approved by {s.reviewed_by ?? "Andreas"}
            {s.notification_status === "pending"
              ? " · approval notification draft pending (Muse drafts it via the Gmail connector)."
              : " · approval notification drafted."}
          </p>
        )}
        {s.status === "rejected" && s.review_note && (
          <p className="mt-2 text-sm">Rejection note: {s.review_note}</p>
        )}
      </div>

      <div className="card mt-4">
        <h2 className="text-lg">Proposed changes</h2>
        <FieldDiff label="Bio" current={candidate.bio} proposed={s.bio} />
        <FieldDiff label="Website" current={candidate.website} proposed={s.website} />
        <FieldDiff
          label="Public campaign email"
          current={candidate.email}
          proposed={s.public_email}
        />
        {proposedSocials.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-medium">Socials</h3>
            {proposedSocials.map(([key, value]) => (
              <p key={key} className="mt-1 text-sm">
                <span className="capitalize">{key}</span>: current{" "}
                {currentSocials[key] || <em>(none)</em>} → proposed <strong>{value}</strong>
              </p>
            ))}
          </div>
        )}
        {!s.bio && !s.website && !s.public_email && proposedSocials.length === 0 && (
          <p className="mt-2 text-sm text-ink-soft">No profile-field changes proposed.</p>
        )}
      </div>

      <div className="mt-4 space-y-5">
        <h2 className="text-lg">Positions ({s.positions.length})</h2>
        {s.positions.map((p) => (
          <article key={p.issue_slug} className="card">
            <h3 className="text-base">{issueNameBySlug.get(p.issue_slug) ?? p.issue_slug}</h3>
            <p className="mt-2 text-sm font-medium">{p.summary_short}</p>
            {p.summary_bullets.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
                {p.summary_bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm italic text-ink-soft">&ldquo;{p.verbatim_quote}&rdquo;</p>
          </article>
        ))}
        {s.positions.length === 0 && (
          <p className="text-sm text-ink-soft">No positions in this submission.</p>
        )}
      </div>

      {(s.status === "new" || s.status === "pending_confirmation") && (
        <div className="mt-6 flex flex-wrap gap-3">
          {approvable && (
            <form action={approveSubmissionAction}>
              <input type="hidden" name="id" value={s.id} />
              <button className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
                Approve — publish everything above
              </button>
            </form>
          )}
          <form action={rejectSubmissionAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={s.id} />
            <input
              type="text"
              name="review_note"
              placeholder="Rejection note (optional)"
              className="rounded-md border border-paper-edge px-3 py-2 text-sm"
            />
            <button className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm">
              Reject
            </button>
          </form>
        </div>
      )}
      {!approvable && s.status === "pending_confirmation" && (
        <p className="mt-6 text-sm text-ink-soft">
          Approve is unavailable until the emailed confirmation link is clicked
          (or this submission is rejected).
        </p>
      )}
    </div>
  );
}
