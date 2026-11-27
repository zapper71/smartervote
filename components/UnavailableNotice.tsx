import Link from "next/link";
import { formatUi, type Locale } from "@/lib/i18n";

/** English chrome defaults; `strings` overrides per key when provided. */
const NOTICE_DEFAULTS = {
  "notice.unavailable_title": "{what} isn’t available right now",
  "notice.body":
    "Something went wrong loading this page. It’s a problem on our end, not yours. For official candidate and voting information, go straight to the official source for your election — the authority running it.",
  "notice.what_info": "This information",
} as const;

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
 *
 * `what` is the localised subject (one of the notice.what_* rows, passed
 * by the caller); the title template and body come from `strings` or the
 * English defaults.
 */
export default function UnavailableNotice({
  what,
  locale = "en",
  strings,
}: {
  what?: string;
  locale?: Locale;
  /** Localised chrome strings (notice.*). Omit for English. */
  strings?: Record<string, string>;
}) {
  const t: Record<string, string> = { ...NOTICE_DEFAULTS, ...(strings ?? {}) };
  const resolvedWhat = what ?? t["notice.what_info"];
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="card border-flag/30 bg-flag-light">
      <h2 className="text-base text-ink">
        {formatUi(t["notice.unavailable_title"], { what: resolvedWhat })}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {t["notice.body"]}
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
