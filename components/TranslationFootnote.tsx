import type { Locale } from "@/lib/i18n";

/**
 * One footnote per page when the page rendered AI-translated content.
 * The text is also seeded as ui_string 'footnote.ai_translation' (the
 * chrome pass wires this component to that row; the hardcoded copy below
 * is the fallback when the row is missing).
 */
export default function TranslationFootnote({
  locale,
  show,
}: {
  locale: Locale;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <p className="mt-8 text-sm text-ink-faint">
      {locale === "fr"
        ? "* Les traductions marquées d'un astérisque ont été produites par l'IA et peuvent contenir des erreurs."
        : "* Translations marked with an asterisk were produced by AI and may contain errors."}
    </p>
  );
}
