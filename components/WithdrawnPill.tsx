/**
 * Grey "Withdrawn" pill.
 *
 * Marks a candidate who withdrew after nomination but remains on the printed
 * ballot. Same shape language as the other pills (ConfidencePill's outline
 * labels, the race page's "Acclaimed" pill): a neutral grey fill with dark
 * grey text — no colour carries meaning here, the label does the work.
 *
 * Shown beside a struck-through candidate name wherever names render (race
 * pages, candidate pages, compare headers, municipality listings, compare
 * picker). The strikethrough says "not running"; the pill says why.
 */
export default function WithdrawnPill() {
  return (
    <span className="pill bg-neutral-200 text-neutral-700" title="Withdrew after nomination; still on the printed ballot">
      Withdrawn
    </span>
  );
}
