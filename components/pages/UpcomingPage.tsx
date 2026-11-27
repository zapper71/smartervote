import Link from "next/link";
import {
  formatElectionDate,
  upcomingElections,
} from "@/lib/tracked-elections";
import { localizePath, type Locale } from "@/lib/i18n";

/**
 * Upcoming page body, shared by the English route and the /fr wrapper.
 * The window is relative to the current date, so the route files keep
 * `dynamic = "force-dynamic"`. No database content renders here, so there
 * is no translations fetch and no footnote.
 */
export default function UpcomingPage({ locale }: { locale: Locale }) {
  const elections = upcomingElections();

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">Recent &amp; Upcoming Elections</h1>
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
                href={localizePath(`/provinces/${e.provinceSlug}`, locale)}
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
