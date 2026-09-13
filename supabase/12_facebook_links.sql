-- =====================================================================
-- SmarterVote.ca — Monty Clouthier and Kirsty Koop on Facebook
--
-- Both URLs were supplied and confirmed by Andreas. That is branch (b) of
-- the link rule: a person opened the page and confirmed it is them.
--
-- ---------------------------------------------------------------------
-- KOOP IS THE THIRD PROOF THAT WE MUST NEVER BUILD A URL
--
-- The Town's certified list gives her Facebook as the free text
-- "kirstyforbrunel". The obvious construction is
--
--     facebook.com/kirstyforbrunel          <-- WRONG
--
-- Her actual page is
--
--     facebook.com/profile.php?id=61593057047616
--
-- Nothing about the handle would have got us there. This is the same
-- failure shape as James Bowler, and the second one this week after the
-- Wix template icons on Leland Maw's site. Three different ways to invent
-- a link, three near misses, one rule: relay published addresses, never
-- assemble them.
--
-- Her page independently corroborates itself, which is worth recording:
-- it lists the phone number (705) 571-1244, the email
-- hello@kirstyforbrunel.ca and the website kirstyforbrunel.ca — all three
-- matching the Town's certified candidate list exactly.
--
-- Clouthier's profile lists "Owner at Muskoka Crane, Huntsville, Ontario",
-- matching both his registered campaign email (muskokacrane@gmail.com) and
-- Doppler's reporting that he recently sold that business.
--
-- ---------------------------------------------------------------------
-- NO POSITIONS CAME OUT OF EITHER PAGE, AND WHY
--
-- I could not read either timeline. Facebook shows a logged-out visitor
-- the profile header, the About block and photos, then puts a login wall
-- over everything else. Signing in is not something I will do on your
-- behalf, so there is no way for me to read their posts.
--
-- What was visible:
--   Clouthier — no posts at all. Personal profile, fully gated.
--   Koop      — exactly one post, 2 September: "Working for and Living in
--               Brunel! Signs are going up!" truncated at "See more".
--               About lawn signs, not a position on anything.
--
-- So neither candidate gains a position here. Clouthier keeps the three
-- from Doppler; Koop keeps her six from her website.
--
-- IF YOU WANT THEIR FACEBOOK CONTENT, you will have to read the pages
-- yourself while signed in and send me what they actually say. Your note
-- about Clouthier resharing Bob Stone's video is exactly the reason that
-- matters: a reshare is not a statement, and attributing another
-- candidate's words to him would be worse than having no position at all.
-- Nothing in this file assumes anything about what is behind that wall.
--
-- Run AFTER 11_source_extent.sql. Safe to re-run.
-- =====================================================================

begin;

-- Written as "drop any entry with this URL, then append" so the file is
-- re-runnable and, crucially, so Koop's existing Instagram link from her
-- website survives. A plain assignment would have silently deleted it.
update candidates
set verified_links = (
      select coalesce(jsonb_agg(e), '[]'::jsonb)
      from   jsonb_array_elements(verified_links) e
      where  e->>'url' <> 'https://www.facebook.com/monty.clouthier/'
    ) || jsonb_build_array(
      jsonb_build_object(
        'platform',    'facebook',
        'label',       'Facebook',
        'url',         'https://www.facebook.com/monty.clouthier/',
        'verified_at', '2026-09-13',
        'verified_by', 'Andreas — opened the page and confirmed it is him',
        'found_on',    'Supplied by Andreas. Profile lists Owner at Muskoka Crane, Huntsville, Ontario.')
    )
where slug = 'monty-clouthier';

update candidates
set verified_links = (
      select coalesce(jsonb_agg(e), '[]'::jsonb)
      from   jsonb_array_elements(verified_links) e
      where  e->>'url' <> 'https://www.facebook.com/profile.php?id=61593057047616'
    ) || jsonb_build_array(
      jsonb_build_object(
        'platform',    'facebook',
        'label',       'Facebook',
        'url',         'https://www.facebook.com/profile.php?id=61593057047616',
        'verified_at', '2026-09-13',
        'verified_by', 'Andreas — opened the page and confirmed it is her',
        'found_on',    'Supplied by Andreas. Page lists the same phone, email and website as the Town''s certified candidate list.')
    )
where slug = 'kirsty-koop';

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'Clouthier links' as "Check",
       coalesce((select jsonb_array_length(verified_links)
                 from candidates where slug = 'monty-clouthier'), 0)::text
       || ' (expect 1)' as "Result"
union all
select 'Koop links — Instagram must have survived',
       coalesce((select jsonb_array_length(verified_links)
                 from candidates where slug = 'kirsty-koop'), 0)::text
       || ' (expect 2: Instagram from her site, Facebook from you)'
union all
select 'Koop still has her Instagram',
       case when exists (
         select 1 from candidates c, lateral jsonb_array_elements(c.verified_links) e
         where c.slug = 'kirsty-koop' and e->>'platform' = 'instagram'
       ) then 'PASS' else 'FAIL — the append overwrote it' end
union all
select 'nobody gained a position from Facebook',
       case when not exists (
         select 1 from positions where source_url like '%facebook.com%'
       ) then 'PASS — none, correctly' else 'FAIL — check what got in' end
union all
select 'total links across all candidates',
       coalesce(sum(jsonb_array_length(verified_links)), 0)::text || ' (expect 18)'
from   candidates;

-- ---------------------------------------------------------------------
-- ONE CONSEQUENCE WORTH NOTICING
--
-- The Town lists a Facebook handle for Koop that does not correspond to
-- her page. Her `socials` column still holds "kirstyforbrunel" because
-- that is genuinely what the Town published and we do not edit the public
-- record. It will no longer be displayed as text, because she now has a
-- verified Facebook link and WebsiteLink suppresses the free-text entry
-- for any platform that has one.
--
-- That is the right outcome — a reader sees one correct link rather than a
-- correct link and a misleading handle side by side — but it does mean the
-- site quietly stops showing something the Town published. If anyone ever
-- asks why our listing differs from the Town's, that is the answer, and it
-- is documented here.
-- ---------------------------------------------------------------------
