"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * A translated verbatim quote (decision D2): the translation renders
 * WITHOUT quotation marks; a link expands to show the original quote
 * WITH quotation marks, in its source language, with a language label.
 * The original is always one click away. Used only when a translation
 * is being shown; when the page language is the quote's native language
 * the parent renders the original directly.
 */
export default function TranslatedQuote({
  translated,
  translatedIsAi,
  original,
  originalLocale,
  locale,
}: {
  translated: string;
  translatedIsAi: boolean;
  original: string;
  originalLocale: string;
  locale: Locale;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const langLabel =
    locale === "fr"
      ? `Original en ${originalLocale === "fr" ? "français" : "anglais"}`
      : `Original in ${originalLocale === "fr" ? "French" : "English"}`;
  return (
    <div>
      <p>
        {translatedIsAi ? "* " : ""}
        {translated}
      </p>
      <button
        type="button"
        onClick={() => setShowOriginal((v) => !v)}
        className="mt-1 text-sm text-accent underline underline-offset-2 hover:text-accent-hover"
      >
        {locale === "fr"
          ? showOriginal
            ? "Masquer la citation originale"
            : "Voir la citation originale"
          : showOriginal
            ? "Hide original quote"
            : "Show original quote"}
      </button>
      {showOriginal && (
        <p className="mt-2 text-ink-soft">
          &ldquo;{original}&rdquo;{" "}
          <span className="text-sm text-ink-faint">({langLabel})</span>
        </p>
      )}
    </div>
  );
}
