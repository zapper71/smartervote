import Link from "next/link";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import UnavailableNotice from "@/components/UnavailableNotice";
import { getMunicipality } from "@/lib/queries";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default async function HomePage() {
  // Huntsville is reachable through the finder like every other
  // municipality; this only gates the notice below if its municipality
  // record is missing.
  const huntsville = await getMunicipality();

  return (
    <div>
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Ontario &amp; British Columbia · 2026 elections
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          What the candidates actually say
        </h1>
        <p className="prose-civic mt-4">
          Official candidate lists tell you who&rsquo;s running. They don&rsquo;t tell
          you where the candidates differ. SmarterVote puts every candidate side
          by side on the same issues, in the same format, with a link to the
          source for every claim. Find your municipality or district to see
          who&rsquo;s on your ballot.
        </p>

        <MunicipalityFinder />

        <p className="mt-4 text-sm text-ink-faint">
          Some municipalities have full candidate positions, researched from
          the candidates' own words. Everywhere else is at the listings stage
          — candidate names and races only while full positions are researched.{" "}
          <Link href="/methodology" className="link">
            How this works
          </Link>
        </p>
      </section>

      {!huntsville && (
        <div className="mb-10">
          <UnavailableNotice what="Huntsville election information" />
        </div>
      )}
    </div>
  );
}
