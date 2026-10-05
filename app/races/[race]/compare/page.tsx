import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CandidatePicker from "@/components/CandidatePicker";
import PositionCell from "@/components/PositionCell";
import WebsiteLink from "@/components/WebsiteLink";
import UnavailableNotice from "@/components/UnavailableNotice";
import {
  CompareFloatingBar,
  CompareScrollHint,
  StickyCompareHead,
} from "@/components/CompareScrollCues";
import {
  getCandidateResponsesForCandidates,
  getCandidatesForRace,
  getIssues,
  getPositionsForCandidates,
  getRace,
  getRaces,
} from "@/lib/queries";
import { contestLabel } from "@/lib/dates";

export const revalidate = 300;

type Props = {
  params: Promise<{ race: string }>;
  searchParams: Promise<{ only?: string | string[] }>;
};

export async function generateStaticParams() {
  try {
    const races = await getRaces();
    return races.map((r) => ({ race: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race: slug } = await params;
  const race = await getRace(slug);
  if (!race) return { title: "Race not found" };
  return {
    title: `Compare candidates — ${race.name}`,
    description: `Every candidate for ${race.name} side by side on the same ten issues, with a source for every claim.`,
  };
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { race: raceSlug } = await params;
  const sp = await searchParams;
  const race = await getRace(raceSlug);

  if (!race) {
    const anyRaces = await getRaces();
    if (anyRaces.length === 0) return <UnavailableNotice what="This comparison" />;
    notFound();
  }

  // Scoped to the race type: a school board ballot gets the trustee issues,
  // everything else gets the municipal ones. See getIssues().
  const [allCandidates, issues] = await Promise.all([
    getCandidatesForRace(race.id),
    getIssues(race.race_type),
  ]);

  if (allCandidates.length === 0 || issues.length === 0) {
    return <UnavailableNotice what="This comparison" />;
  }

  // `only` narrows the view. An empty or nonsense value falls back to
  // everyone — a broken link should never hide candidates silently.
  const requested = Array.isArray(sp.only) ? sp.only : sp.only ? [sp.only] : [];
  const valid = requested.filter((s) => allCandidates.some((c) => c.slug === s));
  const candidates = valid.length > 0 ? allCandidates.filter((c) => valid.includes(c.slug)) : allCandidates;
  const isFiltered = candidates.length !== allCandidates.length;

  const positions = await getPositionsForCandidates(candidates.map((c) => c.id));
  const responses = await getCandidateResponsesForCandidates(
    candidates.map((c) => c.id)
  );
  const responseByCandidate = new Map(
    responses.map((r) => [r.candidate_id, r])
  );
  const key = (candidateId: string, issueId: string) => `${candidateId}:${issueId}`;

  // The deep link under an email-built cell: to the reply's matching
  // section on the candidate's page when there is one, else the top of
  // the reply. Null when the cell holds no email-sourced position.
  const fullResponseLinkFor = (
    candidateId: string,
    candidateSlug: string,
    issueSlug: string,
    issueName: string,
    cellPositions: typeof positions
  ) => {
    const resp = responseByCandidate.get(candidateId);
    if (
      !resp ||
      !cellPositions.some((p) => p.source_type === "candidate_submission")
    )
      return null;
    const sec = resp.sections.find((s) => s.issue_slug === issueSlug);
    return {
      href: `/races/${race.slug}/${candidateSlug}#${sec ? sec.anchor : `resp-${candidateSlug}-top`}`,
      label: `Read their full response on ${issueName.toLowerCase()} →`,
    };
  };
  // A cell can hold MORE than one position now — a candidate may have said
  // different things in different places, and we show both rather than
  // picking a winner. See components/PositionCell.
  const byCell = new Map<string, typeof positions>();
  for (const p of positions) {
    const k = key(p.candidate_id, p.issue_id);
    if (!byCell.has(k)) byCell.set(k, []);
    byCell.get(k)!.push(p);
  }

  const correctionFor = (name: string) =>
    `/corrections?about=${encodeURIComponent(`${name} — ${race.name}`)}&page=${encodeURIComponent(`/races/${race.slug}/compare`)}`;

  return (
    <div>
      <p className="text-sm">
        <Link href={`/races/${race.slug}`} className="link">
          &larr; {race.name}
        </Link>
      </p>

      <h1 className="mt-3 text-3xl">Compare candidates</h1>
      <p className="mt-1 text-ink-soft">
        {race.name}
        {race.ward_group_label ? ` · ${race.ward_group_label}` : ""}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        {contestLabel(allCandidates.length, race.seats)}
        {race.seats > 1 && ` · you can vote for up to ${race.seats}`}
      </p>

      {/* issues.length, not a hard-coded "ten" — see the candidate page. */}
      <p className="prose-civic mt-4 text-sm">
        Everyone is compared on the same {issues.length} issues, in the same
        order. Candidates are listed alphabetically, and the order of issues is
        not a ranking.{" "}
        <Link href="/methodology" className="link">
          How this works
        </Link>
        .
      </p>

      <CandidatePicker
        candidates={allCandidates}
        selected={candidates.map((c) => c.slug)}
        raceSlug={race.slug}
      />

      {isFiltered && (
        <p className="mt-3 rounded-md border border-flag/30 bg-flag-light px-4 py-2 text-sm text-ink-soft">
          Showing {candidates.length} of {allCandidates.length} candidates.{" "}
          <Link href={`/races/${race.slug}/compare`} className="link font-medium">
            Show everyone
          </Link>
        </p>
      )}

      {/* ---------- DESKTOP: a real table, issues down the left ----------
          scroll-pl-48 matches the w-48 sticky issue column. WCAG 2.2 SC
          2.4.11 (Focus Not Obscured) — without it, tabbing to a link in the
          leftmost visible cell scrolls it flush against the sticky column,
          which then sits on top of it. The browser honours scroll-padding
          when it scrolls a focused element into view, so this keeps the
          focused thing clear of the column rather than under it. */}
      {/* Wrapper constrains the floating scroll bar: the pill pins to the
          viewport bottom only while this comparison section is on screen,
          then scrolls away with it. */}
      <div className="mt-8">
      <CompareScrollHint candidateCount={candidates.length} />
      <div
        id="compare-scroll"
        className="compare-scroll-x hidden overflow-x-auto scroll-pl-48 md:block"
      >
        {/* table-fixed + w-80: every candidate column is exactly 20rem wide,
            whatever its content holds. (auto layout sized columns by content
            volume, which looked like favouritism; equal fluid shares turned
            out too narrow to read.) The table runs wider than the viewport in
            crowded races and scrolls instead — .compare-scroll-x paints a
            soft shadow on whichever edge still has columns to reveal. The
            w-48 issue column stays sticky on the left as the scroll anchor. */}
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            Candidate positions for {race.name}, by issue
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-48 border-b-2 border-paper-edge bg-paper-warm p-3 align-bottom text-sm font-semibold text-ink"
              >
                Issue
              </th>
              {candidates.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="w-80 border-b-2 border-paper-edge bg-paper-warm p-3 align-bottom"
                >
                  <Link
                    href={`/races/${race.slug}/${c.slug}`}
                    className="text-base font-semibold text-ink no-underline hover:text-accent"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-1 text-xs font-normal">
                    <WebsiteLink
                      website={c.website}
                      socials={c.socials}
                      verifiedLinks={c.verified_links}
                      candidateName={c.name}
                    />
                  </p>
                  {responseByCandidate.get(c.id) && (
                    <p className="mt-1 text-xs font-normal">
                      <Link
                        href={`/races/${race.slug}/${c.slug}#resp-${c.slug}-top`}
                        className="link"
                      >
                        Read {c.name.split(" ")[0]}&rsquo;s full response →
                      </Link>
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, i) => (
              <tr key={issue.id} className={i % 2 === 1 ? "bg-paper" : undefined}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 border-b border-paper-edge p-3 align-top text-sm font-semibold text-ink ${i % 2 === 1 ? "bg-paper" : "bg-paper-warm"}`}
                >
                  {issue.name}
                  {issue.voter_question && (
                    <span className="mt-1 block text-xs font-normal italic text-ink-faint">
                      {issue.voter_question}
                    </span>
                  )}
                </th>
               {candidates.map((c) => (
                  <td
                    key={c.id}
                    className="break-words border-b border-l border-paper-edge p-3 align-top"
                  >
                    <PositionCell
                      positions={byCell.get(key(c.id, issue.id)) ?? []}
                      correctionHref={correctionFor(c.name)}
                      contactedAt={c.contacted_at}
                      respondedAt={c.responded_at}
                      lookedAt={c.last_reviewed_at}
                      fullResponseLink={fullResponseLinkFor(
                        c.id,
                        c.slug,
                        issue.slug,
                        issue.name,
                        byCell.get(key(c.id, issue.id)) ?? []
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <CompareFloatingBar />
        <StickyCompareHead />
      </div>

      {/* ---------- MOBILE: grouped by issue, not by candidate ----------
          Six columns of prose is unusable on a handset, and Huntsville votes
          by internet and phone. Grouping by issue keeps the comparison intact:
          you read what everyone says about taxes, then scroll to the next
          issue. Grouping by candidate would turn this back into six separate
          profiles, which is the thing the page exists to replace. */}
      <div className="mt-8 space-y-8 md:hidden">
        {issues.map((issue) => (
          <section key={issue.id} aria-labelledby={`m-${issue.slug}`}>
            <h2
              id={`m-${issue.slug}`}
              className="border-b-2 border-paper-edge pb-2 text-lg"
            >
              {issue.name}
            </h2>
            {issue.voter_question && (
              <p className="mt-1 text-sm italic text-ink-faint">
                {issue.voter_question}
              </p>
            )}
            <div className="mt-3 space-y-3">
              {candidates.map((c) => (
                <div key={c.id} className="card">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-sm">
                      <Link
                        href={`/races/${race.slug}/${c.slug}`}
                        className="font-semibold text-ink no-underline hover:text-accent"
                      >
                        {c.name}
                      </Link>
                    </h3>
                    <p className="text-xs">
                      <WebsiteLink
                      website={c.website}
                      socials={c.socials}
                      verifiedLinks={c.verified_links}
                      candidateName={c.name}
                    />
                    </p>
                    {responseByCandidate.get(c.id) && (
                      <p className="mt-1 text-xs">
                        <Link
                          href={`/races/${race.slug}/${c.slug}#resp-${c.slug}-top`}
                          className="link"
                        >
                          Read {c.name.split(" ")[0]}&rsquo;s full response →
                        </Link>
                      </p>
                    )}
                  </div>
                <div className="mt-2">
                    <PositionCell
                      positions={byCell.get(key(c.id, issue.id)) ?? []}
                      correctionHref={correctionFor(c.name)}
                      contactedAt={c.contacted_at}
                      respondedAt={c.responded_at}
                      lookedAt={c.last_reviewed_at}
                      fullResponseLink={fullResponseLinkFor(
                        c.id,
                        c.slug,
                        issue.slug,
                        issue.name,
                        byCell.get(key(c.id, issue.id)) ?? []
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-paper-edge bg-paper p-5">
        <h2 className="text-base">Something wrong here?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Candidates and members of the public can both report a correction.
          Corrections from candidates about their own positions are handled first.
        </p>
        <p className="mt-3">
          <Link
            href={`/corrections?page=${encodeURIComponent(`/races/${race.slug}/compare`)}`}
            className="link tap-target text-sm font-medium"
          >
            Report a correction &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
