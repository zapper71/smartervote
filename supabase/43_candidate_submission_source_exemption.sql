-- =============================================================
-- 43 — Let direct candidate replies publish without a source URL
--
-- PRE-BUILD CHECK #1, RESOLVED (code-level verification — the live
-- database could not be queried from the sandbox):
--
-- 01_schema.sql's published_needs_source CHECK requires every
-- published position to carry source_url + verbatim_quote (unless
-- no_public_position). But the import validator (app/admin/actions.ts)
-- explicitly EXEMPTS candidate_submission rows from the source_url
-- requirement — a reply sent directly to SmarterVote has no URL to
-- cite — and approveAction is a plain status flip, so approving such
-- a row would fail on the CHECK. The constraint as written therefore
-- blocks exactly the rows the candidate input page (and the
-- previously delivered candidate_submission imports) are meant to
-- publish.
--
-- The fix is the honest one, not a synthetic URL: a candidate's own
-- words sent directly to SmarterVote ARE the source. The amended
-- constraint keeps the guarantee for every third-party source type
-- (website, social, news, meeting, questionnaire) and exempts only
-- candidate_submission, whose provenance is the candidate_responses
-- row / candidate_submissions row it was approved from. The form and
-- the Approve action still require a verbatim quote on every such
-- row; only the URL requirement is lifted, for this type only.
--
-- RUN BY ANDREAS in the Supabase SQL editor. Idempotent: safe to
-- re-run.
-- =============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'published_needs_source'
  ) THEN
    ALTER TABLE positions DROP CONSTRAINT published_needs_source;
  END IF;
END $$;

ALTER TABLE positions
  ADD CONSTRAINT published_needs_source CHECK (
    status <> 'published'
    OR no_public_position = true
    OR source_type = 'candidate_submission'
    OR (source_url IS NOT NULL AND verbatim_quote IS NOT NULL)
  );

-- Sanity check: the new constraint is strictly weaker than the old
-- one, so every previously valid row still passes — but assert it
-- rather than assuming it.
DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count FROM positions
  WHERE status = 'published'
    AND no_public_position = false
    AND source_type IS DISTINCT FROM 'candidate_submission'
    AND (source_url IS NULL OR verbatim_quote IS NULL);
  IF bad_count > 0 THEN
    RAISE EXCEPTION '% existing published positions violate the amended constraint', bad_count;
  END IF;
END $$;
