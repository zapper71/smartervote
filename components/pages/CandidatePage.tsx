import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCandidate,
  getCandidateResponse,
  getCandidatesForRace,
  getIssues,
  getPositions,
  getRaceBySlugGlobal,
  getRaces,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import CandidateResponse from "@/components/CandidateResponse";
import PositionCell from "@/components/PositionCell";
import TranslatedText from "@/components/TranslatedText";
import TranslationFootnote from "@/components/TranslationFootnote";
import WebsiteLink from "@/components/WebsiteLink";
import WithdrawnPill from "@/components/WithdrawnPill";
import WinnerPill from "@/components/WinnerPill";
import PartyPill from "@/components/PartyPill";
import CandidateEmail from "@/components/CandidateEmail";
import { localizePageContent } from "@/components/pages/localize-content";
import { localizePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ race: string; candidate: string }>; locale: Locale };

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

/**
 * Candidate page body, shared by the English route and the /fr wrapper.
 *
 * Issue names/questions and position summaries/quotes render in the page
 * language (migration 52): native when written in it, else the
 * translations row — AI with `*`, or the original with a language tag
 * when no row exists yet. Bios never render on candidate pages (compare
 * only), so the bio fetch is skipped and a candidate's AI bio cannot
 * trigger the footnote here. Chrome strings stay English in Phase 1
 * (phase (b)); the chrome pass wires them.
 *
 * Two fixes carried in: the "with the Town" suffix in the no-website note
 * applies only to Huntsville (it was hard-coded for every municipality),
 * and the full-response link label uses the resolved (localised) issue
 * name.
 */
export default async function CandidatePage({ params, locale }: Props) {
  const { race: raceSlug, candidate: candidateSlug } = await params;
  const result = await getCandidate(raceSlug, candidateSlug);
  if (!result) notFound();

  const { race, candidate } = result;
 // Scoped to the race type AND its municipality, so a trustee candidate
  // isn't shown twelve municipal issues they have no authority over — and so
  // an expansion candidate isn't measured against Huntsville's issues.
  // See getIssues().
  const [positions, issues, response, found] = await Promise.all([
    getPositions(candidate.id),
    getIssues(race.race_type, race.municipality_id),
    getCandidateResponse(candidate.id),
    getRaceBySlugGlobal(raceSlug),
  ]);
  // The "with the Town" suffix in the no-website note belongs to Huntsville
  // only — every other municipality got it wrongly, unconditionally.
  const isHuntsville =
    !found?.municipality || found.municipality.slug === MUNICIPALITY_SLUG;

  // One translations fetch per entity type for the whole page, in parallel.
  // Bios are skipped: candidate pages never render them.
  const content = await localizePageContent({
    locale,
    municipalitySlug: found?.municipality?.slug ?? MUNICIPALITY_SLUG,
    issues,
    candidates: [candidate],
    positions,
    skipBios: true,
  });
  // Resolved issue names, for the response component's back-labels and the
  // full-response link — the same names the page itself shows.
  const issueNameBySlug: Record<string, string> = Object.fromEntries(
    issues.map((i) => [
      i.slug,
      content.issueNames.get(i.id)?.text ?? i.name,
    ])
  );
  const socials = Object.entries(candidate.socials ?? {}).filter(([, v]) => Boolean(v));

  // An issue can hold MORE than one position — see components/PositionCell.
  const byIssue = new Map<string, typeof positions>();
  for (const p of positions) {
    if (!byIssue.has(p.issue_id)) byIssue.set(p.issue_id, []);
    byIssue.get(p.issue_id)!.push(p);
  }
  const correctionHref = `${localizePath("/corrections", locale)}?about=${encodeURIComponent(
    `${candidate.name} — ${race.name}`
  )}&page=${encodeURIComponent(localizePath(`/races/${race.slug}/${candidate.slug}`, locale))}`;

  return (
    <div>
      <p className="text-sm">
        <Link href={localizePath(`/races/${race.slug}`, locale)} className="link">
          &larr; {race.name}
        </Link>
      </p>

      {/* A withdrawn candidate stays on the printed ballot: struck name,
          grey pill, struck position content. Same convention as the race and
          compare pages. */}
      <h1 className="mt-3 text-3xl">
        <span className={candidate.status === "withdrawn" ? "line-through" : undefined}>
          {candidate.name}
        </span>
        <PartyPill party={candidate.party} />
      </h1>
      {candidate.email && (
        <CandidateEmail email={candidate.email} className="mt-1 text-base" />
      )}
      <p className="mt-1 text-ink-soft">
        Candidate for {race.name}
        {race.ward_group_label ? ` · ${race.ward_group_label}` : ""}
      </p>

      {candidate.status === "acclaimed" && (
        <p className="pill mt-3 bg-flag-light text-flag">
          Acclaimed — no election for this seat
        </p>
      )}
      {candidate.status === "withdrawn" && (
        <p className="mt-3">
          <WithdrawnPill />
        </p>
      )}
      {candidate.is_winner && (
        <p className="mt-3">
          <WinnerPill
            isWinner={candidate.is_winner}
            resultStatus={candidate.result_status}
          />
        </p>
      )}

      {/* The candidate's own words come before ours, deliberately. */}
      <section aria-labelledby="contact-heading" className="mt-6 card">
        <h2 id="contact-heading" className="text-base">
          In their own words
        </h2>
        {candidate.website || socials.length > 0 ? (
          <p className="mt-3 text-sm">
            <WebsiteLink
              website={candidate.website}
              socials={candidate.socials}
              verifiedLinks={candidate.verified_links}
              candidateName={candidate.name}
            />
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This candidate hasn&rsquo;t listed a campaign website or social account{isHuntsville ? " with the Town" : ""}. That says nothing about them as a candidate — it just means less of
            their material is published online for us to summarise.
          </p>
        )}
</section>

      {/* The candidate's unedited reply, when they've sent one. Their words
          before our summaries — same principle as "In their own words". */}
      {response && (
        <CandidateResponse
          response={response}
          firstName={candidate.name.split(" ")[0]}
          candidateSlug={candidate.slug}
          raceSlug={race.slug}
          issueNameBySlug={issueNameBySlug}
          locale={locale}
        />
      )}

      <h2 className="mt-10 text-xl">Where they stand</h2>
      {/* issues.length rather than a hard-coded number. It said "the same ten
          issues" for a week after the list grew to twelve, and a page that
          states its own method should not be the thing that is out of date. */}
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
        Every candidate in this race is shown against the same {issues.length} issues, in
        the same order, whether or not we&rsquo;ve found something for each one.{" "}
        <Link href={localizePath("/methodology", locale)} className="link">
          Why we do it this way
        </Link>
        .
      </p>

      {issues.length === 0 ? (
        <div className="mt-4 card">
          <p className="text-sm text-ink-soft">
            Issue information isn&rsquo;t available right now.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
        {issues.map((issue) => {
            const forIssue = byIssue.get(issue.id) ?? [];
            const resolvedName = content.issueNames.get(issue.id);
            const resolvedQuestion = content.issueQuestions.get(issue.id);

            // The "Read their full response" link goes under a cell only
            // when the cell holds a position parsed from the reply, and
            // deep-links to the reply's matching section when there is one.
            const responseSection = response?.sections.find(
              (s) => s.issue_slug === issue.slug
            );
            const fullResponseLink =
              response &&
              forIssue.some((p) => p.source_type === "candidate_submission")
                ? {
                    href: `#${responseSection ? responseSection.anchor : `resp-${candidate.slug}-top`}`,
                    label: responseSection
                      ? `Read their full response on ${issueNameBySlug[issue.slug].toLowerCase()} →`
                      : "Read their full response →",
                  }
                : null;

            return (
              <article key={issue.id} className="card">
                <h3 className="text-base">
                  {resolvedName ? (
                    <TranslatedText
                      resolved={resolvedName}
                      nativeLocale={issue.name_locale ?? "en"}
                      locale={locale}
                    />
                  ) : (
                    issue.name
                  )}
                </h3>
                {issue.voter_question && (
                  <p className="mt-1 text-sm italic text-ink-faint">
                    {resolvedQuestion ? (
                      <TranslatedText
                        resolved={resolvedQuestion}
                        nativeLocale={issue.name_locale ?? "en"}
                        locale={locale}
                      />
                    ) : (
                      issue.voter_question
                    )}
                  </p>
                )}

                {/* PositionCell owns every state — not reviewed yet, no public
                    statement found, a single position, or two conflicting ones.
                    Keeping that logic in ONE component is what stops the
                    candidate page and the comparison page drifting apart and
                    describing the same gap in two different ways. */}
                <div className="mt-3">
                  <PositionCell
                    positions={forIssue}
                    correctionHref={correctionHref}
                    contactedAt={candidate.contacted_at}
                    respondedAt={candidate.responded_at}
                    lookedAt={candidate.last_reviewed_at}
                    fullResponseLink={fullResponseLink}
                    withdrawn={candidate.status === "withdrawn"}
                    localized={content.positions}
                    locale={locale}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-10 rounded-lg border border-paper-edge bg-paper p-5">
        <h2 className="text-base">Think we got something wrong?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Candidates and members of the public can both report a correction. Every one is
          logged and answered, and corrections about a candidate&rsquo;s own positions get
          priority.
        </p>
        <p className="mt-3">
          <Link href={correctionHref} className="link tap-target text-sm font-medium">
            Report a correction about this page &rarr;
          </Link>
        </p>
      </div>

      <TranslationFootnote locale={locale} show={content.hasAi} />
    </div>
  );
}
