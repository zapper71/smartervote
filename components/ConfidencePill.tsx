import { resolveConfidence, type Confidence } from "@/lib/types";

/**
 * How much we trust that a position is really the candidate's.
 *
 * Transparent pill, coloured border and coloured text in the same level
 * colour: red for low, yellow for medium, green for high. Same shape
 * language as the existing "Conflicting Position" pill — an outline
 * label, not a score. It is deliberately NOT an icon or a filled badge:
 * this says what kind of evidence it is, and nothing more.
 *
 * Missing values resolve to 'medium' (the default when uncertain) so a
 * row read before the confidence column existed never renders blank.
 */
const LEVEL_STYLES: Record<Confidence, string> = {
  low: "border-red-400 text-red-800",
  medium: "border-yellow-500 text-yellow-800",
  high: "border-green-500 text-green-800",
};

const LEVEL_LABELS: Record<Confidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function ConfidencePill({
  level,
}: {
  level: Confidence | null | undefined;
}) {
  const resolved = resolveConfidence(level);
  return (
    <span
      className={`pill border bg-transparent ${LEVEL_STYLES[resolved]}`}
      title={`Confidence: ${LEVEL_LABELS[resolved]}`}
    >
      {LEVEL_LABELS[resolved]}
    </span>
  );
}
