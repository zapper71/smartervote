import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidate, getCandidatesForRace, getPositions, getRaces } from "@/lib/queries";
import { formatShortDate } from "@/lib/dates";

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
  const positions = await getPositions(candidate.id);
  const socials = Object.entries(candidate.socials ?? {}).filter(([, v]) => Boolean(v));

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
        <p className="pill mt-3 bg-flag-light text-flag">Acclaimed — no election for this seat</p>
      )}

      {/* Where to hear from them directly. Listed before our summaries on
          purpose: the candidate's own words outrank ours. */}
      <section aria-labelledby="contact-heading" className="mt-6 card">
        <h2 id="contact-heading" className="text-base">
          In their own words
        </h2>
        {candidate.website || socials.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {candidate.website && (
              <li>
                <a
                  href={candidate.website}
                  className="link tap-target font-medium"
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  Campaign website &rarr;
                </a>
              </li>
            )}
            {socials.map(([k, v]) => (
              <li key={k} className="text-ink-soft">
                <span className="text-ink-faint">{SOCIAL_LABELS[k] ?? k}:</span> {v}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This candidate hasn&rsquo;t listed a campaign website or social account with
            the Town. That says nothing about them as a candidate — it just means less of
            their material is published online for us to summarise.
          </p>
        )}
      </section>

      <h2 className="mt-10 text-xl">Where they stand</h2>

      {positions.length === 0 ? (
        <div className="mt-4 card border-flag/30 bg-flag-light">
          <h3 className="text-base text-ink">Not published yet</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We haven&rsquo;t published positions for this candidate yet. Positions are
            added once they&rsquo;ve been sourced to something the candidate actually
            said or wrote, and reviewed by a human. Nothing gets guessed at.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            If you&rsquo;re the candidate and you&rsquo;d like your positions here
            sooner,{" "}
            <Link href="/corrections" className="link">
              tell us
            </Link>{" "}
            and we&rsquo;ll prioritise it.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {positions.map((p) => (
            <article key={p.id} className="card">
              <h3 className="text-base">{p.issue_name}</h3>

              {p.no_public_position ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  No public position found on this issue
                  {p.reviewed_at ? ` as of ${formatShortDate(p.reviewed_at)}` : ""}. That
                  isn&rsquo;t a judgment about the candidate — we simply couldn&rsquo;t
                  find anything they&rsquo;ve said about it.{" "}
                  <Link href="/corrections" className="link">
                    Know otherwise?
                  </Link>
                </p>
              ) : (
                <>
                  {p.summary_short && (
                    <p className="mt-2 font-medium text-ink">{p.summary_short}</p>
                  )}
                  {p.summary_bullets && p.summary_bullets.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
                      {p.summary_bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {p.verbatim_quote && (
                    <blockquote className="mt-4 border-l-2 border-accent/40 pl-4 text-sm italic leading-relaxed text-ink-soft">
                      &ldquo;{p.verbatim_quote}&rdquo;
                    </blockquote>
                  )}
                  {/* Non-negotiable: no position publishes without this. */}
                  <p className="mt-3 text-xs text-ink-faint">
                    Source:{" "}
                    {p.source_url ? (
                      <a
                        href={p.source_url}
                        className="link"
                        rel="noopener noreferrer nofollow"
                        target="_blank"
                      >
                        {p.source_title ?? p.source_url}
                      </a>
                    ) : (
                      (p.source_title ?? "—")
                    )}
                    {p.source_date ? ` · ${formatShortDate(p.source_date)}` : ""}
                    {p.reviewed_at ? ` · reviewed ${formatShortDate(p.reviewed_at)}` : ""}
                  </p>
                </>
              )}
            </article>
          ))}
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
          <Link href="/corrections" className="link tap-target text-sm font-medium">
            Report a correction &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
