import { getTranslations } from "@/lib/queries";
import { resolveText, type Locale, type ResolvedText } from "@/lib/i18n";
import type { Candidate, Issue, Position, TranslationRow } from "@/lib/types";

/**
 * Localised content for one position, keyed by position id.
 *
 * summaryShort / summaryBullets are null when the position has none
 * (the native fields were null) — the cell renders nothing for them,
 * exactly as it does for unlocalised content.
 *
 * Quotes follow decision D2: when the page language differs from the
 * quote's native language AND a translation row exists, the cell shows
 * the translation (no quotation marks) with a link to the original.
 * quoteTranslatedIsAi carries the asterisk rule.
 */
export interface PositionLocalization {
  summaryShort: ResolvedText | null;
  summaryBullets: ResolvedText[] | null;
  quoteIsTranslation: boolean;
  quoteTranslated: string | null;
  quoteTranslatedIsAi: boolean;
  quoteNativeLocale: string;
}

export interface LocalizedPageContent {
  /** By issue id. */
  issueNames: Map<string, ResolvedText>;
  /** By issue id. */
  issueQuestions: Map<string, ResolvedText>;
  /** By candidate slug. */
  bios: Map<string, ResolvedText>;
  /** By position id. */
  positions: Map<string, PositionLocalization>;
  /** True when any resolved value on the page is an AI translation. */
  hasAi: boolean;
}

/** Defensively parse a bullets JSON array string; null on any failure. */
function parseBullets(text: string | undefined): string[] | null {
  if (!text) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((b): b is string => typeof b === "string");
  } catch {
    return null;
  }
}

/**
 * One translations fetch per entity type for the whole page, in
 * parallel. Every call degrades to an empty map when the translations
 * table is missing or the rows don't exist yet — the page then renders
 * native text, never an error.
 *
 * Only the candidates/positions passed in are resolved: on the compare
 * page that is the DISPLAYED set, so a filtered-out candidate's AI bio
 * must not trigger the footnote.
 */
export async function localizePageContent(args: {
  locale: Locale;
  municipalitySlug: string;
  issues: Issue[];
  candidates: Candidate[];
  positions: Position[];
  /**
   * True when the page renders no bios (race pages — bios render on
   * compare + candidate pages). Skips the bio fetch AND keeps a
   * candidate's AI bio out of hasAi, which must only count content the
   * page actually shows.
   */
  skipBios?: boolean;
}): Promise<LocalizedPageContent> {
  const { locale, municipalitySlug, issues, candidates, positions, skipBios } = args;
  const candidateSlugById = new Map(candidates.map((c) => [c.id, c.slug]));
  const posKeys = [
    ...new Set(
      positions.map(
        (p) =>
          `${candidateSlugById.get(p.candidate_id) ?? ""}:${p.issue_slug}`
      )
    ),
  ];

  const [nameRows, questionRows, bioRows, summaryRows, quoteRows] =
    await Promise.all([
      getTranslations(
        "issue_name",
        issues.map((i) => `${municipalitySlug}:${i.slug}`),
        locale
      ),
      getTranslations(
        "issue_question",
        issues.map((i) => `${municipalitySlug}:${i.slug}`),
        locale
      ),
      skipBios
        ? Promise.resolve(new Map<string, TranslationRow>())
        : getTranslations(
            "candidate_bio",
            candidates.map((c) => c.slug),
            locale
          ),
      getTranslations("position_summary", posKeys, locale),
      getTranslations("verbatim_quote", posKeys, locale),
    ]);

  let hasAi = false;
  const noteAi = (r: ResolvedText) => {
    if (r.isAiTranslation) hasAi = true;
  };

  const issueNames = new Map<string, ResolvedText>();
  const issueQuestions = new Map<string, ResolvedText>();
  for (const issue of issues) {
    const nativeLocale = issue.name_locale ?? "en";
    const name = resolveText({
      nativeText: issue.name,
      nativeLocale,
      locale,
      translation:
        nameRows.get(`${municipalitySlug}:${issue.slug}:`) ?? null,
    });
    noteAi(name);
    issueNames.set(issue.id, name);
    const question = resolveText({
      nativeText: issue.voter_question,
      nativeLocale,
      locale,
      translation:
        questionRows.get(`${municipalitySlug}:${issue.slug}:`) ?? null,
    });
    noteAi(question);
    issueQuestions.set(issue.id, question);
  }

  const bios = new Map<string, ResolvedText>();
  for (const c of candidates) {
    const bio = resolveText({
      nativeText: c.bio,
      nativeLocale: c.bio_locale ?? "en",
      locale,
      translation: bioRows.get(`${c.slug}:`) ?? null,
    });
    noteAi(bio);
    bios.set(c.slug, bio);
  }

  const localizedPositions = new Map<string, PositionLocalization>();
  for (const p of positions) {
    const key = `${candidateSlugById.get(p.candidate_id) ?? ""}:${p.issue_slug}`;
    const summaryLocale = p.summary_locale ?? "en";
    const shortRow = summaryRows.get(`${key}:summary_short`) ?? null;
    const summaryShort =
      p.summary_short === null
        ? null
        : resolveText({
            nativeText: p.summary_short,
            nativeLocale: summaryLocale,
            locale,
            translation: shortRow,
          });
    if (summaryShort) noteAi(summaryShort);

    let summaryBullets: ResolvedText[] | null = null;
    if (p.summary_bullets !== null) {
      const bulletsRow = summaryRows.get(`${key}:summary_bullets`) ?? null;
      // Same rule as resolveText: when the page language is the native
      // one, the native bullets render even if a row somehow exists.
      const translated =
        locale !== summaryLocale ? parseBullets(bulletsRow?.text) : null;
      summaryBullets = p.summary_bullets.map((native, i) => {
        if (translated && i < translated.length) {
          const r: ResolvedText = {
            text: translated[i],
            // NEVER re-implement the origin check without the
            // reviewed_at condition — the asterisk drops on human
            // review, and origin stays 'ai' as provenance.
            isAiTranslation:
              bulletsRow!.origin === "ai" && !bulletsRow!.reviewed_at,
            isNative: false,
          };
          noteAi(r);
          return r;
        }
        return {
          text: native,
          isAiTranslation: false,
          isNative: locale === summaryLocale,
        };
      });
    }

    const quoteNativeLocale = p.verbatim_quote_locale ?? "en";
    const quoteRow = quoteRows.get(`${key}:`) ?? null;
    const quoteIsTranslation =
      quoteRow !== null && locale !== quoteNativeLocale;
    // Same rule as resolveText — see the bullets note above.
    const quoteIsAi =
      quoteIsTranslation &&
      quoteRow!.origin === "ai" &&
      !quoteRow!.reviewed_at;
    if (quoteIsAi) hasAi = true;
    localizedPositions.set(p.id, {
      summaryShort,
      summaryBullets,
      quoteIsTranslation,
      quoteTranslated: quoteIsTranslation ? quoteRow!.text : null,
      quoteTranslatedIsAi: quoteIsAi,
      quoteNativeLocale,
    });
  }

  return {
    issueNames,
    issueQuestions,
    bios,
    positions: localizedPositions,
    hasAi,
  };
}
