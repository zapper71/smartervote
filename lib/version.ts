/**
 * Bumped by hand whenever the code in OneDrive changes.
 *
 * This exists because the working copy on your Mac is a COPY. When I update
 * files in OneDrive, your copy doesn't change until you re-copy — and the
 * symptom of a stale copy is confusing (pages that "should work" don't).
 *
 * /status shows this value, so "is my copy current?" is answerable at a glance
 * instead of being guessed at.
 */
export const CODE_VERSION = "2026-09-13.22";

/** What changed in this version — shown on /status. */
export const CODE_VERSION_NOTE =
  "Ready to deploy, and deliberately invisible to search engines while it is. SITE_INDEXABLE defaults to false and fails closed, so a missing or misspelled variable keeps the site out of Google rather than publishing it early. Nine candidates still have empty pages and none have been written to — an unfinished snapshot in search results is slow to correct and unfair to the people in it. Adds robots.txt and a sitemap, both of which stay shut until that variable is set. See docs/go-live.md.";
