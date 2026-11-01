import type { Metadata } from "next";
import Link from "next/link";
import {
  formatElectionDate,
  upcomingElections,
} from "@/lib/tracked-elections";

export const metadata: Metadata = {
  title: "Upcoming elections",
  description:
    "Elections finished within the last month and elections coming up within the next three months, tracked by SmarterVote.",
};

// The window is relative to the current date, so it must be computed per
// request, not once at build time.
export const dynamic = "force-dynamic";

export default function UpcomingPage() {
  const elections = upcomingElections();

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">Upcoming elections</h1>
      <p className="prose-civic mt-4">
        Elections finished within the last month, plus elections coming up
        within the next three months.
      </p>

      {elections.length === 0 ? (
        <p className="mt-6 text-ink-soft">No elections in this window.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {elections.map((e) => (
            <li key={`${e.provinceSlug}-${e.date}`} className="card">
              <Link
                href={`/provinces/${e.provinceSlug}`}
                className="tap-target font-medium text-ink no-underline hover:text-accent"
              >
                {e.provinceName} &mdash; {e.level} &rarr;
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {formatElectionDate(e.date)}
              </p>
              {!e.hasCandidateInfo && (
                <p className="mt-1 text-sm text-ink-soft">Coming soon</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
