import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidate, getIssues } from "@/lib/queries";
import CandidateInputForm from "@/components/CandidateInputForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ race: string; candidate: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race, candidate } = await params;
  const result = await getCandidate(race, candidate);
  if (!result) return { title: "Candidate not found" };
  return {
    title: `Share your positions — ${result.candidate.name}`,
    description: `Candidate input form for ${result.candidate.name} (${result.race.name}). Submissions go live only after SmarterVote review.`,
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * Public candidate input page. Roster-only: an unknown race/candidate
 * slug 404s, so nobody can self-register a ballot slot through this
 * form — the roster row must already exist (seeded by migration).
 */
export default async function CandidateInputPage({ params }: Props) {
  const { race: raceSlug, candidate: candidateSlug } = await params;
  const result = await getCandidate(raceSlug, candidateSlug);
  if (!result) notFound();
  const { race, candidate } = result;
  const issues = await getIssues(race.race_type, race.municipality_id);

  return (
    <div>
      <p className="text-sm">
        <Link href={`/races/${race.slug}/${candidate.slug}`} className="link">
          &larr; Back to {candidate.name}&rsquo;s page
        </Link>
      </p>
      <h1 className="mt-3 text-3xl">Share your positions</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {candidate.name} — candidate for {race.name}
      </p>
      {!candidate.email && (
        <p className="mt-3 rounded-md border border-paper-edge bg-paper px-4 py-3 text-sm text-ink-soft">
          There is no official email address on file for this candidate, so
          this submission will be manually verified before review instead of
          going through email confirmation.
        </p>
      )}
      <CandidateInputForm
        raceSlug={race.slug}
        candidateSlug={candidate.slug}
        candidateName={candidate.name}
        rosterEmail={candidate.email ?? null}
        issues={issues}
      />
    </div>
  );
}
