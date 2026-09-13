import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import WebsiteLink from "@/components/WebsiteLink";
import { getCandidatesForRace, getRace, getRaces } from "@/lib/queries";
import { contestLabel } from "@/lib/dates";

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
  const race = await getRace(slug);
  if (!race) return { title: "Race not found" };
  return {
    title: race.name,
    description:
      race.description ??
      `Candidates for ${race.name} in the Town of Huntsville 2026 municipal election.`,
  };
}

export default async function RacePage({ params }: Props) {
  const { race: slug } = await params;
  const race = await getRace(slug);

  if (!race) {
    const anyRaces = await getRaces();
    // Distinguish "this race doesn't exist" from "the database is down".
    if (anyRaces.length === 0) return <UnavailableNotice what="This race" />;
    notFound();
  }

  const candidates = await getCandidatesForRace(race.id);
  const uncontested = candidates.length > 0 && candidates.length <= race.seats;

  return (
    <div>
      <p className="text-sm">
        <Link href="/races" className="link">
          &larr; All races
        </Link>
      </p>

      <h1 className="mt-3 text-3xl">{race.name}</h1>
      {race.ward_group_label && (
        <p className="mt-1 text-ink-faint">{race.ward_group_label}</p>
      )}
      <p className="mt-3 text-ink-soft">{contestLabel(candidates.length, race.seats)}</p>
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

      {candidates.length > 1 && (
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
                <Link
                  href={`/races/${race.slug}/${c.slug}`}
                  className="text-ink no-underline hover:text-accent"
                >
                  {c.name}
                </Link>
              </h3>
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
    </div>
  );
}
