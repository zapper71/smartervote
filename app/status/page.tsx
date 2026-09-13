import type { Metadata } from "next";
import { configProblem, getPublicClient, isConfigured } from "@/lib/supabase";
import { getMunicipality, getRaces, getWards } from "@/lib/queries";
import { CODE_VERSION, CODE_VERSION_NOTE } from "@/lib/version";

// Never let this into search results, and never cache it — it exists to
// tell you the truth about right now.
export const metadata: Metadata = {
  title: "Setup status",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function Row({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean | null;
  detail: string;
}) {
  const mark = ok === null ? "—" : ok ? "PASS" : "FAIL";
  const tone =
    ok === null
      ? "bg-paper-warm text-ink-faint"
      : ok
        ? "bg-accent-light text-accent"
        : "bg-flag-light text-flag";
  return (
    <tr className="border-b border-paper-edge align-top">
      <td className="py-3 pr-4 font-medium text-ink">{label}</td>
      <td className="py-3 pr-4">
        <span className={`pill ${tone}`}>{mark}</span>
      </td>
      <td className="py-3 text-sm text-ink-soft">{detail}</td>
    </tr>
  );
}

export default async function StatusPage() {
  const problem = configProblem();

  // Deliberately never render a key. Only whether one is present and what
  // kind it appears to be.
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const legacyAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";
  const legacyService = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const publicKeyKind = publishable
    ? "publishable (new style)"
    : legacyAnon
      ? "anon (legacy — still fine, deprecated end of 2026)"
      : "not set";
  const secretKeyKind = secret
    ? "secret (new style)"
    : legacyService
      ? "service_role (legacy — still fine, deprecated end of 2026)"
      : "not set — only needed for corrections and admin";

  let reachable = false;
  let reachDetail = "Not attempted — credentials missing.";
  if (isConfigured) {
    const db = getPublicClient();
    if (db) {
      const { error } = await db.from("municipalities").select("id").limit(1);
      if (error) {
        reachable = false;
        reachDetail = `Connected, but the query failed: ${error.message}`;
      } else {
        reachable = true;
        reachDetail = "Connected and queried successfully.";
      }
    }
  }

  const [municipality, races, wards] = reachable
    ? await Promise.all([getMunicipality(), getRaces(), getWards()])
    : [null, [], []];

  return (
    <div>
      <h1 className="text-3xl">Setup status</h1>
      <p className="prose-civic mt-3">
        A private diagnostic page. It shows whether the app can reach your database
        and what it found. It never displays any part of a key. Delete this page
        before launch if you&rsquo;d rather it didn&rsquo;t exist at all.
      </p>

      <div className="mt-6 card">
        <h2 className="text-base">Code version</h2>
        <p className="mt-2 font-mono text-sm text-ink">{CODE_VERSION}</p>
        <p className="mt-1 text-sm text-ink-soft">{CODE_VERSION_NOTE}</p>
        <p className="mt-3 text-sm text-ink-soft">
          If Claude says the current version is newer than this, your working copy is
          stale. Re-copy it from OneDrive and restart the server — see the bottom of
          this page.
        </p>
      </div>

      {problem && (
        <div className="mt-6 card border-flag/40 bg-flag-light">
          <h2 className="text-base text-ink">Here&rsquo;s the problem</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{problem}</p>
        </div>
      )}

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-paper-edge text-xs uppercase tracking-wide text-ink-faint">
            <th className="py-2 pr-4 font-medium">Check</th>
            <th className="py-2 pr-4 font-medium">Result</th>
            <th className="py-2 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          <Row
            label="Project URL set"
            ok={Boolean(rawUrl)}
            detail={rawUrl ? rawUrl : "NEXT_PUBLIC_SUPABASE_URL is empty."}
          />
          <Row label="Public key set" ok={Boolean(publishable || legacyAnon)} detail={publicKeyKind} />
          <Row
            label="Secret key set"
            ok={secret || legacyService ? true : null}
            detail={secretKeyKind}
          />
          <Row label="Database reachable" ok={reachable} detail={reachDetail} />
          <Row
            label="Municipality loaded"
            ok={reachable ? Boolean(municipality) : null}
            detail={
              municipality
                ? `${municipality.name} — voting day ${municipality.election_date}`
                : "Nothing found. Did 02_seed.sql run?"
            }
          />
          <Row
            label="Races loaded"
            ok={reachable ? races.length === 9 : null}
            detail={`${races.length} found, expected 9.`}
          />
          <Row
            label="Wards loaded"
            ok={reachable ? wards.length === 6 : null}
            detail={`${wards.length} found, expected 6.`}
          />
        </tbody>
      </table>

      <div className="mt-8 card">
        <h2 className="text-base">If something says FAIL</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft">
          <li>
            Check <code className="rounded bg-paper-warm px-1">.env.local</code> is saved
            as plain text, with no quotes and no spaces around the{" "}
            <code className="rounded bg-paper-warm px-1">=</code>.
          </li>
          <li>
            Stop the server (<strong>Ctrl+C</strong>) and run{" "}
            <code className="rounded bg-paper-warm px-1">npm run dev</code> again —
            environment variables are only read at startup.
          </li>
          <li>
            If races or wards are 0 but the database is reachable, the seed didn&rsquo;t
            run. Go back to the database runbook.
          </li>
        </ul>
      </div>

      <div className="mt-6 card">
        <h2 className="text-base">Refreshing your working copy</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your <code className="rounded bg-paper-warm px-1">~/dev/smartervote</code>{" "}
          folder is a copy. When the OneDrive version changes, pull the changes across
          with these three lines. Your{" "}
          <code className="rounded bg-paper-warm px-1">.env.local</code> and{" "}
          <code className="rounded bg-paper-warm px-1">node_modules</code> are left
          alone.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-ink p-3 text-xs leading-relaxed text-white">
          {`cp -R ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote/. ~/dev/smartervote/
cd ~/dev/smartervote
npm run dev`}
        </pre>
      </div>
    </div>
  );
}
