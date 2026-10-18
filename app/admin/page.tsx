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
  setConfidenceAction,
  setExtentAction,
  unpublishAction,
  unpublishResponseAction,
} from "./actions";
import { formatShortDate } from "@/lib/dates";
import ConfidencePill from "@/components/ConfidencePill";
import { AcceptAllForm } from "./accept-all-form";
import {
  allowedExtents,
  CONFIDENCE_LEVELS,
  resolveConfidence,
  type Confidence,
  type SourceExtent,
  type SourceType,
} from "@/lib/types";

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
  /** May be absent when the confidence column hasn't been added to the
      database yet (migration 22) — every consumer resolves to 'medium'. */
  confidence?: Confidence | null;
  no_public_position: boolean;
  reviewed_at: string | null;
  candidate_id: string;
  candidates: {
    name: string;
    slug: string;
    races: {
      name: string;
      slug: string;
      municipalities: { name: string; slug: string } | null;
    } | null;
  } | null;
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

/**
 * The confidence dropdown.
 *
 * Definitions, in Andreas's words: HIGH = a quote we found from an approved
 * source, or the candidate's own feedback on the position. MEDIUM = claimed
 * by someone who said they were the candidate via the site, not yet
 * verified — the default when uncertain. LOW = submitted by someone else,
 * with no corroboration found. When in doubt, leave MEDIUM.
 */
function ConfidenceSelect({ r }: { r: Row }) {
  const current = resolveConfidence(r.confidence);
  return (
    <>
      <label
        htmlFor={`c-${r.id}`}
        className="block text-xs font-medium uppercase tracking-wide text-ink-faint"
      >
        Confidence that these are really their words
      </label>
      <select
        id={`c-${r.id}`}
        name="confidence"
        defaultValue={current}
        className="mt-1 w-full rounded-md border border-paper-edge px-3 py-2 text-sm"
      >
        {CONFIDENCE_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level === "low" ? "Low — someone else submitted it, uncorroborated"
              : level === "medium" ? "Medium — unverified, claimed by the candidate"
              : "High — approved source, or the candidate confirmed it"}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-ink-faint">
        When uncertain, leave Medium. Newly imported content from an approved
        source enters as High automatically.
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
  candidates: {
    name: string;
    slug: string;
    races: {
      name: string;
      slug: string;
      municipalities: { name: string; slug: string } | null;
    } | null;
  } | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; show?: string; conf?: string; muni?: string }>;
}) {
  const sp = await searchParams;

  if (!adminEnabled()) return <AdminDisabled />;
  if (!(await isSignedIn())) return <AdminLogin error={sp.error === "1"} next="/admin" />;

  const show = sp.show === "published" ? "published" : "in_review";
  const confFilter: Confidence | "all" = CONFIDENCE_LEVELS.includes(
    sp.conf as Confidence
  )
    ? (sp.conf as Confidence)
    : "all";
  // Municipality filter for the expansion queue. Empty = everything, which
  // is exactly today's default view — Huntsville rows included.
  const muniFilter = typeof sp.muni === "string" ? sp.muni.trim() : "";

  const db = getServiceClient();
  // The confidence column is new (migration 22): if it hasn't been run yet
  // the select fails, so retry without it and let every row resolve to
  // 'medium' rather than breaking the whole queue.
  const SELECT_BASE =
    "id,status,summary_short,summary_bullets,verbatim_quote,source_url,source_title,source_date,source_type,source_extent,no_public_position,reviewed_at,candidate_id," +
    "candidates(name,slug,races(name,slug,municipalities(name,slug))),issues(name,slug,sort_order)";
  // The two queries select different column sets, so give them one
  // structural type instead of letting inference lock the shape.
  type PositionRows = {
    data: unknown[] | null;
    error: { message: string } | null;
  };
  let confidenceColumn = true;
  // PostgREST caps a single response at 1,000 rows and the queue is well
  // past that, so page through positions in 1,000-row ranges with a stable
  // id order (mirrors the importer pagination, 29610b6). The confidence
  // column is new (migration 22): if it hasn't been run yet the select
  // fails, so on a confidence-related error the WHOLE fetch restarts without
  // it — same end behavior as before, all rows resolve to 'medium'.
  const PAGE_SIZE = 1000;
  const pages: unknown[][] = [];
  let positionsError: { message: string } | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    pages.length = 0;
    positionsError = null;
    for (let from = 0; ; from += PAGE_SIZE) {
      const pageResult: PositionRows = await db
        .from("positions")
        .select(`${SELECT_BASE}${confidenceColumn ? ",confidence" : ""}`)
        .in("status", ["in_review", "published", "draft"])
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (pageResult.error) {
        positionsError = pageResult.error;
        break;
      }
      pages.push(pageResult.data ?? []);
      if (!pageResult.data || pageResult.data.length < PAGE_SIZE) break;
    }
    if (!positionsError || !/confidence/i.test(positionsError.message)) break;
    confidenceColumn = false;
  }
  const { data, error } = {
    data: pages.flat() as unknown[] | null,
    error: positionsError,
  };

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
  const confCounts: Record<Confidence, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };
  for (const r of rows) {
    if (r.status === show) confCounts[resolveConfidence(r.confidence)] += 1;
  }

  const { data: respData, error: respError } = await db
    .from("candidate_responses")
    .select(
      "id,status,subject,received_at,body_text,sections,reviewed_at,candidate_id," +
        "candidates(name,slug,races(name,slug,municipalities(name,slug)))"
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

  // Municipality filter options, built from what's actually in this tab.
  // positions -> candidates -> races -> municipalities.
  const muniSlugOf = (r: Row | ResponseRow): string =>
    r.candidates?.races?.municipalities?.slug ?? "";
  const muniOptions = new Map<string, string>();
  for (const r of [...rows, ...responses].filter((r) => r.status === show)) {
    const m = (r as Row).candidates?.races?.municipalities;
    if (m && !muniOptions.has(m.slug)) muniOptions.set(m.slug, m.name);
  }
  const muniList = [...muniOptions.entries()].sort((a, b) =>
    a[1].localeCompare(b[1])
  );
  // A stale or hand-typed slug falls back to everything — a bad filter
  // value must never hide the queue.
  const activeMuni = muniOptions.has(muniFilter) ? muniFilter : "";
  const inMuni = (r: Row | ResponseRow) =>
    activeMuni === "" || muniSlugOf(r) === activeMuni;

  const responsesByCandidate = new Map<string, ResponseRow[]>();
  for (const r of responses.filter((r) => r.status === show && inMuni(r))) {
    const key = r.candidate_id;
    if (!responsesByCandidate.has(key)) responsesByCandidate.set(key, []);
    responsesByCandidate.get(key)!.push(r);
  }

  const visible = rows
    .filter((r) => r.status === show)
    .filter((r) => inMuni(r))
    .filter(
      (r) => confFilter === "all" || resolveConfidence(r.confidence) === confFilter
    )
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

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
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

      {/* Confidence filter — surfaces the low and medium rows that most
          need a human eye, without disturbing the review/publish flow. */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-ink-faint">Confidence:</span>
        {(
          [
            ["all", "All"],
            ["low", `Low (${confCounts.low})`],
            ["medium", `Medium (${confCounts.medium})`],
            ["high", `High (${confCounts.high})`],
          ] as const
        ).map(([value, label]) => {
          const href =
            value === "all"
              ? `/admin${show === "published" ? "?show=published" : ""}`
              : `/admin?${show === "published" ? "show=published&" : ""}conf=${value}`;
          const active = confFilter === value;
          return (
            <a
              key={value}
              href={href}
              className={`tap-target rounded-md px-3 py-1.5 no-underline ${active ? "bg-ink text-paper-warm" : "border border-paper-edge text-ink"}`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* Municipality filter — the expansion queue lands here (18 in-depth
          municipalities, ~789 positions). Plain GET form, no client JS: the
          review screen is server-rendered throughout. */}
      {muniList.length > 1 && (
        <form
          method="get"
          className="mt-3 flex flex-wrap items-center gap-2 text-sm"
        >
          {show === "published" && (
            <input type="hidden" name="show" value="published" />
          )}
          {confFilter !== "all" && (
            <input type="hidden" name="conf" value={confFilter} />
          )}
          <label
            htmlFor="muni-filter"
            className="text-xs text-ink-faint"
          >
            Municipality:
          </label>
          <select
            id="muni-filter"
            name="muni"
            defaultValue={activeMuni}
            className="tap-target rounded-md border border-paper-edge bg-paper px-3 py-2 text-sm"
          >
            <option value="">
              All municipalities ({muniList.length})
            </option>
            {muniList.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
          <button className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm">
            Filter
          </button>
          {activeMuni !== "" && (
            <a
              href={`/admin${show === "published" ? "?show=published" : ""}${confFilter !== "all" ? `${show === "published" ? "&" : "?"}conf=${confFilter}` : ""}`}
              className="link tap-target text-sm"
            >
              Clear
            </a>
          )}
        </form>
      )}

      {!confidenceColumn && (
        <p className="mt-6 rounded-md border border-flag/40 bg-flag-light px-4 py-3 text-sm text-ink-soft">
          The <code>confidence</code> column isn&rsquo;t in the database yet — every
          row below shows the default, Medium. Run{" "}
          <code>supabase/22_position_confidence.sql</code> to enable per-row
          confidence. Saving a confidence change before then will fail with an
          explanation rather than silently.
        </p>
      )}

      {show === "in_review" && (counts.in_review > 0 || respCounts.in_review > 0) && (
        <p className="mt-6 rounded-md border border-accent/20 bg-accent-light px-4 py-3 text-sm text-ink-soft">
          <strong>Read the quote first, then the summary.</strong> The question is whether
          the summary says anything the quote doesn&rsquo;t. If it does, edit it in the box
          and approve — your edit is saved with the approval. A candidate&rsquo;s full
          response publishes <em>verbatim</em>; approving it means you read the whole thing.
        </p>
      )}

      {/* Queue-wide accept, at Andreas's explicit request (Oct 18, 2026):
          thousands of staged import rows can't go one click at a time. It
          always means the whole in-review queue — never the filtered view —
          asks for confirmation with the live count, and skips anything the
          publish guard would reject. */}
      {show === "in_review" && counts.in_review > 0 && (
        <AcceptAllForm
          positions={counts.in_review}
          responses={respCounts.in_review}
        />
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
                    {/* Only shown once expansion rows exist — the default
                        Huntsville view renders exactly as before. */}
                    {muniList.length > 1 &&
                      ` · ${first.candidates?.races?.municipalities?.name ?? ""}`}
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
                  <h3 className="text-base">
                    {r.issues?.name}{" "}
                    <span className="ml-1 align-middle">
                      <ConfidencePill level={r.confidence} />
                    </span>
                  </h3>

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

                      <div className="mt-4">
                        <ConfidenceSelect r={r} />
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

                      {/* Confidence can change on an already published row —
                          same shape as the extent control: it only rewrites
                          this one field, nothing else about the row. */}
                      <form action={setConfidenceAction} className="mt-4">
                        <input type="hidden" name="id" value={r.id} />
                        <ConfidenceSelect r={r} />
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
