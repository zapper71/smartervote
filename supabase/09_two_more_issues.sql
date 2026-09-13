-- =====================================================================
-- SmarterVote.ca — two more issues, and the first verified social links
--
-- APPROVED BY ANDREAS, 13 September 2026. This replaces the earlier
-- 09_two_more_issues_OPTIONAL.sql, which was a question rather than a
-- migration. Delete that file after this one runs.
--
--   PART 1  Two new issues at the end of the list, plus Davis's two
--           positions that belong to them.
--   PART 2  Social link policy change, a new guard against a trap we
--           nearly walked into, and links for 7 candidates.
--
-- Run AFTER 08_positions_round2.sql. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART 1 — TWO NEW ISSUES
--
-- WHY THESE EXIST
-- The original ten issues were derived from six candidate platforms. Six
-- turned out to be a small sample: reading Rylind Davis's site in full
-- found two central pillars with nowhere to go.
--
--   * Police and fire services — his longest page. A new fire master plan,
--     a new headquarters, the future of Station One, a career-firefighter
--     model, replacing the aerial ladder truck, a shared emergency
--     services campus with the OPP and paramedics.
--   * Transit and accessible transportation — routes, modified transit,
--     the Northlander, bus shelters, rural Direct Rapid Transit.
--
-- Filing a fire headquarters under "roads and infrastructure" would have
-- made a candidate's top priority look like a footnote on somebody else's
-- issue. The gap was in our taxonomy, not in the candidates.
--
-- THEY GO AT THE END, sort_order 11 and 12. Two reasons:
--   * Presentation order is not a ranking (the methodology page says so),
--     but readers infer one anyway, and issues 1–10 have been reviewed
--     across 18 candidates while these two have been reviewed across one.
--     Putting them last is honest about that asymmetry.
--   * It leaves the existing ten in the order voters and candidates have
--     already seen, so nothing shifts underneath anyone.
--
-- THE COST, STATED PLAINLY: every candidate page now has 12 rows, and for
-- most candidates both new ones will read "Not reviewed yet" until the
-- 22 September all-candidates meeting and the October candidate write-out.
-- That is the honest picture, not a regression.
-- ---------------------------------------------------------------------

begin;

with m as (select id from municipalities where slug = 'huntsville')
insert into issues (municipality_id, name, slug, voter_question, description, sort_order)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order
from m, (values

('Police, fire and emergency services',
 'emergency-services',
 'Who shows up when you call 911, and do they have what they need?',
 'Policing priorities and visible presence, the Huntsville Fire Department now that the shared agreement with Lake of Bays has ended, fire station and equipment decisions, and coordination between police, fire and paramedics. Added after the first ten issues were set, when a candidate platform made it a central pillar that none of the ten could hold.',
 11),

('Transit and getting around without a car',
 'transit',
 'Can you get where you need to go if you do not drive?',
 'Local bus routes, modified and accessible transit, regional connections including the Northlander and Corridor 11, bus shelters, and transit into rural parts of the municipality. Distinct from roads, which is about the condition of the infrastructure rather than whether a service exists at all.',
 12)

) as v(name, slug, voter_question, description, sort_order)
on conflict (municipality_id, slug) do update set
    name           = excluded.name,
    voter_question = excluded.voter_question,
    description    = excluded.description,
    sort_order     = excluded.sort_order;

-- ---------------------------------------------------------------------
-- The two Rylind Davis positions that belong to them.
-- Same rules as every other row: his words, his URL, in_review.
-- ---------------------------------------------------------------------
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

('rylind-davis', 'wards-1-2', 'emergency-services',
 'Wants a new fire master plan, planning for a new headquarters, and a hard look before Station One is sold.',
 '["Says the current Fire Master Plan was written in 2022 for the former Huntsville-Lake of Bays Fire Department, and that partnership ended on 1 July 2026, so the plan should be rewritten for the next decade.", "Wants planning for a new fire headquarters to start now, before suitable land is no longer available.", "Opposes automatically declaring Station One surplus, and would examine whether it could serve as a third station covering the downtown core.", "Supports planning for a station capable of supporting career firefighters alongside the existing volunteers.", "Backs replacing the aging aerial ladder truck.", "Would seriously consider a shared emergency services campus with the OPP and Muskoka Paramedic Services.", "On policing, wants a visible OPP presence downtown and priorities that reflect mental health and addictions needs."]',
 'When someone calls 911, they expect help to arrive quickly, safely, and with the equipment needed to do the job.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/police-and-fire-services',
 'Rylind Davis campaign website — Police and Fire Services (updated 28 August 2026)',
 'candidate_website', '2026-08-28'),

('rylind-davis', 'wards-1-2', 'transit',
 'Expand routes into growing areas, improve modified transit, and connect to regional services.',
 '["Would expand transit routes to serve areas of Huntsville-Chaffey seeing new residential development.", "Wants Huntsville''s modified transit service expanded and improved for residents who depend on accessible transportation.", "Would strengthen connections to the Northland Bus, the Northlander train and the Corridor 11 bus.", "Supports more covered bus shelters.", "Would work with the District to extend Direct Rapid Transit into rural Huntsville.", "Served on both the Huntsville and District of Muskoka Accessibility Advisory Committees, currently on leave for the campaign."]',
 'A connected community is one where everyone can get where they need to go safely, independently, and with dignity.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/accessibility-and-transit',
 'Rylind Davis campaign website — Accessibility and Transit',
 'candidate_website', '2026-09-13')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_type, source_date)
on conflict do nothing;

-- =====================================================================
-- PART 2 — SOCIAL LINK POLICY CHANGE
--
-- NEW RULE, approved 13 September 2026:
--   A social media address that a candidate publishes on their OWN campaign
--   website may be linked. If it is wrong, the candidate published it, and
--   the error is theirs to own and ours to correct on request.
--
-- WHY THIS IS NOT A LOOSENING OF THE JAMES BOWLER RULE
-- The Bowler failure was not "we used a link that turned out to be wrong".
-- It was that WE MANUFACTURED AN ADDRESS out of a handle and presented our
-- guess as fact. Nobody had ever published it. The line that matters is:
--
--     PUBLISHED BY SOMEONE  ->  may be relayed
--     ASSEMBLED BY US       ->  never, under any circumstances
--
-- A candidate's own campaign site sits firmly on the safe side of that
-- line, and on stronger ground than the Town's certified list: the Town
-- transcribes what a candidate wrote on a form, whereas the campaign site
-- is the candidate publishing directly, usually under an "Authorized by
-- the campaign" notice. We already link `website` on exactly this basis.
--
-- ---------------------------------------------------------------------
-- THE TRAP WE NEARLY WALKED INTO — READ THIS BEFORE ADDING ANY LINK
--
-- Leland Maw's site is built on Wix. Its footer carries the full row of
-- social icons, and every one of them is still wired to the TEMPLATE
-- DEFAULT:
--
--     http://www.facebook.com     http://www.instagram.com
--     http://www.youtube.com      http://www.x.com
--     http://www.linkedin.com     http://www.tiktok.com
--
-- Those are the platforms' own front doors. He never filled them in. A
-- rule that said "take whatever the campaign site links to" would have put
-- six social buttons under his name, all leading nowhere, making a
-- candidate with no social presence look like one with six accounts.
--
-- So the rule has a second half: the published address must IDENTIFY AN
-- ACCOUNT. A bare platform homepage is not an account, and is now rejected
-- by the database rather than by whoever is paying attention that day.
--
-- WHAT STAYS BANNED
--   * Building a URL from a handle or a name. Still never.
--   * Linking a `socials` free-text entry from the Town's list. Still text.
--   * Linking a page found by searching a candidate's name. Names repeat;
--     that is precisely how a South Carolina stranger ended up attached to
--     a Huntsville candidate.
--
-- THE ONLY EDIT WE MAKE TO A PUBLISHED ADDRESS
-- If it was published as http://, we store https:// — same host, same
-- path, same query. The platforms redirect there anyway and the trigger
-- requires it. We never touch the host, the path or the query string,
-- because that is where the identity lives. (This applies to two links
-- below: Caswell's Instagram. Koop's Instagram keeps its ?hl=en exactly
-- as she published it, ugly but untouched.)
-- ---------------------------------------------------------------------

comment on column candidates.verified_links is
    'Array of {platform,label,url,verified_at,verified_by,found_on}. A social URL belongs here when (a) the candidate published it on their own campaign website — record that page in found_on — or (b) a person opened it and confirmed it is this candidate. Never build a URL from a handle, and never store a bare platform homepage. These are the only social links the site renders.';

-- ---------------------------------------------------------------------
-- Validation, extended. Everything the trigger already checked still
-- applies; the new clauses reject platform homepages and require
-- found_on so provenance is never optional.
-- ---------------------------------------------------------------------
create or replace function validate_verified_links()
returns trigger as $$
declare
    e jsonb;
    u text;
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
                'Each verified link must be an object with platform, label, url, verified_at, verified_by and found_on.';
        end if;

        u := coalesce(e->>'url', '');

        if u !~ '^https://' then
            raise exception
                'A verified link needs an https:// URL. Got: %. Copy the real address from the page that published it.',
                coalesce(nullif(u, ''), '(missing)');
        end if;

        -- A bare platform homepage is not an account. This is the Wix
        -- template-default case: an unfilled social icon that still points
        -- at facebook.com. Linking one would invent a social presence for a
        -- candidate who has none.
        if u ~* '^https://(www\.)?(facebook|instagram|x|twitter|youtube|linkedin|tiktok|threads|bsky)\.(com|app|social)/?(\?.*)?$' then
            raise exception
                'That is the platform''s own homepage, not a candidate account: %. Unfilled template links on campaign sites look exactly like this. Leave the handle as plain text instead.',
                u;
        end if;

        if coalesce(e->>'label', '') = '' then
            raise exception
                'A verified link needs a label, e.g. "Facebook". Offending entry: %', e::text;
        end if;

        if coalesce(e->>'verified_by', '') = '' then
            raise exception
                'A verified link needs verified_by — either the name of the person who confirmed it, or a note that the candidate published it themselves. Offending entry: %', e::text;
        end if;

        if coalesce(e->>'verified_at', '') = '' then
            raise exception
                'A verified link needs verified_at — the date it was checked. Offending entry: %', e::text;
        end if;

        if coalesce(e->>'found_on', '') = '' then
            raise exception
                'A verified link needs found_on — the page the address was taken from, so anyone can check why we believed it. Offending entry: %', e::text;
        end if;
    end loop;

    return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- The links themselves. Seven candidates publish social addresses on
-- their own campaign sites. All ten campaign websites were re-read on
-- 13 September 2026 for this purpose.
-- ---------------------------------------------------------------------
with links as (
  select * from (values

  ('dan-caswell',        'https://www.caswellformayor.ca/',
   '[{"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/profile.php?id=61589311260737"},
     {"platform":"instagram","label":"Instagram","url":"https://instagram.com/caswellformayor"}]'),

  ('louisa-chiaramonte', 'https://louisachiaramonte.ca/',
   '[{"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/profile.php?id=61593793181832"},
     {"platform":"instagram","label":"Instagram","url":"https://www.instagram.com/louisachiaramonte/"},
     {"platform":"x","label":"X","url":"https://x.com/lou_chiaramonte"},
     {"platform":"linkedin","label":"LinkedIn","url":"https://ca.linkedin.com/in/louisa-chiaramonte-38b376385"}]'),

  ('tyler-ellis',        'https://tylerwilliamellis.com/',
   '[{"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/tylerelliscouncilor"},
     {"platform":"x","label":"X","url":"https://x.com/EllisForCouncil"},
     {"platform":"linkedin","label":"LinkedIn","url":"https://www.linkedin.com/in/tylerwilliamellis"}]'),

  ('michael-ankenmann',  'https://www.michaelankenmann.ca/',
   '[{"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/michael.r.ankenmann/"},
     {"platform":"instagram","label":"Instagram","url":"https://instagram.com/michaelankenmann"},
     {"platform":"youtube","label":"YouTube","url":"https://www.youtube.com/channel/UCR0IlEqLjdKUBm9IJ_J5pVg"}]'),

  ('kirsty-koop',        'https://www.kirstyforbrunel.ca/',
   '[{"platform":"instagram","label":"Instagram","url":"https://www.instagram.com/kirstyforbrunel/?hl=en"}]'),

  ('rylind-davis',       'https://www.rylinddavis4huntsvillechaffey.ca/contact',
   '[{"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/rylinddavis4huntsvillechaffey"}]'),

  ('geordie-sabbagh',    'https://yourneighbourgeordie.ca/',
   '[{"platform":"instagram","label":"Instagram","url":"https://www.instagram.com/geordieyourneighbour/"},
     {"platform":"facebook","label":"Facebook","url":"https://www.facebook.com/profile.php?id=61592989230590"}]')

  ) as v(cand_slug, found_on, entries)
)
-- MERGE, NOT REPLACE.
--
-- The first version of this assigned verified_links outright, which made
-- the file destructive if anything was run after it. 12_facebook_links.sql
-- adds a Facebook link for Kirsty Koop; re-running this file would have
-- silently deleted it, and the only symptom would be a link quietly
-- vanishing from her page some time later.
--
-- Now it keeps every entry already present whose URL isn't one of the ones
-- below, then appends these. Idempotent, and safe in any order.
update candidates c
set verified_links =
      coalesce((
        select jsonb_agg(kept)
        from   jsonb_array_elements(c.verified_links) kept
        where  not exists (
                 select 1
                 from   jsonb_array_elements(l.entries::jsonb) incoming
                 where  incoming->>'url' = kept->>'url'
               )
      ), '[]'::jsonb)
      || (
        select jsonb_agg(
                 e || jsonb_build_object(
                   'verified_at', '2026-09-13',
                   'verified_by', 'Published by the candidate on their own campaign website',
                   'found_on',    l.found_on)
               )
        from jsonb_array_elements(l.entries::jsonb) e
      )
from links l
where c.slug = l.cand_slug;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'issue count' as "Check",
       count(*)::text || ' issues (was 10, expect 12)' as "Result"
from   issues i join municipalities m on m.id = i.municipality_id
where  m.slug = 'huntsville'
union all
select 'the two new issues are last',
       case when (
         select min(sort_order) from issues i join municipalities m on m.id = i.municipality_id
         where m.slug = 'huntsville' and i.slug in ('emergency-services','transit')
       ) = 11 then 'PASS — 11 and 12' else 'FAIL — check sort_order' end
union all
select 'Davis has positions on both new issues',
       count(*)::text || ' of 2'
from   positions p
join   issues i on i.id = p.issue_id
join   candidates c on c.id = p.candidate_id
where  c.slug = 'rylind-davis' and i.slug in ('emergency-services','transit')
union all
select 'candidates with verified social links',
       count(*)::text || ' of 7 expected'
from   candidates where jsonb_array_length(verified_links) > 0
union all
select 'total social links stored',
       coalesce(sum(jsonb_array_length(verified_links)), 0)::text || ' of 16 expected'
from   candidates
union all
select 'every link records where it came from',
       case when not exists (
         select 1 from candidates c, lateral jsonb_array_elements(c.verified_links) e
         where coalesce(e->>'found_on', '') = ''
       ) then 'PASS' else 'FAIL — a link has no found_on' end
union all
select 'no bare platform homepages stored',
       case when not exists (
         select 1 from candidates c, lateral jsonb_array_elements(c.verified_links) e
         where e->>'url' ~* '^https://(www\.)?(facebook|instagram|x|twitter|youtube|linkedin|tiktok)\.com/?$'
       ) then 'PASS' else 'FAIL — the Maw problem got in' end
union all
select 'Maw has no links (his site''s icons are template defaults)',
       case when coalesce((select jsonb_array_length(verified_links)
                           from candidates where slug = 'leland-maw'), 0) = 0
            then 'PASS — none, correctly' else 'FAIL — check what got in' end;

-- ---------------------------------------------------------------------
-- WHAT THIS PASS FOUND, CANDIDATE BY CANDIDATE
--
-- PUBLISHES SOCIAL ADDRESSES (now linked):
--   Dan Caswell          Facebook, Instagram          (site footer)
--   Louisa Chiaramonte   Facebook, Instagram, X, LinkedIn
--   Tyler Ellis          Facebook, X, LinkedIn
--   Michael Ankenmann    Facebook, Instagram, YouTube
--   Kirsty Koop          Instagram only
--   Rylind Davis         Facebook only               (Contact page)
--   Geordie Sabbagh      Instagram, Facebook          (site footer)
--
-- HAS A WEBSITE, PUBLISHES NO SOCIAL ADDRESSES (correctly gets none):
--   Dan Armour     — the Town lists a Facebook page name; his own site
--                    gives only phone, email and a contact form.
--   Bob Stone      — no social links anywhere on the site.
--   Leland Maw     — see the Wix template warning above. He appears to
--                    have six accounts and in fact has none linked.
--
-- WHERE THE TOWN LISTS A HANDLE THE SITE DOESN'T PUBLISH, the handle
-- stays plain text. Kirsty Koop is the clean example: the Town lists both
-- a Facebook and an Instagram, her site publishes only the Instagram, so
-- only the Instagram is a link. That is the rule working, not a gap.
--
-- ---------------------------------------------------------------------
-- TWO THINGS FOR YOU, NEITHER URGENT
--
-- 1. A FACTUAL DISAGREEMENT BETWEEN TWO CANDIDATES.
--    Bob Stone's website says the doctor recruitment programme he created
--    with Scott Morrison "has attracted 8 new doctors to Town". Morrison
--    told the Chamber meet-and-greet on 9 September it "has brought us
--    almost ten doctors now". Both are already on the site, each with its
--    own quote, source and date, which is the right outcome — the reader
--    can see both and neither of us has adjudicated. Worth knowing it is
--    there before someone points it out to you.
--
-- 2. LELAND MAW'S BLOG IS ACTIVE AND QUOTABLE.
--    lelandmawforcouncil.ca/blog has recent posts on the economy, on the
--    9 September meet and greet, and a plain-language explainer of how
--    Huntsville property taxes are calculated. Good source material for a
--    later batch; he currently has 5 positions, all from the main page.
-- ---------------------------------------------------------------------
