/**
 * Locale helpers — pure, safe to import from middleware, server and
 * client components. No DB access here: the translations table is read
 * through lib/queries.ts (getTranslations / getUiString).
 *
 * URL shape (decision D1): English keeps today's URLs; every other
 * language lives under its own prefix (/fr/…, /zh-hans/…, /zh-hant/…,
 * /ta/…, /pa/…).
 */

/** All locales the site supports (migration 52 + 55). */
export const ALL_LOCALES = [
  "en",
  "fr",
  "zh-Hans",
  "zh-Hant",
  "ta",
  "pa",
] as const;

export type Locale = (typeof ALL_LOCALES)[number];

/** Non-English locales — the ones with a URL prefix. */
export const NON_DEFAULT_LOCALES: readonly Locale[] = ALL_LOCALES.filter(
  (l) => l !== "en"
);

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie remembering the visitor's language choice. */
export const LOCALE_COOKIE = "sv-locale";

/** URL prefix for a locale: "/fr", "/zh-hans", … — English has none. */
export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale.toLowerCase()}`;
}

/** BCP 47 tag for Intl APIs and <html lang> ("en-CA", "fr-CA", "zh-Hans", …). */
export function localeTag(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en-CA";
    case "fr":
      return "fr-CA";
    default:
      return locale;
  }
}

/** A cookie/form value (or anything untrusted) to a Locale; "en" when unknown. */
export function parseLocale(value: string | null | undefined): Locale {
  if (!value) return "en";
  return (ALL_LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : "en";
}

/** English name of each locale (for "Original in …" labels). */
export const LOCALE_NAME_EN: Record<Locale, string> = {
  en: "English",
  fr: "French",
  "zh-Hans": "Simplified Chinese",
  "zh-Hant": "Traditional Chinese",
  ta: "Tamil",
  pa: "Punjabi",
};

/** French name of each locale (for "Original en …" labels). */
export const LOCALE_NAME_FR: Record<Locale, string> = {
  en: "anglais",
  fr: "français",
  "zh-Hans": "chinois simplifié",
  "zh-Hant": "chinois traditionnel",
  ta: "tamoul",
  pa: "pendjabi",
};

/** Name of a locale in a page language ("fr" → French names, anything else → English names). */
export function localeName(code: string, pageLocale: Locale): string {
  const parsed = parseLocale(code);
  const name =
    pageLocale === "fr"
      ? LOCALE_NAME_FR[parsed]
      : LOCALE_NAME_EN[parsed];
  // An unknown code parses to "en" — don't mislabel it English; show it raw.
  return code === parsed ? name : code;
}

/** The three Quebec federal byelection ridings (Dec 7, 2026). */
export const QUEBEC_RIDING_SLUGS = [
  "rosemont-la-petite-patrie",
  "laurier-sainte-marie",
  "saint-hyacinthe-bagot-acton",
] as const;

/** Strip a leading locale prefix ("/fr", "/zh-hans", …) from a path. */
export function stripLocalePrefix(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  if (
    NON_DEFAULT_LOCALES.some((l) => l.toLowerCase() === first.toLowerCase())
  ) {
    return pathname.slice(first.length + 1) || "/";
  }
  return pathname;
}

/** Locale implied by the URL path. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const found = NON_DEFAULT_LOCALES.find(
    (l) => l.toLowerCase() === first.toLowerCase()
  );
  return found ?? "en";
}

/** The same page in another locale: strip any locale prefix, add the target one back. */
export function localizePath(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (locale === "en") return stripped;
  const prefix = localePrefix(locale);
  return stripped === "/" ? prefix : `${prefix}${stripped}`;
}

/**
 * True when the path is a Quebec page — a Quebec riding page, or the
 * Quebec province/finder pages. Used by the middleware for the French
 * default (decision D4): first visit, no cookie, Quebec page → /fr.
 */
export function isQuebecPage(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
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

/**
 * Localise a stored source-extent value (positions.source_extent).
 *
 * Extents are DATA, not ui_strings: the database stores the English
 * value and PositionCell renders it verbatim, so there is no
 * translations-row lookup — this map is the translation. The five rows
 * exist in the translations table as extent.* for the record; this map
 * must match them. Unknown values pass through unchanged.
 */
const EXTENT_MAPS: Record<Locale, Record<string, string>> = {
  en: {},
  fr: {
    "a page or more": "une page ou plus",
    "one sentence": "une phrase",
    "a few sentences": "quelques phrases",
    "several paragraphs": "plusieurs paragraphes",
    "reported remarks": "remarques rapportées",
  },
  "zh-Hans": {
    "a page or more": "一页或更多",
    "one sentence": "一句话",
    "a few sentences": "几句话",
    "several paragraphs": "几个段落",
    "reported remarks": "据报道的言论",
  },
  "zh-Hant": {
    "a page or more": "一頁或更多",
    "one sentence": "一句話",
    "a few sentences": "幾句話",
    "several paragraphs": "幾個段落",
    "reported remarks": "據報導的言論",
  },
  ta: {
    "a page or more": "ஒரு பக்கம் அல்லது அதற்கு மேல்",
    "one sentence": "ஒரு வாக்கியம்",
    "a few sentences": "சில வாக்கியங்கள்",
    "several paragraphs": "பல பத்திகள்",
    "reported remarks": "அறிக்கையிடப்பட்ட கருத்துகள்",
  },
  pa: {
    "a page or more": "ਇੱਕ ਪੰਨਾ ਜਾਂ ਵੱਧ",
    "one sentence": "ਇੱਕ ਵਾਕ",
    "a few sentences": "ਕੁਝ ਵਾਕ",
    "several paragraphs": "ਕਈ ਪੈਰੇ",
    "reported remarks": "ਰਿਪੋਰਟ ਕੀਤੀਆਂ ਟਿੱਪਣੀਆਂ",
  },
};

export function localizeExtent(value: string, locale: Locale): string {
  return EXTENT_MAPS[locale]?.[value] ?? value;
}
