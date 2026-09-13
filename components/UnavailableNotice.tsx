import Link from "next/link";

/**
 * Shown when the database is unreachable or not yet configured.
 *
 * An honest empty state, not a crash. During advance voting the worst thing
 * this site can do is show a broken page to someone trying to decide how to
 * vote — so every data-driven page degrades to this and points at the
 * official source instead.
 *
 * In development it also links to /status, so a misconfiguration diagnoses
 * itself instead of sending you back to a runbook. That link never appears
 * in production.
 */
export default function UnavailableNotice({ what = "This information" }: { what?: string }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="card border-flag/30 bg-flag-light">
      <h2 className="text-base text-ink">{what} isn&rsquo;t available right now</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Something went wrong loading this page. It&rsquo;s a problem on our end, not
        yours. For official candidate and voting information, go straight to the Town of
        Huntsville:
      </p>
      <p className="mt-3">
        <a
          href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/certified-candidates/"
          className="link tap-target text-sm font-medium"
          rel="noopener noreferrer"
          target="_blank"
        >
          Certified candidates on huntsville.ca &rarr;
        </a>
      </p>

      {isDev && (
        <p className="mt-4 border-t border-flag/30 pt-3 text-sm text-ink-soft">
          <strong>Developer note (not shown in production):</strong> the app couldn&rsquo;t
          reach the database. Open{" "}
          <Link href="/status" className="link font-medium">
            /status
          </Link>{" "}
          to see exactly which check is failing.
        </p>
      )}
    </div>
  );
}
