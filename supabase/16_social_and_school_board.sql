-- =====================================================================
-- SmarterVote.ca — the social media pass, and a real problem it exposed
--
-- Andreas supplied three URLs and a logged-in browser. Results:
--
--   Elizabeth Purcell  PUBLIC PAGE, readable logged-out, one long post
--                      that is entirely substance. Two positions.
--   Peggy Peterson     PUBLIC PAGE, readable logged-out, one post.
--                      One position — and see the REVIEW NOTE below.
--   Dione Schumacher   Public but personal. 54 posts, none about the
--                      election, nothing since before the campaign began.
--                      Nothing to add. Documented so nobody looks again.
--
-- THE PROBLEM PURCELL EXPOSED
-- She is running for school board trustee. Trustees do not set the
-- municipal levy, fix roads, approve subdivisions or sit at the District
-- table. Yet her page shows all twelve municipal issues, each one marked
-- "no public statement found as of 13 September 2026".
--
-- That is not a neutral blank. It is a scorecard for a job she never
-- stood for, and it makes the six school board candidates — who are
-- already the least covered people on this site — look the most evasive.
-- A trustee who has published a thoughtful 900-word statement about
-- before-and-after school care would appear, on our site, to have said
-- nothing about anything.
--
-- THE FIX: issues now belong to a kind of race.
--   applies_to = 'municipal'     the existing twelve, unchanged
--   applies_to = 'school_board'  three new ones, trustees only
--
-- getIssues() takes a race type and filters. Municipal candidates see no
-- change whatsoever.
--
-- THE THREE TRUSTEE ISSUES ARE PROVISIONAL. They are derived from one
-- candidate's writing plus the statutory role, which is exactly the thin
-- evidence base that caused the emergency-services gap earlier. Expect to
-- revise them once Reain, Boutotte, Cazabon, Blais or Legrand say
-- anything at all. Two of the three have no evidence behind them yet and
-- will sit empty for everyone — that is honest, and better than filing
-- school questions under "roads".
--
-- Run AFTER 15_full_site_sweep.sql. Safe to re-run.
-- =====================================================================

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'positions' and column_name = 'source_extent'
    ) then
        raise exception 'Run 11_source_extent.sql first. Nothing has been changed.';
    end if;
end $$;

begin;

-- ---------------------------------------------------------------------
-- PART 1 — scope issues to a kind of race
-- ---------------------------------------------------------------------
alter table issues
    add column if not exists applies_to text not null default 'municipal';

alter table issues drop constraint if exists issues_applies_to_check;
alter table issues
    add constraint issues_applies_to_check
    check (applies_to in ('municipal', 'school_board'));

comment on column issues.applies_to is
    'Which kind of race this issue belongs to. The app filters by it so a school board trustee is not measured against the municipal levy, and a mayoral candidate is not measured against school busing. Defaults to municipal, which is correct for every issue that existed before this column did.';

-- The twelve existing issues are all municipal. The default handles new
-- rows; this handles any that predate the column.
update issues set applies_to = 'municipal' where applies_to is null;

with m as (select id from municipalities where slug = 'huntsville')
insert into issues (municipality_id, name, slug, voter_question, description, sort_order, applies_to)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order, 'school_board'
from m, (values

('School services, programs and busing',
 'school-services',
 'Will the programs and services my child depends on still be there?',
 'Before- and after-school care, transportation, program availability and what happens when a service is withdrawn mid-year. Raised by a candidate whose reason for running was the cancellation of before- and after-school care at her daughter''s school.',
 1),

('What a trustee can actually do',
 'trustee-role',
 'What is this job, and how do I reach the person doing it?',
 'The scope of a trustee''s authority after recent provincial changes limiting it, how accessible and visible they are to families, and whether they bring local concerns to the board table. In a race most voters know least about, this is the most useful section on the page.',
 2),

('Student wellbeing and special education',
 'student-wellbeing',
 'Are students supported, and are the ones who need more getting it?',
 'Mental health supports, special education resourcing, school safety and climate. NO CANDIDATE HAS SPOKEN TO THIS YET — it is listed because it is a core part of the role, not because someone raised it. Every trustee page will show it as blank until one does.',
 3)

) as v(name, slug, voter_question, description, sort_order)
on conflict (municipality_id, slug) do update set
    name           = excluded.name,
    voter_question = excluded.voter_question,
    description    = excluded.description,
    sort_order     = excluded.sort_order,
    applies_to     = excluded.applies_to;

-- ---------------------------------------------------------------------
-- PART 2 — the positions
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
insert into positions (candidate_id, issue_id, summary_short, summary_bullets,
                       verbatim_quote, source_url, source_title, source_type,
                       source_date, source_extent, status, model_confidence)
select
    (select c.id from candidates c join races r on r.id = c.race_id
      where r.municipality_id = m.id and r.slug = v.race_slug and c.slug = v.cand_slug),
    (select i.id from issues i where i.municipality_id = m.id and i.slug = v.issue_slug),
    v.summary_short, v.summary_bullets::jsonb, v.verbatim_quote,
    v.source_url, v.source_title, 'candidate_social', v.source_date::date,
    v.source_extent, 'in_review', 0.90
from m, (values

-- ---- Elizabeth Purcell, TLDSB trustee --------------------------------
-- Her page is public: this post is readable without logging in, and the
-- permalink below opens for anyone. That matters — a source only visible
-- to signed-in users is one no reader can check.

('elizabeth-purcell', 'trustee-tldsb', 'school-services',
 'Ran because before- and after-school care was cancelled at her daughter''s school, and found the same thing happening elsewhere.',
 '["Says she did not know who her local trustee was before this summer.", "Says families were left trying to fit work, transportation and childcare together with few alternatives.", "Replying to a comment on her own page, she said the province mandates each board to provide the program through legislation, and that the third-party company chosen by the board ceased operating in multiple schools with no backup plan. That is her account; SmarterVote has not independently verified it.", "Says there may be no resolution soon and that her own family is living it."]',
 'Multiple schools in our area were facing the same situation. I reached out to our local Trustees looking for help and came away with the impression that the extent of the issue wasn''t really on their radar — and there didn''t seem to be a clear path toward a solution.',
 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Byf6BrZ6G58Zv9nDxDDfKV19g3oBQ98RZiDKwivYahZjCbgps82fix2uwzSL2FXUl&id=61593269308387',
 'Elizabeth Purcell campaign page — Why I decided to run for School Board Trustee',
 '2026-09-12', 'a page or more'),

('elizabeth-purcell', 'trustee-tldsb', 'trustee-role',
 'Says recent provincial changes have limited trustees, but the job of being a bridge to families remains.',
 '["Acknowledges the role has changed and that provincial changes placed new limits on trustee authority.", "Says a trustee will not be able to fix every problem, and does not claim otherwise.", "Commits to making sure issues with significant impact on families are recognised, brought forward and addressed as quickly as possible.", "Says she arrived at this as a parent who hit a problem and started asking questions, not through political ambition."]',
 'Trustees are a bridge between our students, families and communities and the Board that serves them. That bridge only works if it is visible, accessible and engaged.',
 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Byf6BrZ6G58Zv9nDxDDfKV19g3oBQ98RZiDKwivYahZjCbgps82fix2uwzSL2FXUl&id=61593269308387',
 'Elizabeth Purcell campaign page — Why I decided to run for School Board Trustee',
 '2026-09-12', 'a page or more'),

-- ---- Peggy Peterson, District and Town councillor --------------------
-- READ THE REVIEW NOTE AT THE BOTTOM OF THIS FILE BEFORE APPROVING.

('peggy-peterson', 'district-and-town-councillor', 'how-council-works',
 'Says that if elected she will not swear the declaration of office, and frames her oath as being to residents instead.',
 '["Describes her platform as honesty and genuine care for community.", "Says her issues remain and she will talk about all of them during the campaign, with no backing down and no capitulating.", "Posted to her own public campaign page on 6 September 2026."]',
 'My Oath will be to serve the people of Huntsville and Muskoka to the best of my ability without fear.',
 'https://www.facebook.com/permalink.php?story_fbid=pfbid07d46KrDH6uDfWi1Pj5SYbMPidrFRV4Dc6W5P1wPooJNLVaTSBuGvxLQi9YzoY8Znl&id=61593625170983',
 'Peggy Peterson campaign page — post of 6 September 2026',
 '2026-09-06', 'a few sentences')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_date, source_extent)
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'municipal issues (should be unchanged at 12)' as "Check",
       (select count(*)::text from issues i join municipalities m on m.id = i.municipality_id
        where m.slug = 'huntsville' and i.applies_to = 'municipal') as "Result"
union all
select 'school board issues',
       (select count(*)::text from issues i join municipalities m on m.id = i.municipality_id
        where m.slug = 'huntsville' and i.applies_to = 'school_board') || ' (expect 3)'
union all
select 'Purcell positions',
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id
        where c.slug = 'elizabeth-purcell') || ' (expect 2)'
union all
select 'Peterson positions',
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id
        where c.slug = 'peggy-peterson') || ' (expect 6)'
union all
select 'no trustee position landed on a municipal issue',
       case when not exists (
         select 1 from positions p
         join candidates c on c.id = p.candidate_id
         join races r on r.id = c.race_id
         join issues i on i.id = p.issue_id
         where r.race_type = 'school_board' and i.applies_to <> 'school_board'
       ) then 'PASS' else 'FAIL' end
union all
select 'no municipal position landed on a trustee issue',
       case when not exists (
         select 1 from positions p
         join candidates c on c.id = p.candidate_id
         join races r on r.id = c.race_id
         join issues i on i.id = p.issue_id
         where r.race_type <> 'school_board' and i.applies_to = 'school_board'
       ) then 'PASS' else 'FAIL' end
union all
select 'total positions',
       (select count(*)::text from positions) || ' (expect 111)'
union all
select 'awaiting approval',
       (select count(*)::text from positions p where p.status = 'in_review') || ' (expect 64)';

-- =====================================================================
-- REVIEW NOTE — PEGGY PETERSON. PLEASE READ BEFORE APPROVING THIS ROW.
--
-- Her post says that if elected she will not swear "a declaration of
-- Office and fealty to the British King". I have quoted her accurately
-- and summarised without comment, and I have deliberately NOT added any
-- statement about whether a declaration of office is legally required to
-- take a seat, because I have not sourced that this session and will not
-- assert law I have not checked.
--
-- That leaves you a judgment call, and it is genuinely yours:
--
--   (a) Publish as written. Her words, her page, no gloss.
--   (b) Publish with a sourced factual note about what Ontario's
--       Municipal Act requires — which needs a citation, and which some
--       readers will see as us putting a thumb on the scale.
--   (c) Ask her first. This is exactly what the corrections process is
--       for, in reverse: "you posted this, is this your position, is
--       there context you want alongside it?"
--
-- My recommendation is (c), then (a). It is a real position, publicly
-- stated, and omitting it would be its own kind of editorial choice.
--
-- ONE THING WE MUST NOT DO. A commenter on her Doppler article made
-- claims about views she allegedly expressed to Council two years ago on
-- UN control, depopulation and vaccines. That is an unverified assertion
-- by a member of the public. It is not evidence, it is not sourced, and
-- nothing derived from it goes anywhere near this site. I mention it only
-- so that if you encounter it, you know it was seen and deliberately
-- excluded.
--
-- =====================================================================
-- WHAT THE SOCIAL PASS DID NOT PRODUCE
--
-- Dione Schumacher's Instagram is public and personal: 54 posts, family
-- and community photographs, nothing about the election, and nothing
-- posted since before nominations closed. There is no campaign content to
-- find. Recorded here so this is not re-checked every time.
--
-- Facebook and Instagram remain closed to me otherwise. Signed in, I can
-- read what a signed-in person sees — but anything visible only to
-- signed-in users fails our own rule that a reader must be able to open
-- the source and check it. So the practical yield of social media is
-- limited to PUBLIC PAGES, which is what Purcell's and Peterson's are.
--
-- STILL AT ZERO POSITIONS, now eight rather than ten:
--   Brian Ellas, Helena Renwick (District and Town)
--   Jason FitzGerald, Dione Schumacher (Stisted/Stephenson/Port Sydney)
--   Bruce Reain (TLDSB), Joshua Boutotte (SMCDSB, acclaimed),
--   Bruce Cazabon (CSPNE, acclaimed), Donald Blais, Innocent Legrand
--   (CSC MonAvenir)
--
-- Nine of them, and I have now exhausted every public source I can reach
-- for all of them. The 22 September meeting at Utterson Hall and writing
-- to every candidate in early October are the only routes left. That is
-- not a research problem any more; it is a scheduling one.
-- ---------------------------------------------------------------------
