import Link from "next/link";
import { PROVINCES } from "@/lib/tracked-elections";
import { localizePath, type Locale } from "@/lib/i18n";

/**
 * Home page body, shared by the English route and the /fr wrapper.
 * No database content renders here, so there is no translations fetch
 * and no footnote. Chrome strings stay English in Phase 1 (phase (b));
 * the chrome pass wires them to the ui_string rows.
 */
export default function HomePage({ locale }: { locale: Locale }) {
  return (
    <div>
      <section className="mb-10">
        <p className="mb-6">
          <Link
            href={localizePath("/upcoming", locale)}
            className="link text-base font-medium"
          >
            Recent &amp; Upcoming Elections &rarr;
          </Link>
        </p>
        <h1 className="text-3xl sm:text-4xl">What the candidates actually say</h1>
        <p className="prose-civic mt-4">
          Official candidate lists tell you who&rsquo;s running, not where
          candidates differ. SmarterVote puts every candidate side by side on
          the same issues, in the same format, with a link to the source for
          every claim.
        </p>
        <p className="mt-4 text-sm text-ink-faint">
          <Link href={localizePath("/methodology", locale)} className="link">
            How this works
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-xl">Provinces and territories</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVINCES.map((p) => (
            <li key={p.slug} className="card">
              <Link
                href={localizePath(`/provinces/${p.slug}`, locale)}
                className="tap-target font-medium text-ink no-underline hover:text-accent"
              >
                {p.name} &rarr;
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
