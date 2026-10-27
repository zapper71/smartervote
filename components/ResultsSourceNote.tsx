export interface ResultsSource {
  label: string;
  url: string;
}

/**
 * Footer block for race and compare pages, in this order: the link to
 * the page where the race's results were found, then — only on races
 * with no recorded winner — the "Results not available" disclaimer.
 *
 * Acclaimed winners are the exception to the source link (Andreas,
 * 2026-10-27): acclaimed candidates do not have a source, so a race
 * whose recorded winners are all acclaimed shows that note instead
 * of a link — even if the source map happens to carry an entry for
 * the race (e.g. a results page with an "Acclaimed candidates"
 * section). On a race with a recorded winner but no mapped source
 * and no acclamation, renders nothing: a source name without a
 * link is not shown as a link.
 */
export default function ResultsSourceNote({
  hasWinner,
  hasAcclaimedWinner,
  source,
}: {
  hasWinner: boolean;
  hasAcclaimedWinner: boolean;
  source?: ResultsSource | null;
}) {
  if (!hasWinner) {
    return (
      <div className="mt-8 border-t border-paper-edge pt-4 text-sm text-ink-soft">
        <p>
          Results not available means that the counts are still in
          progress, the counts are too close to call, or the result has
          not been collected and verified on SmarterVote yet.
        </p>
      </div>
    );
  }
  if (hasAcclaimedWinner) {
    return (
      <div className="mt-8 border-t border-paper-edge pt-4 text-sm text-ink-soft">
        <p>Acclaimed candidates do not have a source.</p>
      </div>
    );
  }
  if (!source) return null;
  return (
    <div className="mt-8 border-t border-paper-edge pt-4 text-sm text-ink-soft">
      <p>
        Results source:{" "}
        <a
          href={source.url}
          className="link"
          rel="noopener noreferrer"
          target="_blank"
        >
          {source.label}
        </a>
      </p>
    </div>
  );
}
