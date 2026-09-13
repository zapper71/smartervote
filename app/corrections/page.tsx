import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report a correction",
  description:
    "Candidates and members of the public can report anything inaccurate on SmarterVote. Every correction is logged and answered.",
};

export default function CorrectionsPage() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">Report a correction</h1>
      <p className="mt-4">
        If something here is wrong, incomplete, or out of date, please tell us.
        Corrections from candidates about their own pages are treated as priority, and
        anything reported while voting is open is treated as urgent.
      </p>

      {/* The form itself is the next build step. Until it exists, email is
          a working channel rather than a dead link — a correction path that
          doesn't work is worse than none, because it implies one exists. */}
      <div className="mt-6 rounded-lg border border-accent/20 bg-accent-light p-5">
        <h2 className="mt-0 text-base text-ink">Email us for now</h2>
        <p className="mt-2 text-sm">
          The correction form is being built. Until it&rsquo;s live, email works and is
          checked daily:
        </p>
        <p className="mt-3 text-sm">
          <a href="mailto:support.smartervote.ca@gmail.com" className="link font-medium">
            support.smartervote.ca@gmail.com
          </a>
        </p>
        <p className="mt-3 text-sm">Please include:</p>
        <ul className="mt-2 text-sm">
          <li>The page you&rsquo;re writing about (paste the link)</li>
          <li>What&rsquo;s wrong</li>
          <li>What it should say instead</li>
          <li>A source we can check, if you have one</li>
          <li>Whether you&rsquo;re the candidate</li>
        </ul>
      </div>

      <h2>What happens next</h2>
      <ul>
        <li>Every correction is logged, whether or not we end up agreeing with it.</li>
        <li>A person reviews it — nothing is auto-applied.</li>
        <li>You get a reply either way, including when we decide not to change something.</li>
        <li>
          Accepted corrections are published to a public corrections log, so the site&rsquo;s
          error record is visible rather than quietly edited away.
        </li>
      </ul>

      <h2>If you&rsquo;re a candidate</h2>
      <p>
        You&rsquo;re welcome to send us your positions directly, whether or not anything is
        wrong. If we haven&rsquo;t found a public statement from you on an issue, your page
        says so plainly — and the fastest way to change that is to tell us where to look,
        or just tell us what you think.
      </p>
      <p>
        We&rsquo;ll publish what you send in the same format as everyone else, attributed
        to you as a direct submission.
      </p>

      <p className="mt-8 text-sm text-ink-faint">
        How we handle information you send us is covered on the{" "}
        <Link href="/privacy" className="link">
          privacy page
        </Link>
        . Our sourcing and review rules are on the{" "}
        <Link href="/methodology" className="link">
          methodology page
        </Link>
        .
      </p>
    </div>
  );
}
