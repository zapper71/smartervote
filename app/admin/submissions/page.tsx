import Link from "next/link";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import { AdminDisabled, AdminLogin } from "../gate";
import { getServiceClient } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";
import type { CandidateSubmission } from "@/lib/submissions";

export const dynamic = "force-dynamic";

type Row = CandidateSubmission & {
  candidates: {
    name: string;
    slug: string;
    email: string | null;
    races: { slug: string; name: string } | null;
  } | null;
};

function statusLabel(s: Row): string {
  switch (s.status) {
    case "pending_confirmation":
      return "Awaiting email confirmation";
    case "new":
      return s.manual_verification ? "Awaiting review (manual verification)" : "Awaiting review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}

/**
 * Verification flags, worded exactly as decided Oct 28, 2026: an
 * address match is a SIGNAL, never proof of control — the queue must
 * never label a match "verified".
 */
function verificationNote(s: Row): string {
  if (s.status === "pending_confirmation") {
    return s.confirmation_sent_at
      ? "Confirmation email sent to the roster address; not yet clicked."
      : "Confirmation email not yet sent (Muse-side sweep pending).";
  }
  if (s.manual_verification) {
    return "Manual verification required — no roster email on file. Check out of band before approving.";
  }
  if (!s.candidates?.email) return "No roster email on file.";
  if (s.contact_email.trim().toLowerCase() === s.candidates.email.trim().toLowerCase()) {
    return "Contact address matches roster (signal only — not proof of control).";
  }
  return "Contact address differs from roster — check before approving.";
}

export default async function AdminSubmissions() {
  if (!adminEnabled()) return <AdminDisabled />;
  if (!(await isSignedIn())) return <AdminLogin error={false} next="/admin/submissions" />;

  const db = getServiceClient();
  const { data, error } = await db
    .from("candidate_submissions")
    .select("*, candidates(name, slug, email, races(slug, name))")
    .order("submitted_at", { ascending: false });
  if (error) {
    return (
      <div className="card border-flag/40 bg-flag-light">
        <h1 className="text-xl">Couldn&rsquo;t load submissions</h1>
        <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
      </div>
    );
  }
  const rows = (data ?? []) as Row[];
  const counts = {
    awaiting: rows.filter((r) => r.status === "pending_confirmation" || r.status === "new").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Candidate submissions</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {counts.awaiting} awaiting · {counts.approved} approved · {counts.rejected} rejected
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Nothing here is live until you approve it. Submissions awaiting
            email confirmation cannot be approved yet.
          </p>
        </div>
        <AdminNav current="submissions" />
      </div>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-ink-soft">No candidate submissions yet.</p>
        )}
        {rows.map((s) => (
          <article key={s.id} className="card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/admin/submissions/${s.id}`} className="link text-base">
                {s.candidates?.name ?? "Unknown candidate"}
                {s.candidates?.races ? ` — ${s.candidates.races.name}` : ""}
              </Link>
              <span className="text-sm text-ink-soft">
                {new Date(s.submitted_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}
              </span>
            </div>
            <p className="mt-1 text-sm">
              <strong>{statusLabel(s)}</strong>
              {s.status === "approved" &&
                (s.notification_status === "pending"
                  ? " · notification draft pending"
                  : " · notification drafted")}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{verificationNote(s)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {s.positions.length} position{s.positions.length === 1 ? "" : "s"}
              {s.bio ? " · bio" : ""}
              {s.website ? " · website" : ""}
              {s.public_email ? " · public email" : ""}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
