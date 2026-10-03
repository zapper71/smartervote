-- =============================================================
-- 20 — Add 'candidate_questionnaire' source type
--
-- A distinct type for a candidate's own direct answers to a
-- third-party questionnaire (advocacy-group surveys, media Q&As
-- like MSM Connect, etc.) — the candidate's own words, hosted
-- by someone else. Previously these had no honest type;
-- 'candidate_submission' is reserved for replies sent directly
-- to SmarterVote (it drives the "Read their full response"
-- deep links, which must NOT appear on questionnaire rows).
--
-- RUN THIS BEFORE migration-reao.sql (or any insert using the
-- new type) — otherwise the positions_source_type_check
-- constraint rejects the rows.
--
-- Idempotent: safe to re-run.
-- =============================================================

DO $$
BEGIN
  -- The inline CHECK in 01_schema.sql is auto-named by Postgres
  -- as positions_source_type_check.
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'positions_source_type_check'
  ) THEN
    ALTER TABLE positions DROP CONSTRAINT positions_source_type_check;
  END IF;
END $$;

ALTER TABLE positions
  ADD CONSTRAINT positions_source_type_check
  CHECK (source_type IN (
    'candidate_website',
    'candidate_social',
    'local_news',
    'all_candidates_meeting',
    'candidate_submission',
    'candidate_questionnaire'
  ));

-- Sanity check: every existing row must still satisfy the new constraint.
DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count FROM positions
  WHERE source_type IS NOT NULL
    AND source_type NOT IN (
      'candidate_website','candidate_social','local_news',
      'all_candidates_meeting','candidate_submission','candidate_questionnaire'
    );
  IF bad_count > 0 THEN
    RAISE EXCEPTION '% existing positions rows have an unexpected source_type', bad_count;
  END IF;
END $$;
