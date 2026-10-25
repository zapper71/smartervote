-- =====================================================================
-- OPTIONAL — flag acclaimed candidates as winners (UNOFFICIAL)
--
-- *** NOT part of migration 41. Do NOT run as part of the migration
-- *** sequence. Andreas reviews and runs this separately, only if he
-- *** wants acclaimed candidates badged before election night.
--
-- Acclaimed candidates (candidates.status = 'acclaimed') have already
-- won their seat — no ballot will be held. This flags them is_winner
-- with result_status = 'unofficial' (amber "Elected — unofficial
-- result") because no certified result document exists yet; the status
-- can be flipped to 'official' per candidate once the municipality /
-- Elections BC publishes its official results list.
--
-- REQUIRES migration 41 (41_winner_results.sql) to have run first.
-- Idempotent: re-running only touches acclaimed rows not yet flagged.
-- =====================================================================

update candidates
set    is_winner     = true,
       result_status = 'unofficial',
       result_source = 'Acclaimed — no opposing candidate filed (candidates.status = ''acclaimed'')'
where  status = 'acclaimed'
and    is_winner = false;

-- VERIFICATION: how many acclaimed candidates were flagged.
select 'acclaimed winners flagged' as check_name, count(*) as n
from candidates
where status = 'acclaimed' and is_winner;

select name, slug, result_status
from candidates
where status = 'acclaimed' and is_winner
order by name
limit 20;
