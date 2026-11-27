import type { Locale } from "@/lib/i18n";
import { getUiString } from "@/lib/queries";

/**
 * One footnote per page when the page rendered AI-translated content.
 * The text comes from ui_string 'footnote.ai_translation'; the
 * hardcoded copy is the fallback when the row is missing.
 */
export default async function TranslationFootnote({
  locale,
  show,
}: {
  locale: Locale;
  show: boolean;
}) {
  if (!show) return null;
  const text = await getUiString(
    "footnote.ai_translation",
    locale,
    "* Translations marked with an asterisk were produced by AI and may contain errors."
  );
  return <p className="mt-8 text-sm text-ink-faint">{text}</p>;
}
