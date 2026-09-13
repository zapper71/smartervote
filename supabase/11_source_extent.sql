-- =====================================================================
-- SmarterVote.ca — how much the candidate actually published
--
-- THE PROBLEM
-- The comparison grid cannot tell the difference between a filled cell
-- and a filled cell. Rylind Davis wrote a long page on fire services;
-- Geordie Sabbagh named emergency services in a sentence. Both render as
-- one tidy summary and a "show their words" toggle, and a reader scanning
-- the row has no way to see that those are not the same kind of answer.
--
-- WHAT THIS IS NOT
-- It is not a score, a rating, a completeness meter or a star system.
-- There is no colour, no icon, no scale and no ordering in the UI. We
-- considered a filled/half/empty dot and rejected it: a visual scale IS a
-- rating, and it would rate candidates on how much they wrote — which
-- tracks money, staff and comfort with web publishing far more reliably
-- than it tracks conviction. Penalising a first-time candidate for not
-- owning a Squarespace account is exactly the bias this site exists to
-- remove.
--
-- WHAT IT IS
-- One plain fact about the SOURCE DOCUMENT, printed in brackets next to
-- the link that reveals the quote:
--
--     Show their words & source (a page or more)
--     Show their words & source (one sentence)
--
-- The reader draws their own conclusion. We assert nothing about quality.
--
-- ---------------------------------------------------------------------
-- THE ONE THING THAT WOULD HAVE MADE THIS UNFAIR
--
-- Measuring a news quote the same way as a campaign page. A candidate
-- with no website who gets two sentences in Doppler has not "said less"
-- than someone with a web designer — the reporter chose the length, not
-- them. Printing "(one sentence)" next to their name would blame them for
-- an editorial decision made by somebody else.
--
-- So local news never gets a size at all. It gets "reported remarks",
-- which describes what the source is and makes no size claim. Same for a
-- candidates' meeting. Sizes are only ever used for words the candidate
-- published themselves, where the length genuinely is their choice.
--
-- ---------------------------------------------------------------------
-- IT IS ALSO DERIVED FROM THE SOURCE, NOT FROM OUR QUOTE
--
-- The obvious cheap implementation is to count the words in
-- verbatim_quote at render time. That would be measuring our own
-- excerpting, not their writing: we quote one key sentence whether they
-- wrote a page or a line, so every cell would read about the same. It has
-- to be recorded by a person looking at the source. Hence a column.
--
-- Run AFTER 10_sabbagh_additions.sql. Safe to re-run.
-- =====================================================================

begin;

alter table positions
    add column if not exists source_extent text;

alter table positions
    drop constraint if exists positions_source_extent_check;

alter table positions
    add constraint positions_source_extent_check check (
        source_extent is null or source_extent in (
            -- Sizes, and only sizes. An earlier draft had "a dedicated page"
            -- as the top value, which mixed a length scale with a statement
            -- about page structure — and would have quietly rewarded
            -- candidates whose web builder gives each topic its own URL over
            -- ones who wrote just as much on a single long page. The measure
            -- is how much they wrote, not how they filed it.
            'one sentence',
            'a few sentences',
            'several paragraphs',
            'a page or more',
            -- Not sizes. For sources where the length was somebody else's
            -- decision, so no size claim is made or implied.
            'reported remarks',
            'remarks at a public meeting'
        )
    );

comment on column positions.source_extent is
    'How much the candidate published on this issue AT THE SOURCE — not how long our quote is, and not a judgment of quality. Sizes (one sentence / a few sentences / several paragraphs / a page or more) are only valid where the candidate chose the length themselves, i.e. their own website or written submission. Anything reported by a journalist or spoken at a meeting gets "reported remarks" or "remarks at a public meeting", because the length there was not the candidate''s choice. NULL means we have not recorded it, and the site shows nothing.';

-- ---------------------------------------------------------------------
-- The view carries it through.
--
-- APPENDED AT THE END, as always. CREATE OR REPLACE VIEW can only add
-- columns to the end; inserting one in the middle makes Postgres read it
-- as a rename of whatever column already sits at that position. Column
-- order is irrelevant to the app — supabase-js keys objects by name.
-- ---------------------------------------------------------------------
create or replace view public_positions as
select p.id, p.candidate_id, p.issue_id,
       p.summary_short, p.summary_bullets,
       p.verbatim_quote, p.source_url, p.source_title, p.source_type, p.source_date,
       p.no_public_position, p.reviewed_at,
       i.name as issue_name, i.slug as issue_slug, i.sort_order as issue_sort,
       p.is_conflicting,
       p.source_extent
from   positions p
join   issues i on i.id = p.issue_id
where  p.status = 'published';

-- ---------------------------------------------------------------------
-- POPULATE 1 — everything sourced from a journalist or a meeting.
-- No judgment required, so this is a blanket update rather than a list.
-- ---------------------------------------------------------------------
update positions
set    source_extent = 'reported remarks'
where  source_type = 'local_news'
  and  source_extent is null;

update positions
set    source_extent = 'remarks at a public meeting'
where  source_type = 'all_candidates_meeting'
  and  source_extent is null;

-- ---------------------------------------------------------------------
-- POPULATE 2 — the two candidates whose sites I have read end to end.
-- Set by hand, per row, against the actual page.
-- ---------------------------------------------------------------------
update positions p
set    source_extent = v.extent
from  (values
        -- Rylind Davis. Six platform pages, each a real page of its own.
        ('rylind-davis', 'roads-and-infrastructure', 'a page or more'),
        ('rylind-davis', 'how-council-works',        'a page or more'),
        ('rylind-davis', 'housing',                  'a page or more'),
        ('rylind-davis', 'parks-and-trails',         'a page or more'),
        ('rylind-davis', 'emergency-services',       'a page or more'),
        ('rylind-davis', 'transit',                  'a page or more'),
        ('rylind-davis', 'taxes-and-spending',       'several paragraphs'),
        ('rylind-davis', 'growth-and-development',   'several paragraphs'),

        -- Geordie Sabbagh. Three plan pages plus a biography page. The
        -- Future Ready page covers five issues between them, so most of
        -- his are a paragraph or less — which is the whole point of
        -- recording this.
        ('geordie-sabbagh', 'taxes-and-spending',      'a page or more'),
        ('geordie-sabbagh', 'how-council-works',       'several paragraphs'),
        ('geordie-sabbagh', 'economy-and-downtown',    'several paragraphs'),
        ('geordie-sabbagh', 'growth-and-development',  'a few sentences'),
        ('geordie-sabbagh', 'housing',                 'a few sentences'),
        ('geordie-sabbagh', 'district-table',          'a few sentences'),
        ('geordie-sabbagh', 'healthcare-and-hospital', 'one sentence'),
        ('geordie-sabbagh', 'parks-and-trails',        'one sentence')
      ) as v(cand_slug, issue_slug, extent)
where  p.candidate_id = (select id from candidates where slug = v.cand_slug)
  and  p.issue_id = (select i.id from issues i
                     join municipalities m on m.id = i.municipality_id
                     where m.slug = 'huntsville' and i.slug = v.issue_slug)
  and  p.source_type = 'candidate_website';

-- Sabbagh has two emergency-services rows from two different pages, so
-- they are set individually by source rather than by issue.
update positions
set    source_extent = 'a few sentences'
where  candidate_id = (select id from candidates where slug = 'geordie-sabbagh')
  and  source_url in ('https://yourneighbourgeordie.ca/meetgeordie',
                      'https://yourneighbourgeordie.ca/huntsville-strong')
  and  source_extent is null;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'rows with an extent recorded' as "Check",
       count(*) filter (where source_extent is not null)::text || ' of '
       || count(*)::text || ' positions' as "Result"
from   positions
union all
select 'no size claim on a journalist''s words',
       case when not exists (
         select 1 from positions
         where source_type in ('local_news','all_candidates_meeting')
           and source_extent in ('one sentence','a few sentences',
                                 'several paragraphs','a page or more')
       ) then 'PASS — news never gets a size' else 'FAIL — a news row has a size' end
union all
select 'no reported-remarks label on a candidate''s own website',
       case when not exists (
         select 1 from positions
         where source_type = 'candidate_website'
           and source_extent in ('reported remarks','remarks at a public meeting')
       ) then 'PASS' else 'FAIL' end
union all
select 'Sabbagh rows with an extent',
       count(*) filter (where source_extent is not null)::text || ' of ' || count(*)::text
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'geordie-sabbagh'
union all
select 'Davis rows with an extent',
       count(*) filter (where source_extent is not null)::text || ' of ' || count(*)::text
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'rylind-davis'
union all
select 'still to do — published rows with no extent',
       count(*)::text || ' rows'
from   positions
where  status = 'published' and source_extent is null;

-- ---------------------------------------------------------------------
-- WHAT IS NOT DONE YET — READ BEFORE LAUNCH
--
-- The 47 batch-1 positions, which are the ones currently live, mostly
-- still have source_extent NULL. Those came from eight campaign websites
-- read in an earlier session, and I will not assign a size from memory —
-- guessing here would be inventing a fact about a candidate, which is the
-- one thing this site does not do.
--
-- A NULL renders as nothing at all, so the site is correct today: some
-- cells carry a bracket, most do not, and nobody is ranked. But leaving it
-- half-done into launch is untidy, and a reader may wonder why one
-- candidate's cell is annotated and another's is not.
--
-- To finish it, these eight sites need one more read, specifically noting
-- how much each devotes to each issue:
--   Dan Armour, Dan Caswell, Bob Stone, Leland Maw,
--   Louisa Chiaramonte, Tyler Ellis, Michael Ankenmann, Kirsty Koop
-- Three of them keep their platforms on a sub-page I have not opened:
--   caswellformayor.ca/mypriorities
--   michaelankenmann.ca/platform
--   kirstyforbrunel.ca/priorities
--
-- ALSO STILL TO DO: the admin review screen has no field for this yet, so
-- new positions cannot be given an extent without SQL. That should be
-- added before the next batch of research, or the column will quietly
-- stop being filled in.
-- ---------------------------------------------------------------------
