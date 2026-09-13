-- =====================================================================
-- SmarterVote.ca — source_extent for the 47 already-published positions
--
-- The second pass. All eight batch-1 campaign websites were re-read on
-- 13 September 2026, including the three platform sub-pages that had
-- never been opened:
--     caswellformayor.ca/mypriorities
--     michaelankenmann.ca/platform
--     kirstyforbrunel.ca/priorities
--
-- Each row below is set against the ACTUAL PASSAGE its quote came from,
-- checked by pulling the source_url out of 05_positions.sql first rather
-- than judging the site as a whole. A candidate can write a long page on
-- housing and one clause on the environment, and this has to show that.
--
-- After this file, every published position has a value and the annotation
-- is consistent across the whole comparison grid.
--
-- Run AFTER 11_source_extent.sql. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PREFLIGHT
--
-- This file writes to a column that 11_source_extent.sql creates. Run out
-- of order, Postgres says:
--     column "source_extent" of relation "positions" does not exist
-- which is accurate and tells you nothing about what to do next.
--
-- These files have grown into a chain with real dependencies between
-- them, and "which ones have I run?" is not a question the SQL editor can
-- answer. So each dependent file now checks its own prerequisite and says
-- what to run instead. See RUN_ORDER.md.
-- ---------------------------------------------------------------------
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'positions' and column_name = 'source_extent'
    ) then
        raise exception
            'Run 11_source_extent.sql first. It creates the source_extent column that this file fills in. Nothing has been changed.';
    end if;
end $$;

begin;

update positions p
set    source_extent = v.extent
from  (values

-- ---------------------------------------------------------------------
-- DAN ARMOUR — danarmour4mayor.ca
-- Eight numbered priorities, each one or two sentences. Separately, "A
-- Message from Dan" and "Getting Back to the Basics" run to several
-- paragraphs and are almost entirely about taxes and how he would govern
-- — which is why those two issues score higher than the rest.
-- ---------------------------------------------------------------------
('dan-armour', 'taxes-and-spending',       'several paragraphs'),
('dan-armour', 'how-council-works',        'several paragraphs'),
('dan-armour', 'housing',                  'one sentence'),
('dan-armour', 'growth-and-development',   'one sentence'),
('dan-armour', 'healthcare-and-hospital',  'one sentence'),
('dan-armour', 'environment',              'one sentence'),
('dan-armour', 'roads-and-infrastructure', 'one sentence'),
('dan-armour', 'economy-and-downtown',     'one sentence'),

-- ---------------------------------------------------------------------
-- DAN CASWELL — caswellformayor.ca/mypriorities
-- Six numbered priorities, each with three to six paragraphs and a "My
-- focus" summary. Priority 01 is the longest on the site and carries the
-- $10 million hospital share and the proposed Community Hospital Fund,
-- so healthcare gets the top value; taxes shares that section but is the
-- lesser half of it.
-- ---------------------------------------------------------------------
('dan-caswell', 'healthcare-and-hospital',  'a page or more'),
('dan-caswell', 'taxes-and-spending',       'several paragraphs'),
('dan-caswell', 'roads-and-infrastructure', 'several paragraphs'),
('dan-caswell', 'district-table',           'several paragraphs'),
('dan-caswell', 'how-council-works',        'several paragraphs'),
('dan-caswell', 'growth-and-development',   'several paragraphs'),

-- ---------------------------------------------------------------------
-- BOB STONE — votebobstone.ca
-- Six "Future Priorities" cards of three bullets each, plus four numbered
-- record items. Environment appears in both a record item (the Dark Sky
-- bylaw, with a linked news article) and a priority card, so it is the
-- one he has written most about. District is a single bullet.
-- ---------------------------------------------------------------------
('bob-stone', 'environment',              'several paragraphs'),
('bob-stone', 'housing',                  'a few sentences'),
('bob-stone', 'healthcare-and-hospital',  'a few sentences'),
('bob-stone', 'taxes-and-spending',       'a few sentences'),
('bob-stone', 'economy-and-downtown',     'a few sentences'),
('bob-stone', 'parks-and-trails',         'a few sentences'),
('bob-stone', 'growth-and-development',   'a few sentences'),
('bob-stone', 'district-table',           'one sentence'),

-- ---------------------------------------------------------------------
-- LELAND MAW — lelandmawforcouncil.ca
-- Three campaign priorities, each one or two paragraphs. Economy and
-- district come not from the priorities but from elsewhere on the same
-- page: the blog excerpt on seasonal, part-time work, and the welcome
-- paragraph on bridging taxpayers and regional governance. Both are
-- shorter than the priorities, and are marked accordingly.
-- ---------------------------------------------------------------------
('leland-maw', 'housing',                  'several paragraphs'),
('leland-maw', 'roads-and-infrastructure', 'several paragraphs'),
('leland-maw', 'how-council-works',        'a few sentences'),
('leland-maw', 'economy-and-downtown',     'a few sentences'),
('leland-maw', 'district-table',           'one sentence'),

-- ---------------------------------------------------------------------
-- LOUISA CHIARAMONTE — louisachiaramonte.ca
-- Six platform topics, each with four sub-points carrying a bold lead and
-- an explanatory sentence. Governance is the largest. Uniform treatment
-- across the rest, which is unusual and worth seeing in the grid.
-- ---------------------------------------------------------------------
('louisa-chiaramonte', 'how-council-works',        'a page or more'),
('louisa-chiaramonte', 'growth-and-development',   'several paragraphs'),
('louisa-chiaramonte', 'roads-and-infrastructure', 'several paragraphs'),
('louisa-chiaramonte', 'parks-and-trails',         'several paragraphs'),
('louisa-chiaramonte', 'taxes-and-spending',       'several paragraphs'),
('louisa-chiaramonte', 'environment',              'several paragraphs'),

-- ---------------------------------------------------------------------
-- TYLER ELLIS — tylerwilliamellis.com
-- Four priorities, each expanded in "A Plan That Can Be Measured" into
-- five bullets plus a funding or safeguard note. The roads and taxes
-- sections are the most detailed on any site in this election, including
-- a named savings target. District is not one of his four; it comes from
-- a single bullet inside the rural services section.
-- ---------------------------------------------------------------------
('tyler-ellis', 'roads-and-infrastructure', 'a page or more'),
('tyler-ellis', 'taxes-and-spending',       'a page or more'),
('tyler-ellis', 'how-council-works',        'a page or more'),
('tyler-ellis', 'parks-and-trails',         'a page or more'),
('tyler-ellis', 'district-table',           'one sentence'),

-- ---------------------------------------------------------------------
-- MICHAEL ANKENMANN — michaelankenmann.ca
-- NOTE: the three published quotes came from the four short "Principles
-- for Town Council" blocks on the home page. His /platform page, which I
-- had never opened before today, is far longer — five detailed bullets
-- under lower taxes alone, plus sections on service standards, planning
-- reform, healthcare advocacy and housing.
--
-- The extents below describe the HOME PAGE, because that is what each
-- quote is sourced from and the note must match its own source. But this
-- understates him, and the fix is not to inflate these numbers: it is to
-- extract new positions from /platform, where he has material on
-- healthcare, housing, economy and environment that we currently show as
-- blank. Flagged at the bottom of this file.
-- ---------------------------------------------------------------------
('michael-ankenmann', 'taxes-and-spending',     'a few sentences'),
('michael-ankenmann', 'how-council-works',      'a few sentences'),
('michael-ankenmann', 'growth-and-development', 'a few sentences'),

-- ---------------------------------------------------------------------
-- KIRSTY KOOP — kirstyforbrunel.ca/priorities
-- Five priorities, each a heading, two or three paragraphs and a bolded
-- closing line. Environment has no section of its own; it comes from one
-- sentence inside the growth priority about lakes, forests and dark skies.
-- ---------------------------------------------------------------------
('kirsty-koop', 'housing',                  'several paragraphs'),
('kirsty-koop', 'taxes-and-spending',       'several paragraphs'),
('kirsty-koop', 'roads-and-infrastructure', 'several paragraphs'),
('kirsty-koop', 'growth-and-development',   'several paragraphs'),
('kirsty-koop', 'how-council-works',        'several paragraphs'),
('kirsty-koop', 'environment',              'one sentence')

      ) as v(cand_slug, issue_slug, extent)
where  p.candidate_id = (select id from candidates where slug = v.cand_slug)
  and  p.issue_id = (select i.id from issues i
                     join municipalities m on m.id = i.municipality_id
                     where m.slug = 'huntsville' and i.slug = v.issue_slug)
  and  p.source_type = 'candidate_website';

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'published positions still missing an extent' as "Check",
       count(*)::text || ' (expect 0)' as "Result"
from   positions where status = 'published' and source_extent is null
union all
select 'every position, any status, with an extent',
       count(*) filter (where source_extent is not null)::text || ' of ' || count(*)::text
from   positions
union all
select 'no size claim on a journalist''s words',
       case when not exists (
         select 1 from positions
         where source_type in ('local_news','all_candidates_meeting')
           and source_extent in ('one sentence','a few sentences',
                                 'several paragraphs','a page or more')
       ) then 'PASS' else 'FAIL' end
union all
select 'spread across the four sizes',
       string_agg(source_extent || ': ' || n::text, ' · ' order by source_extent)
from  (select source_extent, count(*) n from positions
       where source_extent is not null group by source_extent) x;

-- ---------------------------------------------------------------------
-- WHAT THIS PASS TURNED UP THAT IS NOT ABOUT LENGTH
--
-- MICHAEL ANKENMANN IS UNDER-REPRESENTED, AND IT IS OUR FAULT.
-- He has three positions on this site. He has a full /platform page that
-- I never opened when extracting batch 1, and it contains clear material
-- on at least four issues we currently show as blank for him:
--
--   healthcare-and-hospital  "Council should be an active, vocal partner
--                            in advancing a sustainable future hospital"
--                            and encouraging more family doctors.
--   housing                  More options for young families, seniors
--                            downsizing and workers, via secondary suites
--                            and infill, with a simpler approval process.
--   economy-and-downtown     Backing local business and tourism, while
--                            explicitly opposing Town subsidies.
--   environment              Stewarding lakes, rivers and forests, and
--                            taking pollution, dumping and littering
--                            seriously.
--
-- A blank on this site says "no public position found as of [date]". For
-- these four that statement is currently false, and it is false in the
-- direction that makes a candidate look thinner than he is. That is a
-- correction to make before launch, not after — say the word and I will
-- write it as batch 3.
--
-- DAN CASWELL PUTS A NUMBER ON THE HOSPITAL.
-- His priorities page names a $10 million local share and proposes a
-- dedicated Huntsville Community Hospital Fund to build it up from
-- efficiency savings and from ending District duplication. Our published
-- healthcare position for him may predate that page; worth re-reading
-- during review to check the summary still matches what he now says.
-- ---------------------------------------------------------------------
