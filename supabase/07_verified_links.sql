-- =====================================================================
-- SmarterVote.ca — verified social media links
--
-- WHY THIS EXISTS
-- Caught in testing, before launch: the site was building social media
-- links by GUESSING a URL from the handle the Town publishes.
-- `"facebook":"jamesbowler"` became facebook.com/jamesbowler — which is a
-- different James Bowler, in South Carolina.
--
-- That is not a broken link. It is a fabricated fact: an assertion that a
-- page belongs to a candidate, which nobody checked. It would have attached
-- a stranger's identity and posts to a person standing for office.
--
-- The positions table already forbids this class of error for quotes, via
-- the published_needs_source CHECK constraint. Links had no equivalent
-- rule. This adds one.
--
-- THE RULE
--   candidates.website        -> published as a URL by the Town. Linkable.
--   candidates.socials        -> free text handles/page names. NEVER linked.
--   candidates.verified_links -> URLs a HUMAN opened and confirmed.
--                                The only social links the site renders.
--
-- NOTE ON IMPLEMENTATION: this uses a TRIGGER, not a CHECK constraint.
-- Postgres forbids subqueries inside CHECK constraints, and validating the
-- contents of a JSON array requires iterating it. A trigger can do that,
-- and it can also raise a message that says exactly what is wrong — which
-- matters when the person hitting it is you at 11pm, not a developer.
--
-- Run AFTER 06_conflicting_positions.sql. Safe to re-run.
-- =====================================================================

begin;

alter table candidates
    add column if not exists verified_links jsonb not null default '[]'::jsonb;

comment on column candidates.socials is
    'Free text from the Town''s certified candidate list: handles and page names, NOT URLs. Never construct a link from this. See verified_links.';

comment on column candidates.verified_links is
    'Array of {platform,label,url,verified_at,verified_by}. A social URL only belongs here once a person has opened it and confirmed it is this candidate. These are the only social links the site renders.';

-- Remove the earlier attempt at a CHECK constraint, if it exists.
alter table candidates
    drop constraint if exists verified_links_shape;

-- ---------------------------------------------------------------------
-- Validation. Every entry must carry an https:// URL, a label, and a
-- record of who checked it and when. A half-filled entry is exactly how a
-- bad link would slip back in, so it is rejected at the database.
-- ---------------------------------------------------------------------
create or replace function validate_verified_links()
returns trigger as $$
declare
    e jsonb;
begin
    if new.verified_links is null then
        new.verified_links := '[]'::jsonb;
        return new;
    end if;

    if jsonb_typeof(new.verified_links) <> 'array' then
        raise exception
            'verified_links must be a JSON array, got %', jsonb_typeof(new.verified_links);
    end if;

    for e in select value from jsonb_array_elements(new.verified_links) loop
        if jsonb_typeof(e) <> 'object' then
            raise exception
                'Each verified link must be an object with platform, label, url, verified_at and verified_by.';
        end if;

        if coalesce(e->>'url', '') !~ '^https://' then
            raise exception
                'A verified link needs an https:// URL. Got: %. Copy the real address from your browser after confirming the page belongs to this candidate.',
                coalesce(nullif(e->>'url', ''), '(missing)');
        end if;

        if coalesce(e->>'label', '') = '' then
            raise exception
                'A verified link needs a label, e.g. "Facebook". Offending entry: %', e::text;
        end if;

        if coalesce(e->>'verified_by', '') = '' then
            raise exception
                'A verified link needs verified_by — the name of the person who opened the page and confirmed it. Offending entry: %', e::text;
        end if;

        if coalesce(e->>'verified_at', '') = '' then
            raise exception
                'A verified link needs verified_at — the date it was checked. Offending entry: %', e::text;
        end if;
    end loop;

    return new;
end;
$$ language plpgsql;

drop trigger if exists candidates_validate_verified_links on candidates;
create trigger candidates_validate_verified_links
    before insert or update of verified_links on candidates
    for each row execute function validate_verified_links();

-- The public view carries it through.
--
-- NOTE: verified_links is APPENDED at the end, not placed next to socials
-- where it belongs logically. CREATE OR REPLACE VIEW can only add columns to
-- the END of a view — inserting one in the middle makes Postgres read it as
-- a rename of the existing column at that position:
--     cannot change name of view column "photo_url" to "verified_links"
-- Dropping and recreating would allow any order but would also drop the
-- view's grants, so appending is the safer trade. Column order is irrelevant
-- to the app: supabase-js returns objects keyed by name.
create or replace view public_candidates as
select c.id, c.race_id, c.name, c.slug, c.status, c.website, c.socials,
       c.photo_url, c.bio, c.incumbent, c.last_reviewed_at,
       r.slug as race_slug, r.name as race_name, r.race_type, r.seats,
       m.slug as municipality_slug,
       c.verified_links
from   candidates c
join   races r          on r.id = c.race_id
join   municipalities m on m.id = r.municipality_id
where  c.status <> 'withdrawn';

commit;

-- ---------------------------------------------------------------------
-- HOW TO ADD A VERIFIED LINK
--
-- 1. Open the page yourself. Confirm from its CONTENT that it is the
--    Huntsville candidate — not someone with the same name. Look for the
--    ward, the Town, local photos, campaign posts. A matching name is not
--    confirmation; that is exactly how the James Bowler problem arose.
-- 2. Copy the real URL from the address bar.
-- 3. Run, substituting the slug and URL:
--
--    update candidates
--    set verified_links = verified_links || jsonb_build_array(
--      jsonb_build_object(
--        'platform','facebook',
--        'label','Facebook',
--        'url','https://www.facebook.com/THE-REAL-URL',
--        'verified_at', to_char(now(),'YYYY-MM-DD'),
--        'verified_by','Andreas'
--      ))
--    where slug = 'james-bowler';
--
-- To clear a link you got wrong:
--    update candidates set verified_links = '[]'::jsonb where slug = '...';
-- ---------------------------------------------------------------------

-- VERIFY — expect three PASS rows.
select 'verified_links column exists' as "Check",
       case when exists (
         select 1 from information_schema.columns
         where table_name = 'candidates' and column_name = 'verified_links'
       ) then 'PASS' else 'FAIL' end as "Result"
union all
select 'validation trigger active',
       case when exists (
         select 1 from information_schema.triggers
         where event_object_table = 'candidates'
           and trigger_name = 'candidates_validate_verified_links'
       ) then 'PASS' else 'FAIL' end
union all
select 'no candidate has a link yet (expected at this stage)',
       case when (select count(*) from candidates
                  where jsonb_array_length(verified_links) > 0) = 0
            then 'PASS — none set' else 'some already set' end;
