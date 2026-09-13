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
export const CODE_VERSION = "2026-09-13.2";

/** What changed in this version — shown on /status. */
export const CODE_VERSION_NOTE =
  "Adds the /admin review queue. Off by default in production — set ADMIN_PASSWORD locally to use it.";
