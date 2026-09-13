-- =====================================================================
-- SmarterVote.ca — health check
--
-- Paste the whole thing into the Supabase SQL editor and run it. It
-- changes nothing. Every row should say PASS.
--
-- This is not tied to any one migration — run it any time you want to
-- know the state of the data, especially after running files out of order
-- or re-running one you weren't sure about.
--
-- WHAT "EXPECTED" ASSUMES: files 01 through 13 have all been run, and
-- batch 2 has NOT yet been approved in /admin. If you have already
-- approved batch 2, checks 5 and 6 will move from in_review to published
-- and that is correct, not a failure.
-- =====================================================================

select * from (

-- ---- Structure -------------------------------------------------------
select 1 as n, 'source_extent column exists' as "Check",
       case when exists (select 1 from information_schema.columns
                         where table_name = 'positions' and column_name = 'source_extent')
            then 'yes' else 'NO' end as "Found",
       case when exists (select 1 from information_schema.columns
                         where table_name = 'positions' and column_name = 'source_extent')
            then 'PASS' else 'FAIL — run 11_source_extent.sql' end as "Verdict"

union all
select 2, 'issues loaded (municipal / school board)',
       (select count(*)::text from issues i
        join municipalities m on m.id = i.municipality_id
        where m.slug = 'huntsville' and i.applies_to = 'municipal') || ' / ' ||
       (select count(*)::text from issues i
        join municipalities m on m.id = i.municipality_id
        where m.slug = 'huntsville' and i.applies_to = 'school_board'),
       case when (select count(*) from issues i
                  join municipalities m on m.id = i.municipality_id
                  where m.slug = 'huntsville' and i.applies_to = 'municipal') = 12
             and (select count(*) from issues i
                  join municipalities m on m.id = i.municipality_id
                  where m.slug = 'huntsville' and i.applies_to = 'school_board') = 3
            then 'PASS — expect 12 / 3' else 'CHECK — run 09 and 16' end

union all
select 3, 'the two newest issues sit last',
       coalesce((select string_agg(i.slug || ' #' || i.sort_order, ', ' order by i.sort_order)
                 from issues i join municipalities m on m.id = i.municipality_id
                 where m.slug = 'huntsville' and i.slug in ('emergency-services','transit')), 'missing'),
       case when (select min(i.sort_order) from issues i
                  join municipalities m on m.id = i.municipality_id
                  where m.slug = 'huntsville' and i.slug in ('emergency-services','transit')) = 11
            then 'PASS' else 'FAIL' end

-- ---- Positions -------------------------------------------------------
union all
select 4, 'total positions',
       (select count(*)::text from positions),
       case when (select count(*) from positions) = 111
            then 'PASS — expect 111 (47 + 41 + 3 + 8 + 9 + 3)'
            else 'CHECK — expected 111' end

union all
select 5, 'published (batch 1, live on the site)',
       (select count(*)::text from positions p where p.status = 'published'),
       case when (select count(*) from positions p where p.status = 'published') >= 47
            then 'PASS' else 'FAIL' end

union all
select 6, 'awaiting approval in /admin',
       (select count(*)::text from positions p where p.status = 'in_review'),
       case when (select count(*) from positions p where p.status = 'in_review') = 64
            then 'PASS — expect 64 (41 from 08, 3 from 10, 8 from 14, 9 from 15, 3 from 16)'
            when (select count(*) from positions p where p.status = 'in_review') = 0
            then 'all approved already'
            else 'CHECK — expected 64 before you start approving' end

union all
select 7, 'every position resolved to a candidate and an issue',
       (select count(*)::text from positions p
        where p.candidate_id is null or p.issue_id is null) || ' orphaned',
       case when not exists (select 1 from positions p
                             where p.candidate_id is null or p.issue_id is null)
            then 'PASS' else 'FAIL — a slug did not match' end

union all
select 8, 'candidates with at least one position',
       (select count(distinct p.candidate_id)::text from positions p),
       case when (select count(distinct p.candidate_id) from positions p) = 18
            then 'PASS — expect 18 of 28' else 'CHECK — expected 18' end

union all
select 9, 'Sabbagh / Davis position counts (Ankenmann should be 11)',
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id
        where c.slug = 'geordie-sabbagh') || ' / ' ||
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id
        where c.slug = 'rylind-davis'),
       case when (select count(*) from positions p join candidates c on c.id = p.candidate_id
                  where c.slug = 'geordie-sabbagh') = 10
             and (select count(*) from positions p join candidates c on c.id = p.candidate_id
                  where c.slug = 'rylind-davis') = 8
            then 'PASS — expect 10 / 8' else 'CHECK — expected 10 / 8' end

-- ---- source_extent ---------------------------------------------------
union all
select 10, 'positions with no source_extent recorded',
       (select count(*)::text from positions p where p.source_extent is null),
       case when not exists (select 1 from positions p where p.source_extent is null)
            then 'PASS — all recorded'
            else 'CHECK — see the follow-up query below' end

union all
select 11, 'no length claimed on a journalist''s words',
       (select count(*)::text from positions p
        where p.source_type in ('local_news','all_candidates_meeting')
          and p.source_extent in ('one sentence','a few sentences',
                                  'several paragraphs','a page or more')) || ' bad rows',
       case when not exists (
              select 1 from positions p
              where p.source_type in ('local_news','all_candidates_meeting')
                and p.source_extent in ('one sentence','a few sentences',
                                        'several paragraphs','a page or more'))
            then 'PASS' else 'FAIL — this is the fairness rule' end

union all
select 12, 'spread of extents',
       coalesce((select string_agg(x.source_extent || ' ' || x.n, ' · ' order by x.n desc)
                 from (select p.source_extent, count(*)::text n from positions p
                       where p.source_extent is not null
                       group by p.source_extent) x), 'none set'),
       'for information'

-- ---- Links -----------------------------------------------------------
union all
select 13, 'candidates with verified social links',
       (select count(*)::text from candidates c where jsonb_array_length(c.verified_links) > 0),
       case when (select count(*) from candidates c
                  where jsonb_array_length(c.verified_links) > 0) = 9
            then 'PASS — expect 9' else 'CHECK — expected 9' end

union all
select 14, 'total verified links',
       (select coalesce(sum(jsonb_array_length(c.verified_links)), 0)::text from candidates c),
       case when (select coalesce(sum(jsonb_array_length(c.verified_links)), 0) from candidates c) = 18
            then 'PASS — expect 18' else 'CHECK — expected 18' end

union all
select 15, 'Koop kept BOTH links (09 run after 12 would eat one)',
       coalesce((select jsonb_array_length(c.verified_links)::text
                 from candidates c where c.slug = 'kirsty-koop'), '0'),
       case when coalesce((select jsonb_array_length(c.verified_links)
                           from candidates c where c.slug = 'kirsty-koop'), 0) = 2
            then 'PASS — Instagram + Facebook'
            else 'FAIL — re-run 12_facebook_links.sql' end

union all
select 16, 'no bare platform homepages stored as links',
       (select count(*)::text from candidates c, lateral jsonb_array_elements(c.verified_links) e
        where e->>'url' ~* '^https://(www\.)?(facebook|instagram|x|twitter|youtube|linkedin|tiktok)\.com/?$') || ' bad',
       case when not exists (
              select 1 from candidates c, lateral jsonb_array_elements(c.verified_links) e
              where e->>'url' ~* '^https://(www\.)?(facebook|instagram|x|twitter|youtube|linkedin|tiktok)\.com/?$')
            then 'PASS — the Maw template trap held' else 'FAIL' end

union all
select 17, 'every link records where it came from',
       (select count(*)::text from candidates c, lateral jsonb_array_elements(c.verified_links) e
        where coalesce(e->>'found_on','') = '') || ' missing found_on',
       case when not exists (
              select 1 from candidates c, lateral jsonb_array_elements(c.verified_links) e
              where coalesce(e->>'found_on','') = '')
            then 'PASS' else 'FAIL' end

-- ---- The rule that matters most --------------------------------------
union all
select 18, 'nothing published without a quote and a source',
       (select count(*)::text from positions p
        where p.status = 'published' and p.no_public_position = false
          and (p.verbatim_quote is null or p.source_url is null)) || ' violations',
       case when not exists (
              select 1 from positions p
              where p.status = 'published' and p.no_public_position = false
                and (p.verbatim_quote is null or p.source_url is null))
            then 'PASS' else 'FAIL — should be impossible' end

) checks order by n;

-- ---------------------------------------------------------------------
-- IF CHECK 10 IS NOT ZERO, run this to see exactly which rows are blank.
-- The most likely cause is running 11 before 10: the three Sabbagh
-- positions from 10 would not have existed yet, so 11 could not set them.
-- Re-running 11 fixes it.
--
--   select c.name, i.slug as issue, p.source_type, p.source_url
--   from   positions p
--   join   candidates c on c.id = p.candidate_id
--   join   issues i on i.id = p.issue_id
--   where  p.source_extent is null
--   order  by c.name, i.sort_order;
-- ---------------------------------------------------------------------
