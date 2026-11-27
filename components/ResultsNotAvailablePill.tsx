/** "Results not available" tag for a race with no recorded winner yet.
 * Broad rule (Andreas, 2026-10-27): every race with no flagged winner
 * carries it — it disappears on its own the moment a winner is recorded.
 * Same pill shape language as WinnerPill, neutral colours so it never
 * reads as a result. The explanation lives in ResultsSourceNote.
 * Visibility fix (2026-10-27): the first version used bg-paper-warm,
 * which IS the page background (#faf9f7) — the badge shape was there
 * but invisible, so it read as plain text. Slate-200 fill contrasts
 * with the page while staying clearly neutral (no result meaning). */
export default function ResultsNotAvailablePill({
  labels,
}: {
  /**
   * Localised label + title. Defaults are the English strings; omit for
   * English-only callers.
   */
  labels?: { label: string; title: string };
}) {
  return (
    <span className="pill bg-slate-200 text-slate-700"
      title={labels?.title ?? "No result recorded for this race yet"}>
      {labels?.label ?? "Results not available"}
    </span>
  );
}
