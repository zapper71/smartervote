-- =====================================================================
-- SmarterVote.ca — Huntsville issue-slug rename to the final 18-slug taxonomy
--
-- DRAFT, committed 2026-10-17. Andreas to run when he chooses; nothing else
-- here runs or publishes.
--
-- WHAT THIS DOES
-- Huntsville's issue rows were created with the old taxonomy (migrations
-- 04_issues.sql, 09_two_more_issues.sql, 16_social_and_school_board.sql).
-- The rest of the site now uses the final taxonomy (migration 28). This
-- migration renames Huntsville's four remaining old slugs to their final
-- equivalents, scoped to Huntsville only. The other eleven Huntsville slugs
-- already match the final taxonomy and are untouched.
--
-- KEYING (verified against 01_schema.sql)
-- issues is MUNICIPALITY-scoped: unique (municipality_id, slug). Huntsville
-- holds ONE row per slug, and positions reference issues by issue_id. So a
-- rename is a simple UPDATE of the one row — no position rewrites, no
-- orphan risk. No FOLDS were needed: none of the expansion fold slugs
-- (short-term-rentals, policing, community-safety, electoral-reform,
-- agriculture, auto-insurance, connectivity, waste-services,
-- community-services, food-security, addictions-and-recovery,
-- ai-data-centres, homelessness-and-encampments, water-and-waste,
-- data-centres) exist as Huntsville issue rows — verified by grepping all
-- migrations. The 15 Huntsville slugs are: taxes-and-spending,
-- roads-and-infrastructure, how-council-works, growth-and-development,
-- housing, healthcare-and-hospital, environment, district-table,
-- economy-and-downtown, parks-and-trails, emergency-services, transit,
-- school-services, trustee-role, student-wellbeing.
--
-- RENAME TABLE (old -> new, plus display label from migration 28)
--   how-council-works     -> government            'Government'
--   healthcare-and-hospital -> healthcare          'Healthcare'
--   economy-and-downtown  -> economy               'Economy'
--   parks-and-trails      -> active-transportation 'Active transportation'
-- Only slug and name change. voter_question, description and sort_order keep
-- Huntsville's own wording/order, so nothing shifts underneath the published
-- content beyond the label.
--
-- UNMAPPED — left untouched, need Andreas's decision:
--   district-table   Huntsville's two-tier District governance issue. No
--                    equivalent slug in the final taxonomy.
--   school-services  Huntsville trustee issue (programs, busing, before/
--                    after-school care). The final taxonomy has trustee-role
--                    and student-wellbeing but nothing covering "services".
--                    Renaming this to either would mislabel published rows,
--                    so it is left alone deliberately.
--
-- IDEMPOTENT: each UPDATE matches the OLD slug, so re-running is a no-op.
-- Wrapped in begin/commit like the other migrations.
-- =====================================================================

begin;

with m as (select id from municipalities where slug = 'huntsville')
update issues i set
    slug = v.new_slug,
    name = v.new_name
from (values
    ('how-council-works',      'government',            'Government'),
    ('healthcare-and-hospital','healthcare',            'Healthcare'),
    ('economy-and-downtown',   'economy',               'Economy'),
    ('parks-and-trails',       'active-transportation', 'Active transportation')
) as v(old_slug, new_slug, new_name)
where i.municipality_id = m.id
  and i.slug = v.old_slug;

commit;

-- ---------------------------------------------------------------------
-- VERIFY — expect: 15 Huntsville issues, 4 renamed slugs present, the 2
-- UNMAPPED slugs still present, and zero orphaned positions.
-- ---------------------------------------------------------------------
select i.sort_order as "#",
       i.slug,
       i.name,
       i.applies_to
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug = 'huntsville'
order by i.sort_order;

-- expect 0 rows: every position still points at an existing issue
select count(*) as orphaned_positions
from positions p
left join issues i on i.id = p.issue_id
where i.id is null;
