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
  getUiStrings,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import CandidateResponse from "@/components/CandidateResponse";
import BioCell from "@/components/BioCell";
import PositionCell from "@/components/PositionCell";
import TranslatedText from "@/components/TranslatedText";
import TranslationFootnote from "@/components/TranslationFootnote";
import WebsiteLink from "@/components/WebsiteLink";
import WithdrawnPill from "@/components/WithdrawnPill";
import WinnerPill from "@/components/WinnerPill";
import PartyPill from "@/components/PartyPill";
import CandidateEmail from "@/components/CandidateEmail";
import { localizePageContent } from "@/components/pages/localize-content";
import { formatUi, localizePath, type Locale } from "@/lib/i18n";
import { splitMarker } from "@/components/pages/chrome";

type Props = { params: Promise<{ race: string; candidate: string }>; locale: Locale };

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

/**
 * Link-text boundary marker for the "Where they stand" intro. "Why we
 * do it this way" has no separate row inside that template — it is
 * split out per locale.
 */
const WHY_MARKERS: Record<Locale, string> = {
  en: "Why we do it this way",
  fr: "Pourquoi nous procédons ainsi",
  // Phase 2: cand.stand_intro translations must contain exactly this
  // phrase, or the link below silently stops splitting.
  "zh-Hans": "我们为什么这样做",
  "zh-Hant": "我們為什麼這樣做",
  ta: "நாங்கள் ஏன் இப்படிச் செய்கிறோம்",
  pa: "ਅਸੀਂ ਇਸ ਤਰ੍ਹਾਂ ਕਿਉਂ ਕਰਦੇ ਹਾਂ",
};

/**
 * Candidate page body, shared by the English route and the /fr wrapper.
 *
 * Issue names/questions and position summaries/quotes render in the page
 * language (migration 52): native when written in it, else the
 * translations row — AI with `*`, or the original with a language tag
 * when no row exists yet. The bio renders at the top (compare pages
 * show it too); a candidate's AI bio can trigger the footnote here.
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
  // Bios render at the top of this page, so they are fetched (and an AI
  // bio counts toward the footnote, like every other shown translation).
  const content = await localizePageContent({
    locale,
    municipalitySlug: found?.municipality?.slug ?? MUNICIPALITY_SLUG,
    issues,
    candidates: [candidate],
    positions,
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

  const s = await getUiStrings(locale, {
    "cand.for_race": "Candidate for {race}",
    "cand.bio_heading": "Bio",
    "cand.acclaimed": "Acclaimed — no election for this seat",
    "cand.own_words_heading": "In their own words",
    "cand.no_website":
      "This candidate hasn’t listed a campaign website or social account{town_suffix}. That says nothing about them as a candidate — it just means less of their material is published online for us to summarise.",
    "cand.stand_heading": "Where they stand",
    "cand.stand_intro":
      "Every candidate in this race is shown against the same {count} issues, in the same order, whether or not we’ve found something for each one. Why we do it this way.",
    "cand.no_issues": "Issue information isn’t available right now.",
    "cand.full_response": "Read their full response →",
    "cand.full_response_issue": "Read their full response on {issue} →",
    "cand.wrong_heading": "Think we got something wrong?",
    "cand.wrong_body":
      "Candidates and members of the public can both report a correction. Every one is logged and answered, and corrections about a candidate’s own positions get priority.",
    "cand.wrong_link": "Report a correction about this page →",
    "resp.heading": "What {firstName} told us",
    "resp.sub":
      "Their reply to our candidate review email, received {date} — published in full and unedited.",
    "resp.read": "Read the full response",
    "resp.hide": "Hide the full response",
    "resp.back": "↑ Back to comparison",
    "resp.back_issue": "↑ Back to comparison: {issue}",
    "cell.conflict_pill": "Conflicting Position",
    "bio.none": "No bio on record.",
    "clamp.read_more": "Read more",
    "clamp.show_less": "Show less",
    "cell.conflict_note":
      "This candidate has said different things about this issue in different places. Both are shown below, with their sources. We haven’t chosen between them.",
    "cell.multi_note":
      "This candidate has spoken about this issue more than once. Each statement is shown with its own source.",
    "cell.misread_link": "Think we’ve misread this?",
    "cell.wrong_link": "Think we’ve got this wrong?",
    "cell.show_words": "Show their words & source",
    "cell.hide": "Hide",
    "cell.source_label": "Source: ",
    "cell.confidence_label": "Confidence:",
    "cell.empty_asked_replied":
      "We asked on {date1}. They replied on {date2} but haven’t given a position on this.",
    "cell.empty_asked": "We asked on {date} — no reply yet.",
    "cell.empty_looked": "No public statement found as of {date}.",
    "cell.empty_unreviewed": "Not reviewed yet.",
    "cell.know_something": "Know something?",
    "cell.tell_us": "Tell us if we missed it.",
    "confidence.low": "Low",
    "confidence.medium": "Medium",
    "confidence.high": "High",
    "confidence.title": "Confidence: {level}",
    "pill.elected": "Elected",
    "pill.elected_unofficial": "Elected — unofficial result",
    "pill.elected_official_title": "Elected — official result",
    "pill.withdrawn": "Withdrawn",
    "pill.withdrawn_title":
      "Withdrew after nomination; still on the printed ballot",
    "weblink.none": "No website or social media listed",
  });
  const pillLabels = {
    elected: s["pill.elected"],
    electedUnofficial: s["pill.elected_unofficial"],
    electedOfficialTitle: s["pill.elected_official_title"],
  };
  const [standBefore, standAfter, standHasLink] = splitMarker(
    formatUi(s["cand.stand_intro"], { count: issues.length }),
    WHY_MARKERS[locale]
  );

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
        {formatUi(s["cand.for_race"], { race: race.name })}
        {race.ward_group_label ? ` · ${race.ward_group_label}` : ""}
      </p>

      {candidate.status === "acclaimed" && (
        <p className="pill mt-3 bg-flag-light text-flag">
          {s["cand.acclaimed"]}
        </p>
      )}
      {candidate.status === "withdrawn" && (
        <p className="mt-3">
          <WithdrawnPill
            labels={{
              withdrawn: s["pill.withdrawn"],
              title: s["pill.withdrawn_title"],
            }}
          />
        </p>
      )}
      {candidate.is_winner && (
        <p className="mt-3">
          <WinnerPill
            isWinner={candidate.is_winner}
            resultStatus={candidate.result_status}
            labels={pillLabels}
          />
        </p>
      )}

      {/* Bio at the top, above the positions — the review email points
          candidates here to check it. Same cell as the compare page, so
          the two never drift apart. */}
      <section aria-labelledby="bio-heading" className="mt-6">
        <h2 id="bio-heading" className="text-base">
          {s["cand.bio_heading"]}
        </h2>
        <div className="mt-2">
          <BioCell
            bio={candidate.bio}
            correctionHref={correctionHref}
            resolved={content.bios.get(candidate.slug)}
            nativeLocale={candidate.bio_locale ?? "en"}
            locale={locale}
            strings={s}
          />
        </div>
      </section>

      {/* The candidate's own words come before ours, deliberately. */}
      <section aria-labelledby="contact-heading" className="mt-6 card">
        <h2 id="contact-heading" className="text-base">
          {s["cand.own_words_heading"]}
        </h2>
        {candidate.website || socials.length > 0 ? (
          <p className="mt-3 text-sm">
            <WebsiteLink
              website={candidate.website}
              socials={candidate.socials}
              verifiedLinks={candidate.verified_links}
              candidateName={candidate.name}
              labels={{ none: s["weblink.none"] }}
            />
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {formatUi(s["cand.no_website"], {
              town_suffix: isHuntsville
                ? locale === "fr"
                  ? " auprès de la Ville"
                  : " with the Town"
                : "",
            })}
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
          strings={s}
        />
      )}

      <h2 className="mt-10 text-xl">{s["cand.stand_heading"]}</h2>
      {/* issues.length rather than a hard-coded number. It said "the same ten
          issues" for a week after the list grew to twelve, and a page that
          states its own method should not be the thing that is out of date. */}
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
        {standHasLink ? (
          <>
            {standBefore}
            <Link href={localizePath("/methodology", locale)} className="link">
              {WHY_MARKERS[locale]}
            </Link>
            {standAfter}
          </>
        ) : (
          formatUi(s["cand.stand_intro"], { count: issues.length })
        )}
      </p>

      {issues.length === 0 ? (
        <div className="mt-4 card">
          <p className="text-sm text-ink-soft">{s["cand.no_issues"]}</p>
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
                      ? formatUi(s["cand.full_response_issue"], {
                          issue: issueNameBySlug[issue.slug].toLowerCase(),
                        })
                      : s["cand.full_response"],
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
                    strings={s}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-10 rounded-lg border border-paper-edge bg-paper p-5">
        <h2 className="text-base">{s["cand.wrong_heading"]}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {s["cand.wrong_body"]}
        </p>
        <p className="mt-3">
          <Link href={correctionHref} className="link tap-target text-sm font-medium">
            {s["cand.wrong_link"]}
          </Link>
        </p>
      </div>

      <TranslationFootnote locale={locale} show={content.hasAi} />
    </div>
  );
}
