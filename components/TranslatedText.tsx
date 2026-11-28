import type { Locale, ResolvedText } from "@/lib/i18n";
import { localeName } from "@/lib/i18n";

/**
 * Renders a resolved string as a fragment (use inside <p>/<h3>/etc.):
 * `* ` prefix when it is an AI translation, and a small muted language
 * tag when showing untranslated native text (" (in French)" on English
 * pages, " (en anglais)" on French pages; other page locales use the
 * English form as the untranslated-UI fallback).
 */
export default function TranslatedText({
  resolved,
  locale,
  nativeLocale,
}: {
  resolved: ResolvedText;
  locale: Locale;
  nativeLocale: string;
}) {
  const tag =
    !resolved.isNative && !resolved.isAiTranslation
      ? locale === "fr"
        ? ` (en ${localeName(nativeLocale, "fr")})`
        : ` (in ${localeName(nativeLocale, "en")})`
      : null;
  return (
    <>
      {resolved.isAiTranslation ? "* " : ""}
      {resolved.text}
      {tag ? <span className="text-sm text-ink-faint">{tag}</span> : null}
    </>
  );
}
