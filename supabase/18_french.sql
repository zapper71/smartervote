-- =====================================================================
-- SmarterVote.ca — race language, recorded but not rendered
--
-- THIS FILE USED TO TRANSLATE THE MONAVENIR RACE INTO FRENCH.
-- That decision was reversed on 13 September 2026, before anything shipped.
-- What follows is the reasoning, kept because the question will come up
-- again and the answer should not have to be reconstructed from memory.
--
-- THE CASE FOR FRENCH
-- One race on the ballot is for the Conseil scolaire catholique MonAvenir,
-- a French-language Catholic board. In Ontario you may only vote for
-- French-language trustees if you are registered as a French-language
-- rights holder elector. So while Huntsville is predominantly anglophone,
-- the electorate FOR THAT RACE is, by construction, people who chose
-- French-language education.
--
-- THE CASE AGAINST, WHICH WON
--   * Ontario francophones are overwhelmingly bilingual. Nobody would fail
--     to understand their ballot because this page is in English. The
--     benefit was recognition, not access.
--   * The translation had not been reviewed by a francophone, and
--     unreviewed French aimed at rights holders is worse than clear
--     English: a clumsy construction tells a reader their language was
--     handled carelessly.
--   * One unpaid person, 31 days to advance voting. A French mirror that
--     goes stale is worse than no French at all, and the same hours spent
--     on the tax explainer, the 22 September meeting and the candidate
--     emails reach far more voters.
--   * Both MonAvenir candidates currently have zero positions. The first
--     thing shipped would have been an empty page in two languages.
--
-- WHAT THIS FILE NOW DOES
-- Records the language of each race, and nothing else. The app does not
-- read it. It is a true fact about the race, it costs nothing, and if the
-- decision is ever revisited this is where it starts.
--
-- Run AFTER 17_candidate_contact.sql. Safe to re-run.
-- =====================================================================

begin;

alter table races
    add column if not exists language text not null default 'en';

alter table races drop constraint if exists races_language_check;
alter table races
    add constraint races_language_check check (language in ('en', 'fr'));

comment on column races.language is
    'The language a race is conducted in. RECORDED, NOT RENDERED — the site is English throughout, deliberately. See the header of 18_french.sql for why, and do not re-add translation without reading it first.';

update races set language = 'fr' where slug = 'trustee-monavenir';

-- Undo the translation columns if an earlier version of this file was run.
-- Dropping rather than leaving them empty: a nullable column nobody fills
-- is an invitation for someone to half-fill it later.
alter table issues
    drop column if exists name_fr,
    drop column if exists voter_question_fr,
    drop column if exists description_fr;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'MonAvenir race recorded as French' as "Check",
       coalesce((select language from races where slug = 'trustee-monavenir'), 'missing')
       || ' (expect fr)' as "Result"
union all
select 'no other race flagged',
       (select count(*)::text from races where language = 'fr') || ' of 1 expected'
union all
select 'translation columns are gone',
       case when not exists (
         select 1 from information_schema.columns
         where table_name = 'issues' and column_name like '%_fr'
       ) then 'PASS — reverted cleanly' else 'FAIL — a _fr column survives' end;

-- ---------------------------------------------------------------------
-- ONE THING THAT DID NOT GET REVERTED, AND SHOULDN'T BE
--
-- While building the French version I found two pages claiming the site
-- compares "the same ten issues". That stopped being true when the list
-- grew to twelve, and it is wrong in a different way for the trustee race,
-- which has three. Both now read from issues.length.
--
-- That was a separate bug that the translation work happened to surface.
-- It is the third time a claim the site makes ABOUT ITSELF has gone stale,
-- which is why "read the methodology page as if you were a candidate who
-- dislikes the site" is a blocking item on the launch checklist.
--
-- IF YOU EVER REVISIT THIS: the candidate email for Donald Blais and
-- Innocent Legrand is still in English. If the site is English, that is
-- consistent. If French ever returns, that letter is the first thing to
-- translate — before any page — because first contact in the wrong
-- language undercuts everything the pages would say.
-- ---------------------------------------------------------------------
