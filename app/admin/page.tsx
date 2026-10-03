import type { Metadata } from "next";
import { getServiceClient } from "@/lib/supabase";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import { AdminDisabled, AdminLogin } from "./gate";
import {
  approveAction,
  approveResponseAction,
  bulkApproveCandidateAction,
  logoutAction,
  rejectAction,
  rejectResponseAction,
  setExtentAction,
  unpublishAction,
  unpublishResponseAction,
} from "./actions";
import { formatShortDate } from "@/lib/dates";
import { allowedExtents, type SourceExtent, type SourceType } from "@/lib/types";

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
  source_type: SourceType | null;
  source_extent: SourceExtent | null;
  no_public_position: boolean;
  reviewed_at: string | null;
  candidate_id: string;
  candidates: { name: string; slug: string; races: { name: string; slug: string } | null } | null;
  issues: { name: string; slug: string; sort_order: number } | null;
};

/**
 * The "how much did they publish" dropdown.
 *
 * The options are scoped to the source type, which is the whole fairness
 * mechanism: for a newspaper interview the only choices are the ones that
 * make no length claim, so it is not possible to label a candidate "one
 * sentence" for something a reporter chose the length of. Re-validated in the
 * server action and again by a CHECK constraint.
 */
function ExtentSelect({ r }: { r: Row }) {
  const options = allowedExtents(r.source_type);
  const reported = options[0] === "reported remarks";

  return (
    <>
      <label
        htmlFor={`e-${r.id}`}
        className="block text-xs font-medium uppercase tracking-wide text-ink-faint"
      >
        How much they published on this issue
      </label>
      <select
        id={`e-${r.id}`}
        name="source_extent"
        defaultValue={r.source_extent ?? ""}
        className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
      >
        <option value="">Not recorded — shows nothing on the site</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-ink-faint">
        {reported
          ? "This came from a reporter, so there is no length option — the reporter chose how much to quote, not the candidate."
          : "Describe the source, not the quote. A page counts as a page even if we only quoted one line of it."}
      </p>
    </>
  );
}

type ResponseRow = {
  id: string;
  status: string;
  subject: string | null;
  received_at: string;
  body_text: string;
  sections: { heading: string; anchor: string; issue_slug: string | null }[] | null;
  reviewed_at: string | null;
  candidate_id: string;
  candidates: { name: string; slug: string; races: { name: string; slug: string } | null } | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; show?: string }>;
}) {
  const sp = await searchParams;

  if (!adminEnabled()) return <AdminDisabled />;
  if (!(await isSignedIn())) return <AdminLogin error={sp.error === "1"} next="/admin" />;

  const show = sp.show === "published" ? "published" : "in_review";

  const db = getServiceClient();
  const { data, error } = await db
    .from("positions")
    .select(
      "id,status,summary_short,summary_bullets,verbatim_quote,source_url,source_title,source_date,source_type,source_extent,no_public_position,reviewed_at,candidate_id," +
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

  const { data: respData, error: respError } = await db
    .from("candidate_responses")
    .select(
      "id,status,subject,received_at,body_text,sections,reviewed_at,candidate_id," +
        "candidates(name,slug,races(name,slug))"
    )
    .in("status", ["in_review", "published", "draft"]);

  if (respError) {
    return (
      <div className="card border-flag/40 bg-flag-light">
        <h1 className="text-xl">Couldn&rsquo;t load the responses</h1>
        <p className="mt-2 text-sm text-ink-soft">{respError.message}</p>
      </div>
    );
  }

  const responses = (respData ?? []) as unknown as ResponseRow[];
  const respCounts = {
    in_review: responses.filter((r) => r.status === "in_review").length,
    published: responses.filter((r) => r.status === "published").length,
  };
  const responsesByCandidate = new Map<string, ResponseRow[]>();
  for (const r of responses.filter((r) => r.status === show)) {
    const key = r.candidate_id;
    if (!responsesByCandidate.has(key)) responsesByCandidate.set(key, []);
    responsesByCandidate.get(key)!.push(r);
  }

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
            {counts.in_review} positions awaiting review · {respCounts.in_review} full
            responses awaiting review · {counts.published} published · {counts.draft}{" "}
            rejected
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/import"
            className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm no-underline text-ink"
          >
            Import
          </a>
          <a
            href="/admin/corrections"
            className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm no-underline text-ink"
          >
            Corrections
          </a>
          <form action={logoutAction}>
            <button className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm">
              Sign out
            </button>
          </form>
        </div>
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

      {show === "in_review" && (counts.in_review > 0 || respCounts.in_review > 0) && (
        <p className="mt-6 rounded-md border border-accent/20 bg-accent-light px-4 py-3 text-sm text-ink-soft">
          <strong>Read the quote first, then the summary.</strong> The question is whether
          the summary says anything the quote doesn&rsquo;t. If it does, edit it in the box
          and approve — your edit is saved with the approval. A candidate&rsquo;s full
          response publishes <em>verbatim</em>; approving it means you read the whole thing.
        </p>
      )}

      {visible.length === 0 && responsesByCandidate.size === 0 && (
        <p className="mt-8 text-ink-soft">
          {show === "in_review"
            ? "Nothing waiting. The queue is clear."
            : "Nothing published yet."}
        </p>
      )}

      {[...new Set([...groups.keys(), ...responsesByCandidate.keys()])].map(
        (candidateId) => {
          const items = groups.get(candidateId) ?? [];
          const respItems = responsesByCandidate.get(candidateId) ?? [];
          const first = items[0] ?? respItems[0];
          const total = items.length + respItems.length;
          return (
            <section key={candidateId} className="mt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper-edge pb-2">
                <h2 className="text-xl">
                  {first.candidates?.name}{" "}
                  <span className="text-sm font-normal text-ink-faint">
                    {first.candidates?.races?.name}
                  </span>
                </h2>
                {show === "in_review" && total > 1 && (
                  <form action={bulkApproveCandidateAction}>
                    <input type="hidden" name="candidate_id" value={candidateId} />
                    <button className="tap-target rounded-md border border-accent px-3 py-1.5 text-sm text-accent">
                      Approve all {total} for this candidate
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-4 space-y-5">
                {respItems.map((resp) => (
                  <article key={resp.id} className="card border-accent/30">
                    <h3 className="text-base">
                      Full response{" "}
                      <span className="text-sm font-normal text-ink-faint">
                        · received {formatShortDate(resp.received_at)}
                        {resp.reviewed_at
                          ? ` · reviewed ${formatShortDate(resp.reviewed_at)}`
                          : ""}
                      </span>
                    </h3>
                    {resp.subject && (
                      <p className="mt-1 text-sm text-ink-soft">{resp.subject}</p>
                    )}
                    {/* The whole reply, verbatim — it publishes exactly as
                        written, so this is what you're checking. Scrollable
                        rather than shortened: shortening a candidate's own
                        words in the review screen would be its own kind of
                        editing. */}
                    <div className="mt-3 max-h-96 overflow-y-auto rounded-md border border-paper-edge bg-paper-warm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                      {resp.body_text}
                    </div>
                    <p className="mt-2 text-xs text-ink-faint">
                      {resp.sections?.length ?? 0} sections · deep links are
                      generated from the headings
                    </p>
                    {show === "in_review" ? (
                      <form action={approveResponseAction} className="mt-3 flex flex-wrap gap-2">
                        <input type="hidden" name="id" value={resp.id} />
                        <button className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
                          Approve &amp; publish
                        </button>
                        <button
                          formAction={rejectResponseAction}
                          className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm"
                        >
                          Reject
                        </button>
                      </form>
                    ) : (
                      <form action={unpublishResponseAction} className="mt-3">
                        <input type="hidden" name="id" value={resp.id} />
                        <button className="tap-target rounded-md border border-paper-edge px-3 py-1.5 text-sm">
                          Unpublish
                        </button>
                      </form>
                    )}
                  </article>
                ))}
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

                      <div className="mt-4">
                        <ExtentSelect r={r} />
                      </div>

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

                      {/* Settable after publication so the backlog of already
                          live positions can be worked through here rather than
                          in the SQL editor. Saving this does not re-review the
                          row or touch reviewed_at. */}
                      <form action={setExtentAction} className="mt-4">
                        <input type="hidden" name="id" value={r.id} />
                        <ExtentSelect r={r} />
                        <button className="tap-target mt-2 rounded-md border border-accent px-3 py-1.5 text-sm text-accent">
                          Save
                        </button>
                      </form>

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
