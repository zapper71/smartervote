import Link from "next/link";
import {
  formatElectionDate,
  upcomingElections,
} from "@/lib/tracked-elections";
import { getUiStrings } from "@/lib/queries";
import { localizePath, type Locale } from "@/lib/i18n";
import { PROVINCE_NAME_KEYS } from "@/components/pages/chrome";

/** elections.level_* key for each level value in TRACKED_ELECTIONS. */
const LEVEL_KEYS: Record<string, string> = {
  Provincial: "elections.level_provincial",
  Municipal: "elections.level_municipal",
  "RM elections": "elections.level_rm",
  "Hamlet elections": "elections.level_hamlet",
  "Federal byelections": "elections.level_federal_byelections",
};

/**
 * Upcoming page body, shared by the English route and the /fr wrapper.
 * The window is relative to the current date, so the route files keep
 * `dynamic = "force-dynamic"`. No database content renders here, so there
 * is no translations fetch and no footnote. The heading reuses the
 * upcoming.meta_title row — there is no separate heading row, and the
 * text is identical.
 */
export default async function UpcomingPage({ locale }: { locale: Locale }) {
  const elections = upcomingElections();
  const s = await getUiStrings(locale, {
    "upcoming.meta_title": "Recent & Upcoming Elections",
    "upcoming.intro":
      "Elections finished within the last month, plus elections coming up within the next three months.",
    "upcoming.none": "No elections in this window.",
    "upcoming.coming_soon": "Coming soon",
    "elections.level_provincial": "Provincial",
    "elections.level_municipal": "Municipal",
    "elections.level_rm": "RM elections",
    "elections.level_hamlet": "Hamlet elections",
    "elections.level_federal_byelections": "Federal byelections",
    "finder.province_ontario": "Ontario",
    "finder.province_bc": "British Columbia",
    "finder.province_sk": "Saskatchewan",
    "finder.province_qc": "Quebec",
    "elections.province_alberta": "Alberta",
    "elections.province_manitoba": "Manitoba",
    "elections.province_nb": "New Brunswick",
    "elections.province_nl": "Newfoundland and Labrador",
    "elections.province_ns": "Nova Scotia",
    "elections.province_nwt": "Northwest Territories",
    "elections.province_nunavut": "Nunavut",
    "elections.province_pei": "Prince Edward Island",
    "elections.province_yukon": "Yukon",
  });

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{s["upcoming.meta_title"]}</h1>
      <p className="prose-civic mt-4">{s["upcoming.intro"]}</p>

      {elections.length === 0 ? (
        <p className="mt-6 text-ink-soft">{s["upcoming.none"]}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {elections.map((e) => (
            <li key={`${e.provinceSlug}-${e.date}`} className="card">
              <Link
                href={localizePath(`/provinces/${e.provinceSlug}`, locale)}
                className="tap-target font-medium text-ink no-underline hover:text-accent"
              >
                {PROVINCE_NAME_KEYS[e.provinceSlug]
                  ? s[PROVINCE_NAME_KEYS[e.provinceSlug]]
                  : e.provinceName}{" "}
                &mdash; {LEVEL_KEYS[e.level] ? s[LEVEL_KEYS[e.level]] : e.level}{" "}
                &rarr;
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {formatElectionDate(e.date, locale)}
              </p>
              {!e.hasCandidateInfo && (
                <p className="mt-1 text-sm text-ink-soft">
                  {s["upcoming.coming_soon"]}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
