/** "Results not available" tag for a race with no recorded winner yet.
 * Broad rule (Andreas, 2026-10-27): every race with no flagged winner
 * carries it — it disappears on its own the moment a winner is recorded.
 * Same pill shape language as WinnerPill, neutral colours so it never
 * reads as a result. The explanation lives in ResultsSourceNote. */
export default function ResultsNotAvailablePill() {
  return (
    <span className="pill bg-paper-warm text-ink-soft">
      Results not available
    </span>
  );
}
