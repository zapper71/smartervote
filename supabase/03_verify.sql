-- =====================================================================
-- SmarterVote.ca — verification
-- Run this LAST, after 01_schema.sql and 02_seed.sql.
--
-- This is ONE query on purpose. The Supabase SQL Editor only shows the
-- result of the last statement it runs, so a file with several SELECTs
-- would hide most of its own output.
--
-- Every row should say PASS or ok. Anything else, send me the table.
-- =====================================================================

with checks as (
    select 1 as ord, 'Municipalities'             as check_name, count(*)::int as actual, 1  as expected from municipalities
    union all select  2, 'Races',                       count(*)::int, 9  from races
    union all select  3, 'Wards',                       count(*)::int, 6  from wards
    union all select  4, 'Candidate rows (all)',        count(*)::int, 29 from candidates
    union all select  5, 'Running (not withdrawn)',     count(*)::int, 28 from candidates where status <> 'withdrawn'
    union all select  6, 'Withdrawn',                   count(*)::int, 1  from candidates where status =  'withdrawn'
    union all select  7, 'Acclaimed',                   count(*)::int, 2  from candidates where status =  'acclaimed'
    union all select  8, 'Council seats on ballot',     coalesce(sum(seats),0)::int, 9 from races where race_type <> 'school_board'
    union all select  9, 'Races decided by acclamation',count(*)::int, 2  from races where is_acclaimed
    union all select 10, 'Candidates with a website',   count(*)::int, 10 from candidates where website is not null
    union all select 11, 'Wards linked to a race',      count(*)::int, 6  from wards where race_id is not null
    union all select 12, 'Candidates with no race',     count(*)::int, 0  from candidates where race_id is null
),
per_race as (
    select 100 + r.sort_order as ord,
           'Race: ' || r.name as check_name,
           count(c.id) filter (where c.status <> 'withdrawn')::int as actual,
           r.seats as expected
    from   races r
    left join candidates c on c.race_id = r.id
    group by r.id, r.sort_order, r.name, r.seats
),
all_rows as (
    select * from checks
    union all
    select * from per_race
)
select check_name                                   as "Check",
       actual                                       as "Actual",
       expected                                     as "Expected",
       case
         when ord < 100 then
              case when actual = expected then 'PASS' else 'FAIL — investigate' end
         when actual = 0 then 'FAIL — no candidates seeded'
         when actual <  expected then 'CHECK — fewer candidates than seats'
         when actual =  expected then 'ok — acclaimed / uncontested'
         else 'ok — ' || actual || ' running for ' || expected || ' seat(s)'
       end                                          as "Result"
from   all_rows
order  by ord;
