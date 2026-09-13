import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCandidate,
  getCandidatesForRace,
  getIssues,
  getPositions,
  getRaces,
} from "@/lib/queries";
import { formatShortDate } from "@/lib/dates";
import PositionCell from "@/components/PositionCell";
import WebsiteLink from "@/components/WebsiteLink";

export const revalidate = 300;

type Props = { params: Promise<{ race: string; candidate: string }> };

export async function generateStaticParams() {
  try {
    const races = await getRaces();
    const out: { race: string; candidate: string }[] = [];
    for (const race of races) {
      const candidates = await getCandidatesForRace(race.id);
      for (const c of candidates) out.push({ race: race.slug, candidate: c.slug });
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race, candidate } = await params;
  const result = await getCandidate(race, candidate);
  if (!result) return { title: "Candidate not found" };
  return {
    title: `${result.candidate.name} — ${result.race.name}`,
    description: `Where ${result.candidate.name} stands on the issues in the Town of Huntsville 2026 municipal election, with a source for every claim.`,
  };
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

export default async function CandidatePage({ params }: Props) {
  const { race: raceSlug, candidate: candidateSlug } = await params;
  const result = await getCandidate(raceSlug, candidateSlug);
  if (!result) notFound();

  const { race, candidate } = result;
  // Scoped to the race type, so a trustee candidate isn't shown twelve
  // municipal issues they have no authority over. See getIssues().
  const [positions, issues] = await Promise.all([
    getPositions(candidate.id),
    getIssues(race.race_type),
  ]);
  const socials = Object.entries(candidate.socials ?? {}).filter(([, v]) => Boolean(v));

  // An issue can hold MORE than one position — see components/PositionCell.
  const byIssue = new Map<string, typeof positions>();
  for (const p of positions) {
    if (!byIssue.has(p.issue_id)) byIssue.set(p.issue_id, []);
    byIssue.get(p.issue_id)!.push(p);
  }
  const correctionHref = `/corrections?about=${encodeURIComponent(
    `${candidate.name} — ${race.name}`
  )}&page=${encodeURIComponent(`/races/${race.slug}/${candidate.slug}`)}`;

  return (
    <div>
      <p className="text-sm">
        <Link href={`/races/${race.slug}`} className="link">
          &larr; {race.name}
        </Link>
      </p>

      <h1 className="mt-3 text-3xl">{candidate.name}</h1>
      <p className="mt-1 text-ink-soft">
        Candidate for {race.name}
        {race.ward_group_label ? ` · ${race.ward_group_label}` : ""}
      </p>

      {candidate.status === "acclaimed" && (
        <p className="pill mt-3 bg-flag-light text-flag">
          Acclaimed — no election for this seat
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
            This candidate hasn&rsquo;t listed a campaign website or social account with
            the Town. That says nothing about them as a candidate — it just means less of
            their material is published online for us to summarise.
          </p>
        )}
      </section>

      <h2 className="mt-10 text-xl">Where they stand</h2>
      {/* issues.length rather than a hard-coded number. It said "the same ten
          issues" for a week after the list grew to twelve, and a page that
          states its own method should not be the thing that is out of date. */}
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
        Every candidate in this race is shown against the same {issues.length} issues, in
        the same order, whether or not we&rsquo;ve found something for each one.{" "}
        <Link href="/methodology" className="link">
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

            return (
              <article key={issue.id} className="card">
                <h3 className="text-base">{issue.name}</h3>
                {issue.voter_question && (
                  <p className="mt-1 text-sm italic text-ink-faint">
                    {issue.voter_question}
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
    </div>
  );
}
