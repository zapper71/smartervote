import Link from "next/link";
import RaceCard from "@/components/RaceCard";
import UnavailableNotice from "@/components/UnavailableNotice";
import { getMunicipality, getRacesWithCandidates, getWards } from "@/lib/queries";
import { ADVANCE_VOTING_OPENS, VOTING_DAY, daysUntil, formatDate } from "@/lib/dates";

export const revalidate = 300;

export default async function HomePage() {
  const [municipality, races, wards] = await Promise.all([
    getMunicipality(),
    getRacesWithCandidates(),
    getWards(),
  ]);

  const votingDay = municipality?.election_date ?? VOTING_DAY;
  const advanceOpens = municipality?.advance_voting_opens ?? ADVANCE_VOTING_OPENS;
  const daysToAdvance = daysUntil(advanceOpens);
  const daysToVoting = daysUntil(votingDay);

  const council = races.filter((r) => r.race_type !== "school_board");
  const schoolBoards = races.filter((r) => r.race_type === "school_board");
  const totalCandidates = races.reduce((n, r) => n + r.candidates.length, 0);

  return (
    <div>
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Town of Huntsville · 2026 municipal &amp; school board election
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          What the candidates actually say
        </h1>
        <p className="prose-civic mt-4">
          The Town publishes a list of who&rsquo;s running. It doesn&rsquo;t tell you where
          they differ. This site puts every candidate side by side on the same issues, in
          the same format, with a link to the source for every claim.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/races"
            className="tap-target rounded-md bg-accent px-5 py-2.5 font-medium text-white no-underline hover:bg-accent-hover"
          >
            See the races
          </Link>
          <Link
            href="/methodology"
            className="tap-target rounded-md border border-paper-edge bg-paper px-5 py-2.5 font-medium text-ink no-underline hover:border-accent hover:text-accent"
          >
            How this works
          </Link>
        </div>
      </section>

      {/* Voting information, straight from the Town. */}
      <section
        aria-labelledby="voting-heading"
        className="mb-10 rounded-lg border border-accent/20 bg-accent-light p-5"
      >
        <h2 id="voting-heading" className="text-base">
          Voting in Huntsville
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-faint">
              Advance voting opens
            </dt>
            <dd className="mt-1 font-medium text-ink">{formatDate(advanceOpens)}</dd>
            {daysToAdvance !== null && (
              <dd className="text-sm text-ink-soft">
                {daysToAdvance === 0 ? "Open now" : `in ${daysToAdvance} days`}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-faint">Voting day</dt>
            <dd className="mt-1 font-medium text-ink">{formatDate(votingDay)}</dd>
            {daysToVoting !== null && (
              <dd className="text-sm text-ink-soft">
                {daysToVoting === 0 ? "Today" : `in ${daysToVoting} days`}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-faint">How to vote</dt>
            <dd className="mt-1 font-medium text-ink">
              {municipality?.voting_method ?? "Internet and telephone"}
            </dd>
            <dd className="text-sm text-ink-soft">No paper polling stations</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink-soft">
          To register, check your voter information, or get help voting, use the{" "}
          <a
            href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/voters/"
            className="link"
            rel="noopener noreferrer"
            target="_blank"
          >
            Town&rsquo;s official voter page
          </a>
          . SmarterVote can&rsquo;t register you or take your vote.
        </p>
      </section>

      {races.length === 0 ? (
        <UnavailableNotice what="Candidate information" />
      ) : (
        <>
          <section aria-labelledby="council-heading" className="mb-10">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="council-heading" className="text-xl">
                Town and District council
              </h2>
              <p className="text-sm text-ink-faint">
                {council.reduce((n, r) => n + r.seats, 0)} seats ·{" "}
                {council.reduce((n, r) => n + r.candidates.length, 0)} candidates
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {council.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="school-heading" className="mb-10">
            <h2 id="school-heading" className="mb-2 text-xl">
              School board trustees
            </h2>
            <p className="prose-civic mb-4 text-sm">
              School board races are the least-covered line on most ballots, and two of
              these were decided without a contest. Both facts are worth knowing before
              you vote.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {schoolBoards.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </ul>
          </section>

          {wards.length > 0 && (
            <section aria-labelledby="wards-heading" className="mb-10">
              <h2 id="wards-heading" className="mb-2 text-xl">
                Which ward am I in?
              </h2>
              <p className="prose-civic mb-4 text-sm">
                Huntsville has {wards.length} wards, grouped into three ward races.
                Everyone also votes for Mayor and for the three District and Town
                Councillors.
              </p>
              <ul className="flex flex-wrap gap-2">
                {wards.map((w) => (
                  <li
                    key={w.id}
                    className="rounded-md border border-paper-edge bg-paper px-3 py-2 text-sm"
                  >
                    <span className="text-ink-faint">Ward {w.number}</span>{" "}
                    <span className="font-medium text-ink">{w.name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-soft">
                Not sure which ward you live in? The Town has an{" "}
                <a
                  href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/election-resources/#ward-map"
                  className="link"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  interactive ward map
                </a>
                .
              </p>
            </section>
          )}

          <p className="text-sm text-ink-faint">
            {totalCandidates} certified candidates across {races.length} races. Candidate
            list sourced from the{" "}
            <a
              href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/certified-candidates/"
              className="link"
              rel="noopener noreferrer"
              target="_blank"
            >
              Town of Huntsville
            </a>
            . Nominations closed 21 August 2026.
          </p>
        </>
      )}
    </div>
  );
}
