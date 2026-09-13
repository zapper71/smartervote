import type { Metadata } from "next";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import { resolveCorrectionAction } from "../actions";

export const metadata: Metadata = {
  title: "Corrections",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  is_candidate: boolean;
  claim: string;
  proposed_text: string | null;
  supporting_url: string | null;
  status: string;
  resolution_note: string | null;
  submitted_at: string;
  resolved_at: string | null;
};

function ago(iso: string): string {
  const mins = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AdminCorrections({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  if (!adminEnabled() || !(await isSignedIn())) {
    return (
      <div className="prose-civic">
        <h1 className="text-2xl text-ink">Not signed in</h1>
        <p className="mt-3">
          <Link href="/admin" className="link">
            Go to the review queue
          </Link>{" "}
          to sign in.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const show = sp.show === "resolved" ? "resolved" : "open";

  const db = getServiceClient();
  const { data, error } = await db
    .from("corrections")
    .select("*")
    .order("is_candidate", { ascending: false })
    .order("submitted_at", { ascending: true });

  if (error) {
    return (
      <div className="card border-flag/40 bg-flag-light">
        <h1 className="text-xl">Couldn&rsquo;t load corrections</h1>
        <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];
  const open = rows.filter((r) => r.status === "new" || r.status === "needs_info");
  const resolved = rows.filter((r) => r.status === "accepted" || r.status === "rejected");
  const visible = show === "open" ? open : resolved;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Corrections</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {open.length} open · {resolved.length} resolved
            {open.some((r) => r.is_candidate) && (
              <>
                {" · "}
                <strong className="text-flag">
                  {open.filter((r) => r.is_candidate).length} from candidates
                </strong>
              </>
            )}
          </p>
        </div>
        <Link
          href="/admin"
          className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm no-underline text-ink"
        >
          Position queue
        </Link>
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <a
          href="/admin/corrections"
          className={`tap-target rounded-md px-3 py-2 no-underline ${show === "open" ? "bg-accent text-white" : "border border-paper-edge text-ink"}`}
        >
          Open ({open.length})
        </a>
        <a
          href="/admin/corrections?show=resolved"
          className={`tap-target rounded-md px-3 py-2 no-underline ${show === "resolved" ? "bg-accent text-white" : "border border-paper-edge text-ink"}`}
        >
          Resolved ({resolved.length})
        </a>
      </div>

      {visible.length === 0 && (
        <p className="mt-8 text-ink-soft">
          {show === "open" ? "Nothing open. Queue is clear." : "Nothing resolved yet."}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {visible.map((r) => (
          <article
            key={r.id}
            className={`card ${r.is_candidate && r.status === "new" ? "border-flag/40" : ""}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base">
                {r.submitted_by_name || "Anonymous"}{" "}
                {r.is_candidate && (
                  <span className="pill ml-1 bg-flag-light text-flag">Candidate</span>
                )}
              </h2>
              <p className="text-xs text-ink-faint">{ago(r.submitted_at)}</p>
            </div>

            {r.submitted_by_email && (
              <p className="mt-1 text-sm">
                <a href={`mailto:${r.submitted_by_email}`} className="link">
                  {r.submitted_by_email}
                </a>
              </p>
            )}

            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                What they say is wrong
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {r.claim}
              </p>
            </div>

            {r.proposed_text && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  What they say it should be
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {r.proposed_text}
                </p>
              </div>
            )}

            {r.supporting_url && (
              <p className="mt-3 text-sm">
                <a
                  href={r.supporting_url}
                  className="link"
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  Supporting link &rarr;
                </a>
              </p>
            )}

            {show === "open" ? (
              <form action={resolveCorrectionAction} className="mt-4">
                <input type="hidden" name="id" value={r.id} />
                <label
                  htmlFor={`note-${r.id}`}
                  className="block text-xs font-medium uppercase tracking-wide text-ink-faint"
                >
                  What you did, and why — this is what you&rsquo;ll tell them
                </label>
                <textarea
                  id={`note-${r.id}`}
                  name="resolution_note"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    name="status"
                    value="accepted"
                    className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
                  >
                    Accept
                  </button>
                  <button
                    name="status"
                    value="rejected"
                    className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm"
                  >
                    Reject
                  </button>
                  <button
                    name="status"
                    value="needs_info"
                    className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm"
                  >
                    Need more info
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  Resolving it here records the decision. You still need to email them —
                  the site doesn&rsquo;t send mail, on purpose.
                </p>
              </form>
            ) : (
              <div className="mt-4 rounded-md bg-paper-warm px-3 py-2">
                <p className="text-sm">
                  <span className="font-medium text-ink">{r.status}</span>
                  {r.resolution_note ? ` — ${r.resolution_note}` : ""}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
