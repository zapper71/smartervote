import Link from "next/link";
import { notFound } from "next/navigation";
import BioCell from "@/components/BioCell";
import CandidatePicker from "@/components/CandidatePicker";
import Clampable from "@/components/Clampable";
import PositionCell from "@/components/PositionCell";
import TranslatedText from "@/components/TranslatedText";
import TranslationFootnote from "@/components/TranslationFootnote";
import WebsiteLink from "@/components/WebsiteLink";
import WithdrawnPill from "@/components/WithdrawnPill";
import WinnerPill from "@/components/WinnerPill";
import ResultsNotAvailablePill from "@/components/ResultsNotAvailablePill";
import ResultsSourceNote from "@/components/ResultsSourceNote";
import { RESULTS_SOURCES } from "@/lib/results-sources";
import PartyPill from "@/components/PartyPill";
import CandidateEmail from "@/components/CandidateEmail";
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
  getRaceBySlugGlobal,
  getRaces,
  getUiStrings,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { contestLabel } from "@/lib/dates";
import { localizePageContent } from "@/components/pages/localize-content";
import { formatUi, localizePath, localizeRaceName, type Locale } from "@/lib/i18n";
import { splitMarker } from "@/components/pages/chrome";

type Props = {
  params: Promise<{ race: string }>;
  searchParams: Promise<{ only?: string | string[] }>;
  locale: Locale;
};

/**
 * Compare page body, shared by the English route and the /fr wrapper.
 * Issue names/questions, bios, position summaries and quotes render in
 * the page language (migration 52): native when written in it, else the
 * translations row — AI with `*`, or the original with a language tag
 * when no row exists yet. Headings, labels and notices come from the
 * compare.* rows (plus the picker / cell / bio / pill / results /
 * weblink / scroll rows for the components rendered here).
 */
export default async function ComparePage({ params, searchParams, locale }: Props) {
  const { race: raceSlug } = await params;
  const sp = await searchParams;
  const found = await getRaceBySlugGlobal(raceSlug);

  // Fetched up front: both early returns below render this notice.
  const noticeStrings = await getUiStrings(locale, {
    "notice.unavailable_title": "{what} isn’t available right now",
    "notice.what_comparison": "This comparison",
    "notice.body":
      "Something went wrong loading this page. It’s a problem on our end, not yours. For official candidate and voting information, go straight to the official source for your election — the authority running it.",
  });

  if (!found) {
    const anyRaces = await getRaces();
    if (anyRaces.length === 0)
      return (
        <UnavailableNotice
          what={noticeStrings["notice.what_comparison"]}
          locale={locale}
          strings={noticeStrings}
        />
      );
    notFound();
  }

  const { race, municipality } = found;
  const isExpansion = municipality?.slug !== MUNICIPALITY_SLUG;

  // Scoped to the race type AND its municipality: a school board ballot gets
  // the trustee issues, everything else gets the municipal ones — from the
  // race's own municipality, never Huntsville's by assumption. See getIssues().
  const [allCandidates, issues] = await Promise.all([
    getCandidatesForRace(race.id),
    getIssues(race.race_type, race.municipality_id),
  ]);

  if (allCandidates.length === 0 || issues.length === 0) {
    return (
      <UnavailableNotice
        what={noticeStrings["notice.what_comparison"]}
        locale={locale}
        strings={noticeStrings}
      />
    );
  }

  // `only` narrows the view. An empty or nonsense value falls back to
  // everyone — a broken link should never hide candidates silently.
  const requested = Array.isArray(sp.only) ? sp.only : sp.only ? [sp.only] : [];
  const valid = requested.filter((s) => allCandidates.some((c) => c.slug === s));
  const candidates = valid.length > 0 ? allCandidates.filter((c) => valid.includes(c.slug)) : allCandidates;
  const hasWinner = allCandidates.some((c) => c.is_winner);
  const winners = allCandidates.filter((c) => c.is_winner);
  const hasAcclaimedWinner =
    winners.length > 0 && winners.every((c) => c.status === "acclaimed");
  // Same uncontested rule as the race page: candidates <= seats means the
  // seat was decided without an election, so no "Results not available" tag.
  const uncontested =
    allCandidates.length > 0 && allCandidates.length <= race.seats;
  const isFiltered = candidates.length !== allCandidates.length;

  const positions = await getPositionsForCandidates(candidates.map((c) => c.id));
  const responses = await getCandidateResponsesForCandidates(
    candidates.map((c) => c.id)
  );
  // One translations fetch per entity type for the whole page. Only the
  // displayed candidates count: a filtered-out candidate's AI bio must
  // not trigger the footnote.
  const content = await localizePageContent({
    locale,
    municipalitySlug: municipality?.slug ?? "",
    issues,
    candidates,
    positions,
  });
  const responseByCandidate = new Map(
    responses.map((r) => [r.candidate_id, r])
  );
  const key = (candidateId: string, issueId: string) => `${candidateId}:${issueId}`;
  // Withdrawn candidates stay on the ballot (names printed) but render with
  // a grey Withdrawn pill, struck-through name, and struck position content.
  const isWithdrawn = (c: { status?: string | null }) => c.status === "withdrawn";

  const s = await getUiStrings(locale, {
    "compare.heading": "Compare candidates",
    "compare.vote_up_to": "you can vote for up to {seats}",
    "compare.intro":
      "Everyone is compared on the same {count} issues, in the same order. Candidates are listed alphabetically, and the order of issues is not a ranking. Each candidate’s bio appears at the top, above the issues. How this works.",
    "compare.filtered": "Showing {shown} of {total} candidates.",
    "compare.issue_heading": "Issue",
    "compare.bio_heading": "Bio",
    "compare.read_response": "Read {firstName}’s full response →",
    "compare.wrong_heading": "Something wrong here?",
    "compare.wrong_body":
      "Candidates and members of the public can both report a correction. Corrections from candidates about their own positions are handled first.",
    "compare.wrong_link": "Report a correction →",
    "nav.how_it_works": "How this works",
    "picker.toggle_all": "Comparing all {count} candidates",
    "picker.toggle_some": "Comparing {selected} of {count}",
    "picker.legend": "Choose who to compare",
    "picker.hint":
      "All candidates are shown by default. Narrowing is just for readability — it doesn’t change anything about the comparison.",
    "picker.select_all": "Select all",
    "picker.deselect_all": "Deselect all",
    "picker.compare_selected": "Compare selected",
    "picker.show_everyone": "Show everyone",
    "scroll.hint": "Scroll right to see all {count} candidates →",
    "bio.none": "No bio on record.",
    "cell.conflict_pill": "Conflicting Position",
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
    "clamp.read_more": "Read more",
    "clamp.show_less": "Show less",
    "cand.full_response_issue": "Read their full response on {issue} →",
    "pill.elected": "Elected",
    "pill.elected_unofficial": "Elected — unofficial result",
    "pill.elected_official_title": "Elected — official result",
    "pill.withdrawn": "Withdrawn",
    "pill.withdrawn_title":
      "Withdrew after nomination; still on the printed ballot",
    "results.pill": "Results not available",
    "results.pill_title": "No result recorded for this race yet",
    "results.not_available_long":
      "Results not available means that the counts are still in progress, the counts are too close to call, or the result has not been collected and verified on SmarterVote yet.",
    "results.acclaimed_no_source": "Acclaimed candidates do not have a source.",
    "results.source_label": "Results source: ",
    "weblink.none": "No website or social media listed",
    "dates.contest": "{count} candidate(s) for {seats} seat(s)",
    "dates.contest_none": "No candidates listed · {seats} seat(s)",
    "dates.contest_acclaimed": " · acclaimed",
  });
  const contestTemplates = {
    contest: s["dates.contest"],
    contestNone: s["dates.contest_none"],
    contestAcclaimed: s["dates.contest_acclaimed"],
  };
  const pillLabels = {
    elected: s["pill.elected"],
    electedUnofficial: s["pill.elected_unofficial"],
    electedOfficialTitle: s["pill.elected_official_title"],
  };
  const withdrawnLabels = {
    withdrawn: s["pill.withdrawn"],
    title: s["pill.withdrawn_title"],
  };
  const clampLabels = {
    readMore: s["clamp.read_more"],
    showLess: s["clamp.show_less"],
  };
  // compare.intro ends with the "How this works" link: split the template
  // at the link text so the link keeps its markup in both languages.
  // If the phrase is not in the template, render it as plain text.
  const [introBefore, introAfter, introHasLink] = splitMarker(
    formatUi(s["compare.intro"], { count: issues.length }),
    s["nav.how_it_works"]
  );

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
      href: `${localizePath(`/races/${race.slug}/${candidateSlug}`, locale)}#${sec ? sec.anchor : `resp-${candidateSlug}-top`}`,
      label: formatUi(s["cand.full_response_issue"], {
        issue: issueName.toLowerCase(),
      }),
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
    `${localizePath("/corrections", locale)}?about=${encodeURIComponent(`${name} — ${localizeRaceName(race.name, locale)}`)}&page=${encodeURIComponent(localizePath(`/races/${race.slug}/compare`, locale))}`;

  return (
    <div>
      <p className="text-sm">
        <Link href={localizePath(`/races/${race.slug}`, locale)} className="link">
          &larr; {localizeRaceName(race.name, locale)}
        </Link>
      </p>

      <h1 className="mt-3 text-3xl">{s["compare.heading"]}</h1>
      <p className="mt-1 text-ink-soft">
        {localizeRaceName(race.name, locale)}
        {race.ward_group_label ? ` · ${race.ward_group_label}` : ""}
        {/* The race's own municipality, not Huntsville by assumption. */}
        {isExpansion && municipality ? ` · ${municipality.name}` : ""}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        {contestLabel(allCandidates.length, race.seats, contestTemplates)}
        {race.seats > 1 &&
          ` · ${formatUi(s["compare.vote_up_to"], { seats: race.seats })}`}
      </p>
      {!hasWinner && !uncontested && (
        <p className="mt-2">
          <ResultsNotAvailablePill
            labels={{
              label: s["results.pill"],
              title: s["results.pill_title"],
            }}
          />
        </p>
      )}

      {/* issues.length, not a hard-coded "ten" — see the candidate page. */}
      <p className="prose-civic mt-4 text-sm">
        {introHasLink ? (
          <>
            {introBefore}
            <Link href={localizePath("/methodology", locale)} className="link">
              {s["nav.how_it_works"]}
            </Link>
            {introAfter}
          </>
        ) : (
          formatUi(s["compare.intro"], { count: issues.length })
        )}
      </p>

      <CandidatePicker
        key={candidates.map((c) => c.slug).join(",")}
        candidates={allCandidates}
        selected={candidates.map((c) => c.slug)}
        raceSlug={race.slug}
        locale={locale}
        strings={s}
      />

      {isFiltered && (
        <p className="mt-3 rounded-md border border-flag/30 bg-flag-light px-4 py-2 text-sm text-ink-soft">
          {formatUi(s["compare.filtered"], {
            shown: candidates.length,
            total: allCandidates.length,
          })}{" "}
          <Link
            href={localizePath(`/races/${race.slug}/compare`, locale)}
            className="link font-medium"
          >
            {s["picker.show_everyone"]}
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
        <CompareScrollHint
          candidateCount={candidates.length}
          label={s["scroll.hint"]}
        />
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
              Candidate positions for {localizeRaceName(race.name, locale)}, by issue
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-48 border-b-2 border-paper-edge bg-paper-warm p-3 align-bottom text-sm font-semibold text-ink"
                >
                  {s["compare.issue_heading"]}
                </th>
                {candidates.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="w-80 border-b-2 border-paper-edge bg-paper-warm p-3 align-bottom"
                  >
                    <Link
                      href={localizePath(`/races/${race.slug}/${c.slug}`, locale)}
                      className="text-base font-semibold text-ink no-underline hover:text-accent"
                    >
                      <span className={isWithdrawn(c) ? "line-through" : undefined}>
                        {c.name}
                      </span>
                    </Link>
                    <PartyPill party={c.party} locale={locale} />
                    {isWithdrawn(c) && (
                      <span className="ml-2 inline-block align-middle">
                        <WithdrawnPill labels={withdrawnLabels} />
                      </span>
                    )}
                    {c.is_winner && (
                      <span className="ml-2 inline-block align-middle">
                        <WinnerPill
                          isWinner={c.is_winner}
                          resultStatus={c.result_status}
                          labels={pillLabels}
                        />
                      </span>
                    )}
                    {c.email && (
                      <CandidateEmail
                        email={c.email}
                        className="mt-1 text-xs font-normal"
                      />
                    )}
                    <p className="mt-1 text-xs font-normal">
                      <WebsiteLink
                        website={c.website}
                        socials={c.socials}
                        verifiedLinks={c.verified_links}
                        candidateName={c.name}
                        labels={{ none: s["weblink.none"] }}
                      />
                    </p>
                    {responseByCandidate.get(c.id) && (
                      <p className="mt-1 text-xs font-normal">
                        <Link
                          href={`${localizePath(`/races/${race.slug}/${c.slug}`, locale)}#resp-${c.slug}-top`}
                          className="link"
                        >
                          {formatUi(s["compare.read_response"], {
                            firstName: c.name.split(" ")[0],
                          })}
                        </Link>
                      </p>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Bio sits above the issues, one cell per candidate, clamped
                  exactly like the issue cells. The row is bg-paper so the
                  zebra striping of the issue rows below it still alternates. */}
              <tr className="bg-paper">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-paper-edge bg-paper p-3 align-top text-sm font-semibold text-ink"
                >
                  {s["compare.bio_heading"]}
                </th>
                {candidates.map((c) => (
                  <td
                    key={c.id}
                    className="break-words border-b border-l border-paper-edge p-3 align-top"
                  >
                    <BioCell
                      bio={c.bio}
                      correctionHref={correctionFor(c.name)}
                      resolved={content.bios.get(c.slug)}
                      nativeLocale={c.bio_locale ?? "en"}
                      locale={locale}
                      strings={s}
                    />
                  </td>
                ))}
              </tr>
              {issues.map((issue, i) => (
                <tr key={issue.id} className={i % 2 === 1 ? "bg-paper" : undefined}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 border-b border-paper-edge p-3 align-top text-sm font-semibold text-ink ${i % 2 === 1 ? "bg-paper" : "bg-paper-warm"}`}
                  >
                    <TranslatedText
                      resolved={
                        content.issueNames.get(issue.id) ?? {
                          text: issue.name,
                          isAiTranslation: false,
                          isNative: true,
                        }
                      }
                      nativeLocale={issue.name_locale ?? "en"}
                      locale={locale}
                    />
                    {issue.voter_question && (
                      <span className="mt-1 block text-xs font-normal italic text-ink-faint">
                        <TranslatedText
                          resolved={
                            content.issueQuestions.get(issue.id) ?? {
                              text: issue.voter_question,
                              isAiTranslation: false,
                              isNative: true,
                            }
                          }
                          nativeLocale={issue.name_locale ?? "en"}
                          locale={locale}
                        />
                      </span>
                    )}
                  </th>
                  {candidates.map((c) => (
                    <td
                      key={c.id}
                      className="break-words border-b border-l border-paper-edge p-3 align-top"
                    >
                      <Clampable labels={clampLabels}>
                        <PositionCell
                          positions={byCell.get(key(c.id, issue.id)) ?? []}
                          correctionHref={correctionFor(c.name)}
                          contactedAt={c.contacted_at}
                          respondedAt={c.responded_at}
                          lookedAt={c.last_reviewed_at}
                          withdrawn={isWithdrawn(c)}
                          fullResponseLink={fullResponseLinkFor(
                            c.id,
                            c.slug,
                            issue.slug,
                            content.issueNames.get(issue.id)?.text ?? issue.name,
                            byCell.get(key(c.id, issue.id)) ?? []
                          )}
                          localized={content.positions}
                          locale={locale}
                          strings={s}
                        />
                      </Clampable>
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
        <section aria-labelledby="m-bio">
          <h2
            id="m-bio"
            className="border-b-2 border-paper-edge pb-2 text-lg"
          >
            {s["compare.bio_heading"]}
          </h2>
          <div className="mt-3 space-y-3">
            {candidates.map((c) => (
              <div key={c.id} className="card">
                <h3 className="text-sm">
                  <Link
                    href={localizePath(`/races/${race.slug}/${c.slug}`, locale)}
                    className="font-semibold text-ink no-underline hover:text-accent"
                  >
                    {c.name}
                  </Link>{" "}
                  <WinnerPill
                    isWinner={c.is_winner}
                    resultStatus={c.result_status}
                    labels={pillLabels}
                  />
                </h3>
                {c.email && (
                  <CandidateEmail email={c.email} className="mt-1 text-xs" />
                )}
                <div className="mt-2">
                  <BioCell
                    bio={c.bio}
                    correctionHref={correctionFor(c.name)}
                    resolved={content.bios.get(c.slug)}
                    nativeLocale={c.bio_locale ?? "en"}
                    locale={locale}
                    strings={s}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        {issues.map((issue) => (
          <section key={issue.id} aria-labelledby={`m-${issue.slug}`}>
            <h2
              id={`m-${issue.slug}`}
              className="border-b-2 border-paper-edge pb-2 text-lg"
            >
              <TranslatedText
                resolved={
                  content.issueNames.get(issue.id) ?? {
                    text: issue.name,
                    isAiTranslation: false,
                    isNative: true,
                  }
                }
                nativeLocale={issue.name_locale ?? "en"}
                locale={locale}
              />
            </h2>
            {issue.voter_question && (
              <p className="mt-1 text-sm italic text-ink-faint">
                <TranslatedText
                  resolved={
                    content.issueQuestions.get(issue.id) ?? {
                      text: issue.voter_question,
                      isAiTranslation: false,
                      isNative: true,
                    }
                  }
                  nativeLocale={issue.name_locale ?? "en"}
                  locale={locale}
                />
              </p>
            )}
            <div className="mt-3 space-y-3">
              {candidates.map((c) => (
                <div key={c.id} className="card">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-sm">
                      <Link
                        href={localizePath(`/races/${race.slug}/${c.slug}`, locale)}
                        className="font-semibold text-ink no-underline hover:text-accent"
                      >
                        <span className={isWithdrawn(c) ? "line-through" : undefined}>
                          {c.name}
                        </span>
                      </Link>{" "}
                      <PartyPill party={c.party} locale={locale} />
                      {isWithdrawn(c) && <WithdrawnPill labels={withdrawnLabels} />}
                      <WinnerPill
                        isWinner={c.is_winner}
                        resultStatus={c.result_status}
                        labels={pillLabels}
                      />
                    </h3>
                    {c.email && (
                      <CandidateEmail email={c.email} className="text-xs" />
                    )}
                    <p className="text-xs">
                      <WebsiteLink
                        website={c.website}
                        socials={c.socials}
                        verifiedLinks={c.verified_links}
                        candidateName={c.name}
                        labels={{ none: s["weblink.none"] }}
                      />
                    </p>
                    {responseByCandidate.get(c.id) && (
                      <p className="mt-1 text-xs">
                        <Link
                          href={`${localizePath(`/races/${race.slug}/${c.slug}`, locale)}#resp-${c.slug}-top`}
                          className="link"
                        >
                          {formatUi(s["compare.read_response"], {
                            firstName: c.name.split(" ")[0],
                          })}
                        </Link>
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Clampable labels={clampLabels}>
                      <PositionCell
                        positions={byCell.get(key(c.id, issue.id)) ?? []}
                        correctionHref={correctionFor(c.name)}
                        contactedAt={c.contacted_at}
                        respondedAt={c.responded_at}
                        lookedAt={c.last_reviewed_at}
                        withdrawn={isWithdrawn(c)}
                        fullResponseLink={fullResponseLinkFor(
                          c.id,
                          c.slug,
                          issue.slug,
                          content.issueNames.get(issue.id)?.text ?? issue.name,
                          byCell.get(key(c.id, issue.id)) ?? []
                        )}
                        localized={content.positions}
                        locale={locale}
                        strings={s}
                      />
                    </Clampable>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <TranslationFootnote locale={locale} show={content.hasAi} />

      <div className="mt-10 rounded-lg border border-paper-edge bg-paper p-5">
        <h2 className="text-base">{s["compare.wrong_heading"]}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {s["compare.wrong_body"]}
        </p>
        <p className="mt-3">
          <Link
            href={`${localizePath("/corrections", locale)}?page=${encodeURIComponent(localizePath(`/races/${race.slug}/compare`, locale))}`}
            className="link tap-target text-sm font-medium"
          >
            {s["compare.wrong_link"]}
          </Link>
        </p>
      </div>
      <ResultsSourceNote
        hasWinner={hasWinner}
        hasAcclaimedWinner={hasAcclaimedWinner}
        uncontested={uncontested}
        source={RESULTS_SOURCES[race.slug] ?? null}
        labels={{
          notAvailableLong: s["results.not_available_long"],
          acclaimedNoSource: s["results.acclaimed_no_source"],
          sourceLabel: s["results.source_label"],
        }}
      />
    </div>
  );
}
