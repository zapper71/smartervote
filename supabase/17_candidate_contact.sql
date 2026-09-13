-- =====================================================================
-- SmarterVote.ca — recording that we asked
--
-- THE PROBLEM WITH OUR BLANKS
-- Every empty cell currently says one of two things:
--
--     "Not reviewed yet."
--     "No public statement found as of 13 September 2026."
--
-- Both are true. Both are also incomplete in a way that costs the
-- candidate. A reader sees an empty row and concludes the candidate has
-- nothing to say — when what actually happened is that we searched the
-- public record and never once wrote to them to ask.
--
-- Nine candidates have nothing at all. For most of them there is no
-- website, no press coverage and no readable social media, so the public
-- record was always going to be empty. Presenting that as their silence,
-- when it is really the limit of our searching, is the single least fair
-- thing this site currently does — and it lands hardest on exactly the
-- first-time and lower-resourced candidates the methodology page promises
-- not to disadvantage.
--
-- THE FIX
-- Record when we wrote to a candidate and when they replied, then say so
-- on the page:
--
--     "We asked on 16 Sep — no reply yet."
--
-- That is a statement about US, not about them, and it is checkable.
--
-- Run AFTER 16_social_and_school_board.sql. Safe to re-run.
-- =====================================================================

begin;

alter table candidates
    add column if not exists contacted_at   date,
    add column if not exists responded_at   date,
    add column if not exists contact_note   text;

comment on column candidates.contacted_at is
    'The date we emailed this candidate inviting them to correct or add to their page. NULL means we have not asked, and the site must not imply that an empty page is their choice.';

comment on column candidates.responded_at is
    'The date they replied, if they did. Set this even for a reply that declines to engage — "we asked and they declined" is a different fact from "we asked and heard nothing", and both are fairer than silence.';

comment on column candidates.contact_note is
    'Free text for you: bounced address, asked to be contacted another way, said they would send something later. Never displayed publicly.';

-- ---------------------------------------------------------------------
-- The view carries them through. APPENDED AT THE END, as always —
-- CREATE OR REPLACE VIEW can only add columns to the end.
-- ---------------------------------------------------------------------
create or replace view public_candidates as
select c.id, c.race_id, c.name, c.slug, c.status, c.website, c.socials,
       c.photo_url, c.bio, c.incumbent, c.last_reviewed_at,
       r.slug as race_slug, r.name as race_name, r.race_type, r.seats,
       m.slug as municipality_slug,
       c.verified_links,
       c.contacted_at,
       c.responded_at
from   candidates c
join   races r          on r.id = c.race_id
join   municipalities m on m.id = r.municipality_id
where  c.status <> 'withdrawn';

commit;

-- =====================================================================
-- THE MAIL MERGE
--
-- Run this to get one row per candidate with their email and a summary of
-- what the site currently holds for them. Copy it into the email template
-- in docs/candidate-email.md.
--
-- It is a query rather than a hard-coded list on purpose: run it again the
-- day you send and it will be current, including anything approved in the
-- meantime.
-- =====================================================================
select c.name                                   as "Candidate",
       r.name                                   as "Running for",
       c.email                                  as "Email",
       coalesce(count(p.id) filter (where p.status = 'published'), 0)::text
         || ' published'                        as "What we have",
       coalesce(
         string_agg(distinct i.name, '; ')
           filter (where p.status = 'published'),
         '— nothing yet —')                     as "Issues covered",
       coalesce(c.website, 'no website on the Town list') as "Their site",
       coalesce(c.contacted_at::text, 'not yet') as "Already contacted"
from   candidates c
join   races r on r.id = c.race_id
left   join positions p on p.candidate_id = c.id
left   join issues i on i.id = p.issue_id
where  c.status <> 'withdrawn'
group  by c.name, r.name, r.sort_order, c.email, c.website, c.contacted_at
order  by count(p.id) filter (where p.status = 'published') asc, r.sort_order, c.name;

-- ---------------------------------------------------------------------
-- AFTER YOU SEND — mark them contacted.
--
-- Only run this for the ones you actually sent to, on the day you send.
-- Setting it early would put a false statement on the public site, which
-- is precisely the thing this file exists to prevent.
--
--   update candidates
--   set    contacted_at = '2026-09-16'
--   where  status <> 'withdrawn'
--     and  contacted_at is null;
--
-- When someone replies:
--
--   update candidates
--   set    responded_at = current_date,
--          contact_note = 'sent a platform PDF, entered 18 Sep'
--   where  slug = 'brian-ellas';
--
-- If an address bounces, record that too — a bounced email is not a
-- candidate ignoring us, and the note is where you keep the difference:
--
--   update candidates
--   set    contact_note = 'address on the Town list bounced 16 Sep'
--   where  slug = '...';
-- ---------------------------------------------------------------------

-- VERIFY
select 'contact columns exist' as "Check",
       case when exists (select 1 from information_schema.columns
                         where table_name = 'candidates' and column_name = 'contacted_at')
            then 'PASS' else 'FAIL' end as "Result"
union all
select 'candidates contacted so far',
       (select count(*)::text from candidates where contacted_at is not null)
       || ' of 28 (expect 0 until you send)'
union all
select 'view exposes them',
       case when exists (select 1 from information_schema.columns
                         where table_name = 'public_candidates' and column_name = 'contacted_at')
            then 'PASS' else 'FAIL' end;
