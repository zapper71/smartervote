import type { Metadata } from "next";
import Link from "next/link";
import { PROVINCES } from "@/lib/tracked-elections";

export const metadata: Metadata = {
  title: "SmarterVote — What the candidates actually say",
  description:
    "SmarterVote puts every candidate side by side on the same issues, in the same format, with a link to the source for every claim.",
};

export default function HomePage() {
  return (
    <div>
      <section className="mb-10">
        <p className="mb-6">
          <Link href="/upcoming" className="link text-base font-medium">
            Upcoming elections &rarr;
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
          <Link href="/methodology" className="link">
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
                href={`/provinces/${p.slug}`}
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
