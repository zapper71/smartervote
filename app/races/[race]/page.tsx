import type { Metadata } from "next";
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
  getPositionsForCandidates,
  getRaceBySlugGlobal,
  getRaces,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { contestLabel, formatDate } from "@/lib/dates";

export const revalidate = 300;

type Props = { params: Promise<{ race: string }> };

export async function generateStaticParams() {
  // Resilient on purpose: a database blip must not fail the deploy.
  // Anything not listed here still renders on demand.
  try {
    const races = await getRaces();
    return races.map((r) => ({ race: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race: slug } = await params;
  const found = await getRaceBySlugGlobal(slug);
  if (!found) return { title: "Race not found" };
  const { race, municipality } = found;
  // Huntsville keeps its exact long-standing description; everywhere else
  // gets the same shape with its own municipality's name.
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "the Town of Huntsville 2026 municipal election"
      : `the ${municipality?.name ?? "Huntsville"} 2026 election`;
  return {
    title: race.name,
    description:
      race.description ?? `Candidates for ${race.name} in ${place}.`,
  };
}

export default async function RacePage({ params }: Props) {
  const { race: slug } = await params;
  const found = await getRaceBySlugGlobal(slug);

  if (!found) {
    const anyRaces = await getRaces();
    // Distinguish "this race doesn't exist" from "the database is down".
    if (anyRaces.length === 0) return <UnavailableNotice what="This race" />;
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

  return (
    <div>
      <p className="text-sm">
        {isExpansion && municipality ? (
          <Link href={`/municipalities/${municipality.slug}`} className="link">
            &larr; {municipality.name} races
          </Link>
        ) : (
          <Link href="/municipalities/huntsville" className="link">
            &larr; Huntsville races
          </Link>
        )}
      </p>

      <h1 className="mt-3 text-3xl">{race.name}</h1>
      {race.ward_group_label && (
        <p className="mt-1 text-ink-faint">{race.ward_group_label}</p>
      )}
      <p className="mt-3 text-ink-soft">{contestLabel(candidates.length, race.seats)}</p>
      {!hasWinner && (
        <p className="mt-2">
          <ResultsNotAvailablePill />
        </p>
      )}
      {isExpansion && municipality && (
        <p className="mt-2 text-sm text-ink-soft">
          {municipality.name}
          {municipality.election_date
            ? ` · Election day ${formatDate(municipality.election_date)}`
            : ""}
          {municipality.voting_method ? ` · ${municipality.voting_method}` : ""}
        </p>
      )}
      {race.description && <p className="prose-civic mt-3">{race.description}</p>}

      {uncontested && (
        <div className="mt-6 rounded-lg border border-flag/30 bg-flag-light p-4">
          <h2 className="text-base text-ink">This seat was decided without an election</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {candidates.length === race.seats
              ? `Only ${candidates.length === 1 ? "one candidate" : `${candidates.length} candidates`} came forward for ${race.seats === 1 ? "this seat" : `these ${race.seats} seats`}, so ${race.seats === 1 ? "they were" : "they were all"} acclaimed. You won't see this race on your ballot.`
              : "Fewer candidates came forward than there are seats."}
          </p>
        </div>
      )}

      {race.seats > 1 && !uncontested && (
        <p className="mt-4 rounded-md bg-accent-light px-4 py-3 text-sm text-ink-soft">
          You can vote for up to <strong>{race.seats}</strong> candidates in this race.
        </p>
      )}

      {/* A compare link is only honest when published positions exist.
          Races still in listings mode (no published positions) must not lead
          into an empty comparison grid — they stay a candidate list. */}
      {positionsForRace.length > 0 && candidates.length > 1 && (
        <div className="mt-8 rounded-lg border border-accent/20 bg-accent-light p-5">
          <h2 className="text-base text-ink">See them side by side</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            All {candidates.length} candidates on the same ten issues, in one
            table. This is the quickest way to see where they actually differ.
          </p>
          <p className="mt-3">
            <Link
              href={`/races/${race.slug}/compare`}
              className="tap-target inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-accent-hover"
            >
              Compare all {candidates.length} candidates &rarr;
            </Link>
          </p>
        </div>
      )}
      {isExpansion &&
        positionsForRace.length === 0 &&
        candidates.length > 1 && (
          <p className="mt-8 rounded-lg border border-paper-edge bg-paper-warm px-4 py-3 text-sm text-ink-soft">
            This race does not have a deep-dive analysis done for it.
            The candidates - and their websites where we have them - are
            listed below.
          </p>
        )}

      <h2 className="mt-10 text-xl">
        {uncontested ? "Acclaimed" : `Candidates (${candidates.length})`}
      </h2>

      {candidates.length === 0 ? (
        <div className="mt-4">
          <UnavailableNotice what="The candidate list for this race" />
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
                    href={`/races/${race.slug}/${c.slug}`}
                    className="text-ink no-underline hover:text-accent"
                  >
                    <span className={c.status === "withdrawn" ? "line-through" : undefined}>
                      {c.name}
                    </span>
                  </Link>
                )}{" "}
                {c.status === "withdrawn" && <WithdrawnPill />}
                <WinnerPill
                  isWinner={c.is_winner}
                  resultStatus={c.result_status}
                />
                <PartyPill party={c.party} />
              </h3>
              {c.email && <CandidateEmail email={c.email} />}
              {c.status === "acclaimed" && (
                <span className="pill mt-2 bg-flag-light text-flag">Acclaimed</span>
              )}
              <p className="mt-3 text-sm">
                <WebsiteLink
                  website={c.website}
                  socials={c.socials}
                  verifiedLinks={c.verified_links}
                  candidateName={c.name}
                />
              </p>
              <p className="mt-3">
                <Link
                  href={`/races/${race.slug}/${c.slug}`}
                  className="link tap-target text-sm font-medium"
                >
                  See where they stand &rarr;
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Every candidate is listed in the same format, in alphabetical order.
          Stating that here is part of the neutrality guarantee, not decoration. */}
      <p className="mt-8 text-sm text-ink-faint">
        Candidates are listed alphabetically by surname-agnostic name order, not by
        preference. Every candidate in this race gets the same page template and the same
        list of issues.{" "}
        <Link href="/methodology" className="link">
          How this works
        </Link>
        .
      </p>
      <ResultsSourceNote
        hasWinner={hasWinner}
        hasAcclaimedWinner={hasAcclaimedWinner}
        source={RESULTS_SOURCES[race.slug] ?? null}
      />
    </div>
  );
}
