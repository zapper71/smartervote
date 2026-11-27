-- =====================================================================
-- SmarterVote — migration 52: multilingual infrastructure
--
-- Table-driven languages (Andreas, 2026-11-27): English + French first,
-- designed so a third language is data, not code. One `languages` table
-- drives the switcher; one `translations` table holds everything
-- translatable. Adding a language = one row in `languages` + a
-- translation run.
--
-- Translation rows are keyed by STABLE NATURAL KEYS, not uuids, so
-- translation SQL can be generated from the content files without
-- database access:
--   candidate_bio      -> candidate slug            e.g. 'rosemont-la-petite-patrie-fang-hu'
--   position_summary   -> 'candidate-slug:issue-slug' (field 'summary_short' | 'summary_bullets')
--   verbatim_quote     -> 'candidate-slug:issue-slug'
--   issue_name / issue_question -> 'municipality-slug:issue-slug'
--   ui_string          -> the string key, e.g. 'nav.find_your_riding'
--
-- The asterisk rule (Andreas, 2026-11-27): a rendered string gets `*`
-- exactly when it came from a translations row with origin='ai' and no
-- human review. A reviewed translation renders clean. ui_string rows
-- never render an asterisk (interface, not content); their origin is
-- tracked in the table for the record.
--
-- Run in the Supabase SQL editor BEFORE the translations file.
-- VERIFY at the end expects: 2 languages, 0 translations (rows land later).
-- =====================================================================

create table if not exists languages (
    code         text primary key,  -- BCP 47: 'en', 'fr', ...
    name         text not null,     -- English name: 'English', 'French'
    native_name  text not null,     -- 'English', 'Français'
    flag_asset   text,              -- e.g. 'flags/union-jack.svg'
    is_default   boolean not null default false,
    is_enabled   boolean not null default true,
    sort_order   int not null default 0,
    created_at   timestamptz not null default now()
);

-- Exactly one default language.
create unique index if not exists languages_one_default
    on languages (is_default) where is_default;

create table if not exists translations (
    id             uuid primary key default gen_random_uuid(),
    entity_type    text not null check (entity_type in
                       ('candidate_bio', 'position_summary',
                        'verbatim_quote', 'issue_name', 'issue_question',
                        'ui_string')),
    entity_id      text not null,   -- stable natural key, see header
    field          text not null default '',
    locale         text not null references languages (code),
    text           text not null,   -- JSON array string for bullets
    origin         text not null default 'ai' check (origin in ('ai', 'human')),
    reviewed_by    text,
    reviewed_at    timestamptz,
    source_hash    text,            -- hash of the source text this was translated from
    is_stale       boolean not null default false,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now(),
    unique (entity_type, entity_id, field, locale)
);

create index if not exists translations_lookup
    on translations (entity_type, entity_id, locale);

-- Native-language tags, so the renderer knows what is native and what
-- needs a translation row. Defaults 'en'; French-written content gets
-- 'fr' set by the translation files.
alter table candidates add column if not exists bio_locale text not null default 'en';
alter table positions add column if not exists summary_locale text not null default 'en';
alter table positions add column if not exists verbatim_quote_locale text not null default 'en';
alter table issues add column if not exists name_locale text not null default 'en';

-- Seed: English (default) + French. Flags are local SVGs under public/flags/.
insert into languages (code, name, native_name, flag_asset, is_default, is_enabled, sort_order)
values
    ('en', 'English', 'English', 'flags/union-jack.svg', true, true, 1),
    ('fr', 'French', 'Français', 'flags/quebec.svg', false, true, 2)
on conflict (code) do nothing;

-- VERIFY — expect exactly 2 rows (en + fr) and 0 translation rows.
select code, name, native_name, is_default, is_enabled from languages order by sort_order;
select count(*) as translation_rows from translations;
