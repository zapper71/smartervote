-- =====================================================================
-- SmarterVote.ca — Geordie Sabbagh, three more positions
--
-- READ THIS FIRST — WHY HE LOOKED BLANK
--
-- He is not missing from the database. 08_positions_round2.sql inserted
-- SEVEN positions for him, from all three "See the Plan" pages:
--
--   taxes-and-spending        /value-for-money
--   how-council-works         /huntsville-strong
--   economy-and-downtown      /future-ready
--   growth-and-development    /future-ready
--   housing                   /future-ready
--   district-table            /future-ready
--   healthcare-and-hospital   /future-ready
--
-- They went in as status = 'in_review', like everything in batch 2, and
-- public_positions only selects status = 'published'. So they exist, they
-- are invisible, and that is the system working as designed — nothing
-- reaches the public site until a person approves it.
--
-- Every other batch-2 candidate is in the same state: Morrison, Mello,
-- Peterson, Bowler, Terziano, Hernen, Lowe, Clouthier and Davis will all
-- look blank too. Sabbagh just happened to be the one you opened.
--
-- CONFIRM IT IN ONE QUERY before doing anything else:
--
--   select c.name, p.status, count(*)
--   from positions p join candidates c on c.id = p.candidate_id
--   group by c.name, p.status order by c.name, p.status;
--
-- If Sabbagh shows 7 in_review, that is the whole story. Approve batch 2
-- in /admin and he fills in. If he shows 0 rows of any status, something
-- did go wrong in 08 and I need to know that instead.
--
-- ---------------------------------------------------------------------
-- WHAT THIS FILE ACTUALLY ADDS
--
-- Your prompt did send me back to his site, and two things came out of it
-- that are worth having:
--
--   * I had never read /meetgeordie. He is a serving volunteer firefighter
--     with the Huntsville Fire Department and Vice-President of the
--     Huntsville Firefighters Association. When I extracted batch 2 there
--     was no emergency-services issue to put that under. There is now.
--   * The Huntsville Strong page has a passage on drugs, homelessness and
--     mental health, and another on public spaces, that I left on the
--     table because they had nowhere good to go.
--
-- Three new rows. He goes from 7 of 12 issues to 10 of 12.
--
-- Run AFTER 09_two_more_issues.sql, which creates the emergency-services
-- issue this depends on. Safe to re-run.
-- =====================================================================

-- PREFLIGHT. One of the rows below needs the emergency-services issue,
-- which 09 creates. Without it the insert would put a null issue_id into a
-- not-null column and fail with a message about constraint violations
-- rather than about running the wrong file.
do $$
begin
    if not exists (
        select 1 from issues i
        join municipalities m on m.id = i.municipality_id
        where m.slug = 'huntsville' and i.slug = 'emergency-services'
    ) then
        raise exception
            'Run 09_two_more_issues.sql first. It creates the emergency-services issue that two of these positions belong to. Nothing has been changed.';
    end if;
end $$;

begin;

with m as (select id from municipalities where slug = 'huntsville')
insert into positions (candidate_id, issue_id, summary_short, summary_bullets,
                       verbatim_quote, source_url, source_title, source_type,
                       source_date, status, model_confidence)
select
    (select c.id from candidates c join races r on r.id = c.race_id
      where r.municipality_id = m.id and r.slug = v.race_slug and c.slug = v.cand_slug),
    (select i.id from issues i where i.municipality_id = m.id and i.slug = v.issue_slug),
    v.summary_short, v.summary_bullets::jsonb, v.verbatim_quote,
    v.source_url, v.source_title, v.source_type, v.source_date::date,
    'in_review', 0.90
from m, (values

-- TWO ROWS ON emergency-services, from two different pages. Not a
-- conflict — one is his record, the other is a policy statement — so they
-- stack under "has spoken about this issue more than once" rather than
-- carrying the red pill. Different source_url on each, which is what the
-- positions_candidate_issue_source_uniq index requires.

('geordie-sabbagh', 'wards-1-2', 'emergency-services',
 'Serves on the Huntsville Fire Department and has worked on funding for firefighter mental health.',
 '["Vice-President of the Huntsville Firefighters Association.", "Says he helped secure funding for firefighter mental-health initiatives and worked to strengthen support for firefighters and their families.", "Lists dependable fire and emergency services first among the things a strong Huntsville needs.", "NOTE FOR REVIEW: this is his record and his involvement, not a stated plan for the fire service. He has published nothing comparable to Rylind Davis''s fire platform. The summary says so deliberately — a candidate should not look like he has a policy because he has a uniform."]',
 'I serve with the Huntsville Fire Department and as Vice-President of the Huntsville Firefighters Association. I''ve helped secure funding for firefighter mental-health initiatives and worked to strengthen support for the men and women who serve our community and their families.',
 'https://yourneighbourgeordie.ca/meetgeordie',
 'Geordie Sabbagh campaign website — Meet Geordie',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'emergency-services',
 'Wants drugs, homelessness and mental health treated as both a safety issue and a human one.',
 '["Frames it as two things at once: the safety of neighbourhoods and businesses, and the needs of people who are struggling.", "Says these are complicated problems that need the Town working with experts, community organisations, the District and other levels of government rather than acting alone."]',
 'We''re also seeing the effects of drugs, homelessness, mental-health challenges, and rising costs in our community. We need to take those concerns seriously — both the safety of our neighbourhoods and businesses, and the needs of people who are struggling.',
 'https://yourneighbourgeordie.ca/huntsville-strong',
 'Geordie Sabbagh campaign website — Huntsville Strong',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'parks-and-trails',
 'Says the Town should be protecting and planning for public space now, before growth takes it.',
 '["Names public spaces, facilities, services and land together as things to secure for future generations.", "Lists strong recreation and community programs among what a community that works for everyone needs."]',
 'As we grow, we need to protect and plan for the public spaces, facilities, services, and land future generations will need.',
 'https://yourneighbourgeordie.ca/huntsville-strong',
 'Geordie Sabbagh campaign website — Huntsville Strong',
 'candidate_website', '2026-09-13')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_type, source_date)
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'Sabbagh total positions' as "Check",
       count(*)::text || ' (expect 10)' as "Result"
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'geordie-sabbagh'
union all
select 'Sabbagh issues covered',
       count(distinct issue_id)::text || ' of 12'
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'geordie-sabbagh'
union all
-- p.status, not status. BOTH positions and candidates have a status column
-- — 'in_review'/'published' on one, 'certified'/'withdrawn' on the other —
-- so an unqualified reference is ambiguous the moment they are joined.
-- Postgres catches it, but only at the point of use, which is why this got
-- through: it sits in the VERIFY block, after the commit.
select 'how many of his are still awaiting approval',
       count(*) filter (where p.status = 'in_review')::text || ' in_review, '
       || count(*) filter (where p.status = 'published')::text || ' published'
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'geordie-sabbagh'
union all
select 'the two emergency-services rows are not flagged as conflicting',
       case when not exists (
         select 1 from positions p
         join candidates c on c.id = p.candidate_id
         join issues i on i.id = p.issue_id
         where c.slug = 'geordie-sabbagh' and i.slug = 'emergency-services'
           and p.is_conflicting = true
       ) then 'PASS — they stack, no red pill' else 'FAIL' end;

-- ---------------------------------------------------------------------
-- WHAT HE STILL HAS NOTHING ON, AND WHY I LEFT IT EMPTY
--
--   roads-and-infrastructure  He never writes about roads specifically.
--                             The closest is one clause inside a list.
--   environment               Mentioned only inside the growth sentence
--                             already used on growth-and-development.
--   transit                   Mentioned only inside the housing sentence
--                             already used on housing.
--
-- I could have filled all three. On the Huntsville Strong page there is a
-- sentence listing six things at once — "dependable fire and emergency
-- services, better access to healthcare, support for seniors, safe roads
-- and neighbourhoods, and strong recreation and community programs" — and
-- quoting it under six issues would have given him a nearly complete row
-- on the comparison table.
--
-- That would be a distortion. A candidate who lists six services in one
-- sentence has not said as much as a candidate who wrote a page on each,
-- and the comparison grid cannot show the difference between a filled cell
-- and a filled cell. Padding his row would quietly penalise the candidates
-- who did the work.
--
-- So: one sentence, one issue, and three honest blanks that say "no public
-- statement found" with the date we looked. If you disagree, this is a
-- reasonable thing to disagree about — tell me and I will add them.
-- ---------------------------------------------------------------------
