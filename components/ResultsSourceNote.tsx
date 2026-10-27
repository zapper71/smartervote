export interface ResultsSource {
  label: string;
  url: string;
}

/**
 * Footer block for race and compare pages, in this order: the link to
 * the page where the race's results were found, then — only on races
 * with no recorded winner — the "Results not available" disclaimer.
 * On a race with a recorded winner but no mapped source yet, renders
 * nothing: a source name without a link is not shown as a link.
 */
export default function ResultsSourceNote({
  hasWinner,
  source,
}: {
  hasWinner: boolean;
  source?: ResultsSource | null;
}) {
  if (hasWinner && !source) return null;
  return (
    <div className="mt-8 border-t border-paper-edge pt-4 text-sm text-ink-soft">
      {source && (
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
      )}
      {!hasWinner && (
        <p className={source ? "mt-2" : ""}>
          Results not available means that the counts are still in
          progress, the counts are too close to call, or the result has
          not been collected and verified on SmarterVote yet.
        </p>
      )}
    </div>
  );
}
