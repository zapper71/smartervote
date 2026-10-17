-- =====================================================================
-- SmarterVote.ca — confidence indicator on positions (Low / Medium / High)
--
-- Andreas runs migrations himself; this file is NOT applied automatically.
--
-- THE PROBLEM
-- The comparison grid shows every position with the same visual weight,
-- but they are not the same kind of evidence. A quote lifted from the
-- candidate's own website and a position submitted to the site by a
-- stranger who said they were the candidate both render as one tidy
-- summary. A reader cannot tell which kind they are looking at — and
-- trust depends on exactly that distinction.
--
-- THE DEFINITIONS (Andreas's, verbatim in intent)
--   HIGH   We have a quote we found from an approved source — the
--          candidate's own website, their own social post, a direct media
--          quote, remarks at an all-candidates meeting, their answers to a
--          candidate questionnaire, or the candidate's own email reply —
--          OR the candidate has provided feedback on the position itself.
--   MEDIUM The position was submitted via the site by someone who said
--          they are the candidate, but it is not yet verified.
--   LOW    The position was submitted via the website NOT from the
--          candidate, and no corroboration has been found.
-- When uncertain, MEDIUM. It is the default, not a demotion.
--
-- WHY A COLOUR PILL AND NOT NOTHING
-- The site deliberately refused a colour scale for source *length*
-- (migration 11): rating candidates on how much they wrote would punish
-- the least-resourced candidates. This is a different question — not
-- "how much did they say" but "do we know these are really their words".
-- The pill is the same shape language as the existing "Conflicting
-- Position" pill: an outline label, not a score.
-- =====================================================================

-- 1. The column. NOT NULL with default 'medium' so every existing row
--    gets a value and every future row must have one.
alter table positions
  add column confidence text not null default 'medium';

alter table positions
  add constraint positions_confidence_check
  check (confidence in ('low', 'medium', 'high'));

-- 2. Backfill from the same source_type mapping the import staging uses:
--    quotes found at an approved source (or the candidate's own reply)
--    are HIGH under Andreas's definitions. Everything else starts at
--    MEDIUM — the default when uncertain — for Andreas to review.
update positions
set    confidence = 'high'
where  source_type in (
         'candidate_website',
         'candidate_social',
         'local_news',
         'all_candidates_meeting',
         'candidate_questionnaire',
         'candidate_submission'
       );

-- 3. Expose it on the public view the site renders from.
create or replace view public_positions as
select p.id, p.candidate_id, p.issue_id,
       p.summary_short, p.summary_bullets,
       p.verbatim_quote, p.source_url, p.source_title, p.source_type, p.source_date,
       p.no_public_position, p.reviewed_at,
       i.name as issue_name, i.slug as issue_slug, i.sort_order as issue_sort,
       p.is_conflicting,
       p.source_extent,
       p.confidence
from   positions p
join   issues i on i.id = p.issue_id
where  p.status = 'published';
