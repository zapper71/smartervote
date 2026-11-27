-- Migration 54: expose the multilingual locale columns on public_positions.
-- Run in the Supabase SQL editor.
--
-- WHY THIS EXISTS
-- Migration 52 added summary_locale + verbatim_quote_locale to the
-- positions table, but the site reads positions through the
-- public_positions VIEW — and that view has an explicit column list,
-- last defined in migration 22, which does not include the two new
-- columns. A view never picks up columns added to its table later.
-- So the app never saw the locale flags at all: every quote read as
-- English, and every French-native quote rendered on a French page
-- with a wrong "(en anglais)" tag (152 of them on the Rosemont
-- compare page), while on English pages the French quotes never got
-- their English translation + "Show original quote" toggle. The
-- locale flags in the table itself are correct (the Nov 27 verify
-- showed 89 French quote flags, as expected) — only the view hid them.
-- This recreates the view with the two columns added AT THE END of
-- the column list: CREATE OR REPLACE VIEW matches columns by
-- position, so inserting new columns in the middle renames the ones
-- after them (Postgres error 42P16). Everything else is byte-identical
-- to the migration-22 definition.

create or replace view public_positions as
select p.id, p.candidate_id, p.issue_id,
       p.summary_short, p.summary_bullets,
       p.verbatim_quote, p.source_url, p.source_title, p.source_type, p.source_date,
       p.no_public_position, p.reviewed_at,
       i.name as issue_name, i.slug as issue_slug, i.sort_order as issue_sort,
       p.is_conflicting,
       p.source_extent,
       p.confidence,
       p.summary_locale, p.verbatim_quote_locale
from   positions p
join   issues i on i.id = p.issue_id
where  p.status = 'published';

-- The view keeps its existing grants under CREATE OR REPLACE, but
-- state the public read explicitly so it holds either way.
grant select on public.public_positions to anon, authenticated;

-- Verify: the view now exposes the locale columns (expect 2 rows).
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'public_positions'
  and column_name in ('summary_locale', 'verbatim_quote_locale')
order by column_name;
