import Link from "next/link";
import { contestLabel } from "@/lib/dates";
import type { RaceWithCandidates } from "@/lib/types";

export default function RaceCard({ race }: { race: RaceWithCandidates }) {
  const count = race.candidates.length;
  const uncontested = count > 0 && count <= race.seats;

  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base">
          <Link href={`/races/${race.slug}`} className="text-ink no-underline hover:text-accent">
            {race.name}
          </Link>
        </h3>
        {uncontested ? (
          <span className="pill bg-flag-light text-flag">Acclaimed</span>
        ) : (
          <span className="pill bg-accent-light text-accent">
            {race.seats} seat{race.seats === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {race.ward_group_label && (
        <p className="mt-1 text-sm text-ink-faint">{race.ward_group_label}</p>
      )}

      <p className="mt-2 text-sm text-ink-soft">{contestLabel(count, race.seats)}</p>

      {race.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{race.description}</p>
      )}

      {count > 0 && (
        <p className="mt-3 text-sm text-ink-faint">
          {race.candidates.map((c) => c.name).join(" · ")}
        </p>
      )}

      <p className="mt-4">
        <Link
          href={uncontested ? `/races/${race.slug}` : `/races/${race.slug}/compare`}
          className="link tap-target text-sm font-medium"
        >
          {uncontested ? "See who was acclaimed" : `Compare the ${count} candidates`} &rarr;
        </Link>
      </p>
    </li>
  );
}
