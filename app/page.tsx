import Link from "next/link";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import UnavailableNotice from "@/components/UnavailableNotice";
import { getMunicipality } from "@/lib/queries";
import { ADVANCE_VOTING_OPENS, VOTING_DAY, daysUntil, formatDate } from "@/lib/dates";

export const revalidate = 300;

export default async function HomePage() {
  // Huntsville is the one municipality with full, reviewed coverage — it
  // gets its own band below the finder rather than being buried in it.
  const huntsville = await getMunicipality();
  const votingDay = huntsville?.election_date ?? VOTING_DAY;
  const advanceOpens = huntsville?.advance_voting_opens ?? ADVANCE_VOTING_OPENS;
  const daysToVoting = daysUntil(votingDay);

  return (
    <div>
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Ontario &amp; British Columbia · 2026 elections
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          What the candidates actually say
        </h1>
        <p className="prose-civic mt-4">
          Official candidate lists tell you who&rsquo;s running. They don&rsquo;t tell
          you where the candidates differ. SmarterVote puts every candidate side
          by side on the same issues, in the same format, with a link to the
          source for every claim. Find your municipality or district to see
          who&rsquo;s on your ballot.
        </p>

        <MunicipalityFinder />

        <p className="mt-4 text-sm text-ink-faint">
          Coverage beyond Huntsville is at the listings stage — candidate names
          and races while full positions are researched.{" "}
          <Link href="/methodology" className="link">
            How this works
          </Link>
        </p>
      </section>

      {/* Huntsville: full coverage, prominently reachable, not duplicated —
          its races live at /races and this band only points there. */}
      <section
        aria-labelledby="huntsville-heading"
        className="mb-10 rounded-lg border border-accent/20 bg-accent-light p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="huntsville-heading" className="text-base">
            Huntsville 2026 — full coverage
          </h2>
          {daysToVoting !== null && (
            <p className="text-sm text-ink-soft">
              {daysToVoting === 0
                ? "Voting day is today"
                : `Voting day ${formatDate(votingDay)} · in ${daysToVoting} days`}
            </p>
          )}
        </div>
        <p className="prose-civic mt-2 text-sm">
          Every Huntsville candidate, side by side on the same issues, with
          reviewed positions and candidate replies. Advance voting opened{" "}
          {formatDate(advanceOpens)}; voting is by internet and telephone.
        </p>
        <p className="mt-4">
          <Link
            href="/races"
            className="tap-target rounded-md bg-accent px-5 py-2.5 font-medium text-white no-underline hover:bg-accent-hover"
          >
            See the Huntsville races &rarr;
          </Link>
        </p>
      </section>

      {!huntsville && (
        <div className="mb-10">
          <UnavailableNotice what="Huntsville election information" />
        </div>
      )}
    </div>
  );
}
