import Link from "next/link";
import { PROVINCES } from "@/lib/tracked-elections";
import { getUiStrings } from "@/lib/queries";
import { localizePath, type Locale } from "@/lib/i18n";
import { PROVINCE_NAME_KEYS } from "@/components/pages/chrome";

/**
 * Home page body, shared by the English route and the /fr wrapper.
 * No database content renders here, so there is no translations fetch
 * and no footnote. Province names come from the province-name rows
 * (finder.province_* for ON/BC/SK/QC, elections.province_* for the
 * other nine) via PROVINCE_NAME_KEYS.
 */
export default async function HomePage({ locale }: { locale: Locale }) {
  const nameKeys: Record<string, string> = {};
  for (const p of PROVINCES) {
    const key = PROVINCE_NAME_KEYS[p.slug];
    if (key) nameKeys[key] = p.name;
  }
  const s = await getUiStrings(locale, {
    "home.upcoming_link": "Recent & Upcoming Elections →",
    "home.heading": "What the candidates actually say",
    "home.intro":
      "Official candidate lists tell you who’s running, not where candidates differ. SmarterVote puts every candidate side by side on the same issues, in the same format, with a link to the source for every claim.",
    "home.provinces_heading": "Provinces and territories",
    "nav.how_it_works": "How this works",
    ...nameKeys,
  });
  return (
    <div>
      <section className="mb-10">
        <p className="mb-6">
          <Link
            href={localizePath("/upcoming", locale)}
            className="link text-base font-medium"
          >
            {s["home.upcoming_link"]}
          </Link>
        </p>
        <h1 className="text-3xl sm:text-4xl">{s["home.heading"]}</h1>
        <p className="prose-civic mt-4">{s["home.intro"]}</p>
        <p className="mt-4 text-sm text-ink-faint">
          <Link href={localizePath("/methodology", locale)} className="link">
            {s["nav.how_it_works"]}
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-xl">{s["home.provinces_heading"]}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVINCES.map((p) => (
            <li key={p.slug} className="card">
              <Link
                href={localizePath(`/provinces/${p.slug}`, locale)}
                className="tap-target font-medium text-ink no-underline hover:text-accent"
              >
                {PROVINCE_NAME_KEYS[p.slug]
                  ? s[PROVINCE_NAME_KEYS[p.slug]]
                  : p.name}{" "}
                &rarr;
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
