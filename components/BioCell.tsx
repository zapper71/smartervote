import Link from "next/link";
import Clampable from "@/components/Clampable";
import TranslatedText from "@/components/TranslatedText";
import type { Locale, ResolvedText } from "@/lib/i18n";

/**
 * One candidate's bio on the compare page, clamped like the issue cells.
 *
 * The neutral empty treatment matches PositionCell's missing-position
 * treatment: muted italic text that describes our records, not the
 * candidate — "No bio on record." never implies they chose not to write
 * one. The correction link rides along, same as an empty position cell.
 *
 * Localised rendering: when `resolved` is passed (from
 * localizePageContent), the bio renders in the page language — native
 * when written in it, else the translations row, AI with `*` or the
 * original with a language tag when no row exists yet. `strings`
 * localises the empty state ("No bio on record.", "Know something?")
 * and the clamp control; omit all of them for the English behaviour.
 */
export default function BioCell({
  bio,
  correctionHref,
  resolved,
  nativeLocale,
  locale,
  strings,
}: {
  bio: string | null;
  correctionHref: string;
  resolved?: ResolvedText | null;
  nativeLocale?: string;
  locale?: Locale;
  strings?: Record<string, string>;
}) {
  const clampLabels =
    strings === undefined
      ? undefined
      : {
          readMore: strings["clamp.read_more"] ?? "Read more",
          showLess: strings["clamp.show_less"] ?? "Show less",
        };
  if (!bio || bio.trim() === "") {
    return (
      <p className="text-sm text-ink-faint">
        <span className="italic">
          {strings?.["bio.none"] ?? "No bio on record."}
        </span>{" "}
        <Link href={correctionHref} className="link">
          {strings?.["cell.know_something"] ?? "Know something?"}
        </Link>
      </p>
    );
  }
  return (
    <Clampable labels={clampLabels}>
      <p className="text-sm leading-relaxed text-ink">
        {resolved ? (
          <TranslatedText
            resolved={resolved}
            nativeLocale={nativeLocale ?? "en"}
            locale={locale ?? "en"}
          />
        ) : (
          bio
        )}
      </p>
    </Clampable>
  );
}
