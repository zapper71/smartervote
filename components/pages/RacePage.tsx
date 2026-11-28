import Link from "next/link";
import { notFound } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import WebsiteLink from "@/components/WebsiteLink";
import CandidateEmail from "@/components/CandidateEmail";
import WithdrawnPill from "@/components/WithdrawnPill";
import WinnerPill from "@/components/WinnerPill";
import ResultsNotAvailablePill from "@/components/ResultsNotAvailablePill";
import ResultsSourceNote from "@/components/ResultsSourceNote";
import { RESULTS_SOURCES } from "@/lib/results-sources";
import PartyPill from "@/components/PartyPill";
import {
  getCandidatesForRace,
  getIssues,
  getPositionsForCandidates,
  getRaceBySlugGlobal,
  getRaces,
  getUiStrings,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { contestLabel, formatDate } from "@/lib/dates";
import { formatUi, localizePath, type Locale } from "@/lib/i18n";
import { splitMarker } from "@/components/pages/chrome";

type Props = { params: Promise<{ race: string }>; locale: Locale };

/**
 * Link-text boundary marker for the listing note. "How this works" has
 * no separate row inside that template — it is split out per locale.
 */
const HOW_MARKERS: Record<Locale, string> = {
  en: "How this works",
  fr: "Comment ça fonctionne",
  // Phase 2: race.listing_note translations must contain exactly this
  // phrase, or the link below silently stops splitting. It must equal
  // the nav.how_it_works ui_string translation in each locale.
  "zh-Hans": "运作方式",
  "zh-Hant": "運作方式",
  ta: "இது எப்படி இயங்குகிறது",
  pa: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
};

/**
 * Race page body, shared by the English route and the /fr wrapper.
 * No issue names, positions or bios render here — only candidate cards —
 * so there is no translations fetch and no footnote. The one content
 * fix carried in: the compare box counts the race's actual issues
 * (getIssues) instead of the hard-coded "ten".
 */
export default async function RacePage({ params, locale }: Props) {
  const { race: slug } = await params;
  const found = await getRaceBySlugGlobal(slug);

  if (!found) {
    const anyRaces = await getRaces();
    // Distinguish "this race doesn't exist" from "the database is down".
    if (anyRaces.length === 0) {
      const s0 = await getUiStrings(locale, {
        "notice.unavailable_title": "{what} isn’t available right now",
        "notice.what_race": "This race",
        "notice.body":
          "Something went wrong loading this page. It’s a problem on our end, not yours. For official candidate and voting information, go straight to the official source for your election — the authority running it.",
      });
      return (
        <UnavailableNotice
          what={s0["notice.what_race"]}
          locale={locale}
          strings={s0}
        />
      );
    }
    notFound();
  }

  const { race, municipality } = found;
  // Expansion races use their own municipality's context — name, election
  // dates, voting method — instead of assuming Huntsville. Huntsville's
  // page renders exactly as before: no election-info line is added for it.
  const isExpansion = municipality?.slug !== MUNICIPALITY_SLUG;

  const candidates = await getCandidatesForRace(race.id);
  const hasWinner = candidates.some((c) => c.is_winner);
  const winners = candidates.filter((c) => c.is_winner);
  const hasAcclaimedWinner =
    winners.length > 0 && winners.every((c) => c.status === "acclaimed");
  const uncontested = candidates.length > 0 && candidates.length <= race.seats;

  // Andreas's listings-tier rule, applied per candidate: a name links out to
  // the candidate's own website ONLY when the candidate has no researched
  // positions. Anyone with content keeps the internal candidate page as the
  // name link — the website stays visible in the WebsiteLink block below.
  // One query for the whole race, not N. Degrades to "no positions" (and
  // therefore to website links) only if the positions read fails; the card
  // still renders either way.
  const positionsForRace = await getPositionsForCandidates(
    candidates.map((c) => c.id)
  );
  const candidatesWithPositions = new Set(
    positionsForRace.map((p) => p.candidate_id)
  );
  // The compare box names the issue count — fetch it rather than hard-code
  // "ten" (it said ten for a week after the list grew to twelve).
  const issues = await getIssues(race.race_type, race.municipality_id);

  const s = await getUiStrings(locale, {
    "race.back_link": "{name} races",
    "race.election_day": "Election day {date}",
    "race.decided_heading": "This seat was decided without an election",
    "race.acclaimed_one":
      "Only one candidate came forward for this seat, so they were acclaimed. You won’t see this race on your ballot.",
    "race.acclaimed_many":
      "Only {count} candidates came forward for these {seats} seats, so they were all acclaimed. You won’t see this race on your ballot.",
    "race.acclaimed_fewer":
      "Fewer candidates came forward than there are seats.",
    "race.vote_up_to":
      "You can vote for up to {seats} candidates in this race.",
    "race.compare_heading": "See them side by side",
    "race.compare_body":
      "All {candidates} candidates on the same {issues} issues, in one table. This is the quickest way to see where they actually differ.",
    "race.compare_link": "Compare all {count} candidates →",
    "race.no_deep_dive":
      "This race does not have a deep-dive analysis done for it. The candidates - and their websites where we have them - are listed below.",
    "race.candidates_heading": "Candidates ({count})",
    "race.see_stands": "See where they stand →",
    "race.listing_note":
      "Candidates are listed alphabetically by surname-agnostic name order, not by preference. Every candidate in this race gets the same page template and the same list of issues. How this works.",
    "dates.contest": "{count} candidate(s) for {seats} seat(s)",
    "dates.contest_none": "No candidates listed · {seats} seat(s)",
    "dates.contest_acclaimed": " · acclaimed",
    "notice.unavailable_title": "{what} isn’t available right now",
    "notice.what_race": "This race",
    "notice.what_candidate_list": "The candidate list for this race",
    "notice.body":
      "Something went wrong loading this page. It’s a problem on our end, not yours. For official candidate and voting information, go straight to the official source for your election — the authority running it.",
    "results.pill": "Results not available",
    "results.pill_title": "No result recorded for this race yet",
    "results.not_available_long":
      "Results not available means that the counts are still in progress, the counts are too close to call, or the result has not been collected and verified on SmarterVote yet.",
    "results.acclaimed_no_source": "Acclaimed candidates do not have a source.",
    "results.source_label": "Results source: ",
    "pill.acclaimed": "Acclaimed",
    "pill.elected": "Elected",
    "pill.elected_unofficial": "Elected — unofficial result",
    "pill.elected_official_title": "Elected — official result",
    "pill.withdrawn": "Withdrawn",
    "pill.withdrawn_title":
      "Withdrew after nomination; still on the printed ballot",
    "weblink.none": "No website or social media listed",
    "nav.how_it_works": "How this works",
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
  const [voteBefore, voteAfter] = s["race.vote_up_to"].split("{seats}");
  const [noteBefore, noteAfter, noteHasLink] = splitMarker(
    s["race.listing_note"],
    HOW_MARKERS[locale]
  );

  return (
    <div>
      <p className="text-sm">
        {isExpansion && municipality ? (
          <Link
            href={localizePath(`/municipalities/${municipality.slug}`, locale)}
            className="link"
          >
            &larr;{" "}
            {formatUi(s["race.back_link"], { name: municipality.name })}
          </Link>
        ) : (
          <Link href={localizePath("/municipalities/huntsville", locale)} className="link">
            &larr; {formatUi(s["race.back_link"], { name: "Huntsville" })}
          </Link>
        )}
      </p>

      <h1 className="mt-3 text-3xl">{race.name}</h1>
      {race.ward_group_label && (
        <p className="mt-1 text-ink-faint">{race.ward_group_label}</p>
      )}
      <p className="mt-3 text-ink-soft">
        {contestLabel(candidates.length, race.seats, contestTemplates)}
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
      {isExpansion && municipality && (
        <p className="mt-2 text-sm text-ink-soft">
          {municipality.name}
          {municipality.election_date
            ? ` · ${formatUi(s["race.election_day"], {
                date: formatDate(municipality.election_date, locale),
              })}`
            : ""}
          {municipality.voting_method ? ` · ${municipality.voting_method}` : ""}
        </p>
      )}
      {race.description && <p className="prose-civic mt-3">{race.description}</p>}

      {uncontested && (
        <div className="mt-6 rounded-lg border border-flag/30 bg-flag-light p-4">
          <h2 className="text-base text-ink">{s["race.decided_heading"]}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {candidates.length === race.seats
              ? candidates.length === 1
                ? s["race.acclaimed_one"]
                : formatUi(s["race.acclaimed_many"], {
                    count: candidates.length,
                    seats: race.seats,
                  })
              : s["race.acclaimed_fewer"]}
          </p>
        </div>
      )}

      {race.seats > 1 && !uncontested && (
        <p className="mt-4 rounded-md bg-accent-light px-4 py-3 text-sm text-ink-soft">
          {voteBefore}
          <strong>{race.seats}</strong>
          {voteAfter}
        </p>
      )}

      {/* A compare link is only honest when published positions exist.
          Races still in listings mode (no published positions) must not lead
          into an empty comparison grid — they stay a candidate list. */}
      {positionsForRace.length > 0 && candidates.length > 1 && (
        <div className="mt-8 rounded-lg border border-accent/20 bg-accent-light p-5">
          <h2 className="text-base text-ink">{s["race.compare_heading"]}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {formatUi(s["race.compare_body"], {
              candidates: candidates.length,
              issues: issues.length,
            })}
          </p>
          <p className="mt-3">
            <Link
              href={localizePath(`/races/${race.slug}/compare`, locale)}
              className="tap-target inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-accent-hover"
            >
              {formatUi(s["race.compare_link"], { count: candidates.length })}
            </Link>
          </p>
        </div>
      )}
      {isExpansion &&
        positionsForRace.length === 0 &&
        candidates.length > 1 && (
          <p className="mt-8 rounded-lg border border-paper-edge bg-paper-warm px-4 py-3 text-sm text-ink-soft">
            {s["race.no_deep_dive"]}
          </p>
        )}

      <h2 className="mt-10 text-xl">
        {uncontested
          ? s["pill.acclaimed"]
          : formatUi(s["race.candidates_heading"], { count: candidates.length })}
      </h2>

      {candidates.length === 0 ? (
        <div className="mt-4">
          <UnavailableNotice
            what={s["notice.what_candidate_list"]}
            locale={locale}
            strings={s}
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {candidates.map((c) => (
            <li key={c.id} className="card">
              <h3 className="text-base">
                {/* A withdrawn candidate's name is struck through and carries
                    the grey Withdrawn pill, wherever it renders. The pill sits
                    outside the struck name so the label itself stays readable. */}
                {c.website && !candidatesWithPositions.has(c.id) ? (
                  <a
                    href={c.website}
                    className="text-ink no-underline hover:text-accent"
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                  >
                    <span className={c.status === "withdrawn" ? "line-through" : undefined}>
                      {c.name}
                    </span>
                    <span aria-hidden="true" className="ml-0.5 text-xs">
                      ↗
                    </span>
                    <span className="sr-only">
                      {" "}
                      — {c.name}&rsquo;s campaign website, opens in a new tab
                    </span>
                  </a>
                ) : (
                  <Link
                    href={localizePath(`/races/${race.slug}/${c.slug}`, locale)}
                    className="text-ink no-underline hover:text-accent"
                  >
                    <span className={c.status === "withdrawn" ? "line-through" : undefined}>
                      {c.name}
                    </span>
                  </Link>
                )}{" "}
                {c.status === "withdrawn" && (
                  <WithdrawnPill
                    labels={{
                      withdrawn: s["pill.withdrawn"],
                      title: s["pill.withdrawn_title"],
                    }}
                  />
                )}
                <WinnerPill
                  isWinner={c.is_winner}
                  resultStatus={c.result_status}
                  labels={pillLabels}
                />
                <PartyPill party={c.party} />
              </h3>
              {c.email && <CandidateEmail email={c.email} />}
              {c.status === "acclaimed" && (
                <span className="pill mt-2 bg-flag-light text-flag">
                  {s["pill.acclaimed"]}
                </span>
              )}
              <p className="mt-3 text-sm">
                <WebsiteLink
                  website={c.website}
                  socials={c.socials}
                  verifiedLinks={c.verified_links}
                  candidateName={c.name}
                  labels={{ none: s["weblink.none"] }}
                />
              </p>
              <p className="mt-3">
                <Link
                  href={localizePath(`/races/${race.slug}/${c.slug}`, locale)}
                  className="link tap-target text-sm font-medium"
                >
                  {s["race.see_stands"]}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Every candidate is listed in the same format, in alphabetical order.
          Stating that here is part of the neutrality guarantee, not decoration. */}
      <p className="mt-8 text-sm text-ink-faint">
        {noteHasLink ? (
          <>
            {noteBefore}
            <Link href={localizePath("/methodology", locale)} className="link">
              {HOW_MARKERS[locale]}
            </Link>
            {noteAfter}
          </>
        ) : (
          s["race.listing_note"]
        )}
      </p>
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
