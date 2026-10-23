import type { ResultStatus } from "@/lib/types";

/**
 * "Elected" checkmark badge for a candidate who won their race.
 *
 * Andreas's direction (2026-10-23): a checkmark beside the winner's name
 * EVERYWHERE names render, in two states —
 *   official    GREEN check, label "Elected"
 *   unofficial  AMBER check, label "Elected — unofficial result"
 *
 * ACCESSIBILITY (his explicit requirement, WCAG 1.4.1 / 1.4.3 / 1.4.11):
 * meaning never rests on colour alone. The visible text label differs
 * between the two states, the check glyph is decorative (aria-hidden)
 * because the label carries the meaning, and an sr-only suffix states
 * the result status plainly for screen readers. Colours are deep shades
 * measured against their pill fills (verified 2026-10-23):
 *   green-800 #166534 on green-100 #dcfce7  = 6.49:1
 *   amber-800 #92400e on amber-100 #fef3c7  = 6.37:1
 * Both clear 4.5:1 for the label text and 3:1 for the check symbol.
 * (Pure yellow was rejected for this: it cannot reach those ratios on a
 * light background.)
 *
 * Renders NOTHING unless the candidate is a recorded winner with a
 * result status — so before migration 41 runs, or before any result is
 * loaded, the site renders exactly as it does today.
 *
 * Same shape language as WithdrawnPill: a .pill beside the name. When a
 * candidate somehow carries both, order is: name, PartyPill, WinnerPill,
 * WithdrawnPill — a withdrawn candidate cannot also be a winner in the
 * data, so this should never occur; the order is stated for safety.
 */
export default function WinnerPill({
  isWinner,
  resultStatus,
}: {
  isWinner?: boolean | null;
  resultStatus?: ResultStatus | string | null;
}) {
  if (!isWinner) return null;
  if (resultStatus !== "unofficial" && resultStatus !== "official")
    return null;

  if (resultStatus === "official") {
    return (
      <span
        className="pill bg-green-100 text-green-800"
        title="Elected — official result"
      >
        <span aria-hidden="true" className="mr-1 font-bold">
          ✓
        </span>
        Elected
        <span className="sr-only"> (official result)</span>
      </span>
    );
  }

  return (
    <span
      className="pill bg-amber-100 text-amber-800"
      title="Elected — unofficial result"
    >
      <span aria-hidden="true" className="mr-1 font-bold">
        ✓
      </span>
      Elected — unofficial result
    </span>
  );
}
