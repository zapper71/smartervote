/**
 * Locale helpers — pure, safe to import from middleware, server and
 * client components. No DB access here: the translations table is read
 * through lib/queries.ts (getTranslations / getUiString).
 *
 * URL shape (decision D1): English keeps today's URLs; French lives
 * under /fr/…; a future language gets its own prefix.
 */

export type Locale = "en" | "fr";

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie remembering the visitor's language choice. */
export const LOCALE_COOKIE = "sv-locale";

/** The three Quebec federal byelection ridings (Dec 7, 2026). */
export const QUEBEC_RIDING_SLUGS = [
  "rosemont-la-petite-patrie",
  "laurier-sainte-marie",
  "saint-hyacinthe-bagot-acton",
] as const;

/** Locale implied by the URL path. */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/fr" || pathname.startsWith("/fr/") ? "fr" : "en";
}

/** The same page in another locale: strip any /fr prefix, add it back. */
export function localizePath(pathname: string, locale: Locale): string {
  const stripped =
    pathname === "/fr" || pathname.startsWith("/fr/")
      ? pathname.slice(3) || "/"
      : pathname;
  if (locale === "fr") return stripped === "/" ? "/fr" : `/fr${stripped}`;
  return stripped;
}

/**
 * True when the path is a Quebec page — a Quebec riding page, or the
 * Quebec province/finder pages. Used by the middleware for the French
 * default (decision D4): first visit, no cookie, Quebec page → /fr.
 */
export function isQuebecPage(pathname: string): boolean {
  const stripped =
    pathname === "/fr" || pathname.startsWith("/fr/")
      ? pathname.slice(3) || "/"
      : pathname;
  const segments = stripped.split("/").filter(Boolean);
  if (segments.includes("quebec")) return true;
  return segments.some((s) =>
    (QUEBEC_RIDING_SLUGS as readonly string[]).includes(s)
  );
}

/** Result of resolving one string into the page language. */
export interface ResolvedText {
  text: string;
  /** True when the text shown is an AI translation — renders with `*`. */
  isAiTranslation: boolean;
  /** True when the text shown is in its native language. */
  isNative: boolean;
}

/**
 * Resolve native text into the page language.
 *
 * - Same language as native: native text, no marker.
 * - Translation row exists: the translated text; `*` exactly when the row
 *   is AI and unreviewed (origin 'ai' and no reviewed_at). A reviewed row
 *   renders clean even though its origin stays 'ai' — the review is
 *   recorded in reviewed_at, origin keeps provenance.
 * - No row: the native text, unmarked (Phase 1 fallback for content not
 *   yet translated — the page renders, the text stays honest).
 */
export function resolveText(args: {
  nativeText: string | null;
  nativeLocale: string;
  locale: Locale;
  translation?: {
    text: string;
    origin: "ai" | "human";
    reviewed_at?: string | null;
  } | null;
}): ResolvedText {
  const { nativeText, nativeLocale, locale, translation } = args;
  const text = nativeText ?? "";
  if (locale === nativeLocale || !translation) {
    return { text, isAiTranslation: false, isNative: locale === nativeLocale };
  }
  return {
    text: translation.text,
    isAiTranslation: translation.origin === "ai" && !translation.reviewed_at,
    isNative: false,
  };
}

/** Prefix `* ` for AI-translated text, per the asterisk rule. */
export function asterisk(text: string, isAiTranslation: boolean): string {
  return isAiTranslation ? `* ${text}` : text;
}

/**
 * Substitute `{name}` placeholders in a ui_string. Unknown tokens are
 * left as-is so a missing value never silently eats the text.
 */
export function formatUi(
  text: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m
  );
}

/**
 * Resolve the `(s)` inline-plural marker the UI strings use (English and
 * French alike): "s" unless count is exactly 1. Apply AFTER formatUi so
 * the `{count}` value is already in the string.
 */
export function pluralize(text: string, count: number): string {
  return text.replace(/\(s\)/g, count === 1 ? "" : "s");
}
