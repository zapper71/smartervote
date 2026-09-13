import type { Metadata } from "next";
import { getServiceClient } from "@/lib/supabase";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import {
  approveAction,
  bulkApproveCandidateAction,
  logoutAction,
  loginAction,
  rejectAction,
  unpublishAction,
} from "./actions";
import { formatShortDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  status: string;
  summary_short: string | null;
  summary_bullets: string[] | null;
  verbatim_quote: string | null;
  source_url: string | null;
  source_title: string | null;
  source_date: string | null;
  no_public_position: boolean;
  reviewed_at: string | null;
  candidate_id: string;
  candidates: { name: string; slug: string; races: { name: string; slug: string } | null } | null;
  issues: { name: string; slug: string; sort_order: number } | null;
};

function Disabled() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">Admin is off in this environment</h1>
      <p className="mt-4">
        No <code className="rounded bg-paper-warm px-1">ADMIN_PASSWORD</code> is set, so
        there is no admin area here at all — not a locked door, no door.
      </p>
      <p>
        This is the intended default for production. Review positions locally instead:
        set <code className="rounded bg-paper-warm px-1">ADMIN_PASSWORD</code> in your{" "}
        <code className="rounded bg-paper-warm px-1">.env.local</code>, restart{" "}
        <code className="rounded bg-paper-warm px-1">npm run dev</code>, and work against
        the same database. Nothing about publishing requires the admin area to be exposed
        on the internet.
      </p>
    </div>
  );
}

function Login({ error }: { error: boolean }) {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl">Review queue</h1>
      <p className="mt-2 text-sm text-ink-soft">Sign in to review drafts.</p>
      {error && (
        <p className="mt-4 rounded-md border border-flag/40 bg-flag-light px-3 py-2 text-sm text-ink">
          That password didn&rsquo;t match.
        </p>
      )}
      <form action={loginAction} className="mt-6 space-y-3">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-paper-edge px-3 py-2"
        />
        <button
          type="submit"
          className="tap-target w-full justify-center rounded-md bg-accent px-4 py-2.5 font-medium text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; show?: string }>;
}) {
  const sp = await searchParams;

  if (!adminEnabled()) return <Disabled />;
  if (!(await isSignedIn())) return <Login error={sp.error === "1"} />;

  const show = sp.show === "published" ? "published" : "in_review";

  const db = getServiceClient();
  const { data, error } = await db
    .from("positions")
    .select(
      "id,status,summary_short,summary_bullets,verbatim_quote,source_url,source_title,source_date,no_public_position,reviewed_at,candidate_id," +
        "candidates(name,slug,races(name,slug)),issues(name,slug,sort_order)"
    )
    .in("status", ["in_review", "published", "draft"]);

  if (error) {
    return (
      <div className="card border-flag/40 bg-flag-light">
        <h1 className="text-xl">Couldn&rsquo;t load the queue</h1>
        <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
      </div>
    );
  }

  const rows = (data ?? []) as unknown as Row[];
  const counts = {
    in_review: rows.filter((r) => r.status === "in_review").length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
  };

  const visible = rows
    .filter((r) => r.status === show)
    .sort((a, b) => {
      const an = a.candidates?.name ?? "";
      const bn = b.candidates?.name ?? "";
      if (an !== bn) return an.localeCompare(bn);
      return (a.issues?.sort_order ?? 0) - (b.issues?.sort_order ?? 0);
    });

  // Group by candidate so you review one person at a time rather than
  // hopping between them — it's much easier to judge consistency that way.
  const groups = new Map<string, Row[]>();
  for (const r of visible) {
    const key = r.candidate_id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Review queue</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {counts.in_review} awaiting review · {counts.published} published ·{" "}
            {counts.draft} rejected
          </p>
        </div>
        <form action={logoutAction}>
          <button className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <a
          href="/admin"
          className={`tap-target rounded-md px-3 py-2 no-underline ${show === "in_review" ? "bg-accent text-white" : "border border-paper-edge text-ink"}`}
        >
          Awaiting review ({counts.in_review})
        </a>
        <a
          href="/admin?show=published"
          className={`tap-target rounded-md px-3 py-2 no-underline ${show === "published" ? "bg-accent text-white" : "border border-paper-edge text-ink"}`}
        >
          Published ({counts.published})
        </a>
      </div>

      {show === "in_review" && counts.in_review > 0 && (
        <p className="mt-6 rounded-md border border-accent/20 bg-accent-light px-4 py-3 text-sm text-ink-soft">
          <strong>Read the quote first, then the summary.</strong> The question is whether
          the summary says anything the quote doesn&rsquo;t. If it does, edit it in the box
          and approve — your edit is saved with the approval.
        </p>
      )}

      {visible.length === 0 && (
        <p className="mt-8 text-ink-soft">
          {show === "in_review"
            ? "Nothing waiting. The queue is clear."
            : "Nothing published yet."}
        </p>
      )}

      {[...groups.entries()].map(([candidateId, items]) => {
        const first = items[0];
        return (
          <section key={candidateId} className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper-edge pb-2">
              <h2 className="text-xl">
                {first.candidates?.name}{" "}
                <span className="text-sm font-normal text-ink-faint">
                  {first.candidates?.races?.name}
                </span>
              </h2>
              {show === "in_review" && items.length > 1 && (
                <form action={bulkApproveCandidateAction}>
                  <input type="hidden" name="candidate_id" value={candidateId} />
                  <button className="tap-target rounded-md border border-accent px-3 py-1.5 text-sm text-accent">
                    Approve all {items.length} for this candidate
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 space-y-5">
              {items.map((r) => (
                <article key={r.id} className="card">
                  <h3 className="text-base">{r.issues?.name}</h3>

                  {/* Quote first, deliberately — it's the thing being checked
                      against, and putting the summary first invites you to
                      read the summary and skim the evidence. */}
                  {r.verbatim_quote && (
                    <blockquote className="mt-3 border-l-2 border-accent/40 pl-4 text-sm italic leading-relaxed text-ink-soft">
                      &ldquo;{r.verbatim_quote}&rdquo;
                    </blockquote>
                  )}
                  <p className="mt-2 text-xs text-ink-faint">
                    {r.source_url ? (
                      <a
                        href={r.source_url}
                        className="link"
                        rel="noopener noreferrer nofollow"
                        target="_blank"
                      >
                        {r.source_title ?? r.source_url}
                      </a>
                    ) : (
                      "No source"
                    )}
                    {r.source_date ? ` · ${formatShortDate(r.source_date)}` : ""}
                    {r.reviewed_at ? ` · reviewed ${formatShortDate(r.reviewed_at)}` : ""}
                  </p>

                  {r.summary_bullets && r.summary_bullets.length > 0 && (
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                      {r.summary_bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {show === "in_review" ? (
                    <form action={approveAction} className="mt-4">
                      <input type="hidden" name="id" value={r.id} />
                      <label
                        htmlFor={`s-${r.id}`}
                        className="block text-xs font-medium uppercase tracking-wide text-ink-faint"
                      >
                        Summary shown to voters — edit here if needed
                      </label>
                      <textarea
                        id={`s-${r.id}`}
                        name="summary_short"
                        rows={2}
                        defaultValue={r.summary_short ?? ""}
                        className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
                          Approve &amp; publish
                        </button>
                        <button
                          formAction={rejectAction}
                          className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-ink">{r.summary_short}</p>
                      <form action={unpublishAction} className="mt-3">
                        <input type="hidden" name="id" value={r.id} />
                        <button className="tap-target rounded-md border border-paper-edge px-3 py-1.5 text-sm">
                          Unpublish
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
