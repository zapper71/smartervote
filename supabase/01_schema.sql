-- =====================================================================
-- SmarterVote.ca — database schema
-- Target: Supabase Postgres
-- Scope:  Huntsville 2026 municipal pilot, built to extend to other
--         municipalities and later to provincial/federal levels.
--
-- Run this FIRST, then 02_seed.sql.
-- Paste into the Supabase SQL Editor and run. Safe to re-run: every
-- object uses IF NOT EXISTS or is dropped-and-recreated explicitly.
-- =====================================================================

-- Supabase already has pgcrypto for gen_random_uuid(); this is a no-op
-- on a fresh project but makes the file portable to plain Postgres.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- MUNICIPALITIES
-- One row for the pilot. Adding Bracebridge later is one INSERT.
-- ---------------------------------------------------------------------
create table if not exists municipalities (
    id                   uuid primary key default gen_random_uuid(),
    name                 text        not null,
    slug                 text        not null unique,
    province             text        not null default 'ON',
    upper_tier           text,                 -- 'District Municipality of Muskoka'
    election_date        date,
    advance_voting_opens date,
    voting_method        text,                 -- 'Internet and telephone'
    official_url         text,
    coverage_status      text        not null default 'live'
                         check (coverage_status in ('live','partial','none')),
    created_at           timestamptz not null default now()
);

comment on table  municipalities is 'One row per municipality covered by the site.';
comment on column municipalities.coverage_status is 'Drives the public coverage badge. Be honest: partial means partial.';

-- ---------------------------------------------------------------------
-- RACES
-- A contest for one or more seats. Mayor, at-large council, a ward
-- council seat, or a school board trustee seat.
-- ---------------------------------------------------------------------
create table if not exists races (
    id               uuid primary key default gen_random_uuid(),
    municipality_id  uuid not null references municipalities(id) on delete cascade,
    name             text not null,
    slug             text not null,
    race_type        text not null
                     check (race_type in ('mayor','council_at_large','council_ward','school_board')),
    seats            int  not null check (seats > 0),
    ward_group_label text,          -- 'Wards 1 & 2 (Huntsville & Chaffey)'
    description      text,
    is_acclaimed     boolean not null default false,
    sort_order       int  not null default 0,
    created_at       timestamptz not null default now(),
    unique (municipality_id, slug)
);

comment on column races.seats        is 'How many people get elected. Two seats from six candidates is a very different decision than one from six — say so on the page.';
comment on column races.is_acclaimed is 'True when candidates <= seats. Surface this prominently: "no contest" is useful civic information, not an empty page.';

-- ---------------------------------------------------------------------
-- WARDS
-- Huntsville has six geographic wards grouped into three ward races.
-- Kept separate from races so the grouping can change without data loss.
-- ---------------------------------------------------------------------
create table if not exists wards (
    id              uuid primary key default gen_random_uuid(),
    municipality_id uuid not null references municipalities(id) on delete cascade,
    number          int,
    name            text not null,
    race_id         uuid references races(id) on delete set null,
    unique (municipality_id, number)
);

comment on column wards.race_id is 'Which ward race the electors of this ward actually vote in.';

-- ---------------------------------------------------------------------
-- CANDIDATES
-- NOTE: qualifying home addresses are deliberately NOT stored. The Town
-- publishes them; republishing them serves no voter purpose.
-- ---------------------------------------------------------------------
create table if not exists candidates (
    id               uuid primary key default gen_random_uuid(),
    race_id          uuid not null references races(id) on delete cascade,
    name             text not null,
    slug             text not null,
    status           text not null default 'certified'
                     check (status in ('certified','withdrawn','acclaimed')),
    email            text,
    phone            text,
    website          text,
    socials          jsonb not null default '{}'::jsonb,
    photo_url        text,
    bio              text,
    incumbent        boolean not null default false,
    source_url       text,
    last_reviewed_at timestamptz,
    created_at       timestamptz not null default now(),
    unique (race_id, slug)
);

comment on table  candidates is 'Certified candidates. Withdrawn candidates are retained for an honest record but filtered from public views.';
comment on column candidates.socials is 'e.g. {"facebook":"...","instagram":"...","x":"..."}';

-- ---------------------------------------------------------------------
-- ISSUES  — the editorial spine
-- Every candidate is described against this same list, or comparison is
-- meaningless. Municipality-scoped because municipal issues are local.
-- ---------------------------------------------------------------------
create table if not exists issues (
    id              uuid primary key default gen_random_uuid(),
    municipality_id uuid not null references municipalities(id) on delete cascade,
    name            text not null,
    slug            text not null,
    description     text,
    voter_question  text,   -- the plain-language question this issue answers
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    unique (municipality_id, slug)
);

comment on column issues.voter_question is 'What a voter actually wants to know, in their words. Shown as the section heading.';

-- ---------------------------------------------------------------------
-- POSITIONS — candidate x issue
-- Nothing reaches the public without status='published', which only
-- happens after human review.
-- ---------------------------------------------------------------------
create table if not exists positions (
    id                 uuid primary key default gen_random_uuid(),
    candidate_id       uuid not null references candidates(id) on delete cascade,
    issue_id           uuid not null references issues(id) on delete cascade,

    summary_short      text,          -- <= ~140 chars, the accordion headline
    summary_bullets    jsonb,         -- ["...", "...", "..."]

    -- Provenance. A position without a source does not get published.
    verbatim_quote     text,
    source_url         text,
    source_title       text,          -- 'Huntsville Doppler' / candidate website
    source_type        text check (source_type in
                       ('candidate_website','candidate_social','local_news','all_candidates_meeting','candidate_submission')),
    source_date        date,

    -- An explicit, honest "we could not find one" beats a blank space.
    no_public_position boolean not null default false,

    status             text not null default 'draft'
                       check (status in ('draft','in_review','published','disputed')),
    model_confidence   numeric(3,2) check (model_confidence between 0 and 1),
    reviewed_by        text,
    reviewed_at        timestamptz,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now(),

    unique (candidate_id, issue_id),

    -- Enforce the editorial rule in the database, not just in policy:
    -- a published position must either cite a source or say plainly
    -- that no public position was found.
    constraint published_needs_source check (
        status <> 'published'
        or no_public_position = true
        or (source_url is not null and verbatim_quote is not null)
    )
);

-- NOTE on the published_needs_source constraint above:
-- This is the neutrality guarantee, enforced in SQL rather than in policy.
-- You cannot publish an unsourced characterisation of what a candidate
-- believes. Either cite a quote and a URL, or set no_public_position = true
-- and say plainly on the page that none was found. There is no third option,
-- and that is deliberate — a tired reviewer at 11pm cannot accidentally
-- create one.

-- ---------------------------------------------------------------------
-- CORRECTIONS — public submissions, reviewed by you, then applied
-- ---------------------------------------------------------------------
create table if not exists corrections (
    id                uuid primary key default gen_random_uuid(),
    candidate_id      uuid references candidates(id) on delete set null,
    position_id       uuid references positions(id)  on delete set null,
    submitted_by_name  text,
    submitted_by_email text,
    is_candidate      boolean not null default false,
    claim             text not null,
    proposed_text     text,
    supporting_url    text,
    status            text not null default 'new'
                      check (status in ('new','accepted','rejected','needs_info')),
    resolution_note   text,
    published_in_log  boolean not null default false,
    submitted_at      timestamptz not null default now(),
    resolved_at       timestamptz
);

comment on table corrections is 'Every correction is logged, resolved or not. The public log is what makes the neutrality claim checkable.';

-- ---------------------------------------------------------------------
-- PAGE VIEWS — anonymous aggregate only
-- No IP, no cookie, no session id, no address. A counter, by hour.
-- ---------------------------------------------------------------------
create table if not exists page_views (
    id             bigserial primary key,
    path           text        not null,
    race_slug      text,
    candidate_slug text,
    ward_number    int,
    viewed_hour    timestamptz not null,
    view_count     int         not null default 1,
    unique (path, viewed_hour)
);

comment on table page_views is 'Anonymous aggregate counts. Deliberately contains nothing that could identify a person.';

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
create index if not exists idx_races_municipality   on races (municipality_id, sort_order);
create index if not exists idx_candidates_race      on candidates (race_id);
create index if not exists idx_candidates_status    on candidates (status);
create index if not exists idx_positions_candidate  on positions (candidate_id);
create index if not exists idx_positions_issue      on positions (issue_id);
create index if not exists idx_positions_status     on positions (status);
create index if not exists idx_corrections_status   on corrections (status, submitted_at desc);
create index if not exists idx_page_views_hour      on page_views (viewed_hour desc);

-- ---------------------------------------------------------------------
-- updated_at trigger on positions
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists positions_set_updated_at on positions;
create trigger positions_set_updated_at
    before update on positions
    for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- PUBLIC VIEWS
-- The site reads these, never the base tables. Withdrawn candidates and
-- unpublished positions cannot leak into a page by accident.
-- ---------------------------------------------------------------------
create or replace view public_candidates as
select c.id, c.race_id, c.name, c.slug, c.status, c.website, c.socials,
       c.photo_url, c.bio, c.incumbent, c.last_reviewed_at,
       r.slug as race_slug, r.name as race_name, r.race_type, r.seats,
       m.slug as municipality_slug
from   candidates c
join   races r          on r.id = c.race_id
join   municipalities m on m.id = r.municipality_id
where  c.status <> 'withdrawn';

create or replace view public_positions as
select p.id, p.candidate_id, p.issue_id,
       p.summary_short, p.summary_bullets,
       p.verbatim_quote, p.source_url, p.source_title, p.source_type, p.source_date,
       p.no_public_position, p.reviewed_at,
       i.name as issue_name, i.slug as issue_slug, i.sort_order as issue_sort
from   positions p
join   issues i on i.id = p.issue_id
where  p.status = 'published';

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Anonymous visitors: read reference data, insert a correction, nothing else.
-- All writes to content happen with the service role key, server-side.
-- ---------------------------------------------------------------------
alter table municipalities enable row level security;
alter table races          enable row level security;
alter table wards          enable row level security;
alter table candidates     enable row level security;
alter table issues         enable row level security;
alter table positions      enable row level security;
alter table corrections    enable row level security;
alter table page_views     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['municipalities','races','wards','issues'] loop
    execute format('drop policy if exists %I on %I', t || '_public_read', t);
    execute format('create policy %I on %I for select to anon, authenticated using (true)',
                   t || '_public_read', t);
  end loop;
end $$;

drop policy if exists candidates_public_read on candidates;
create policy candidates_public_read on candidates
    for select to anon, authenticated
    using (status <> 'withdrawn');

drop policy if exists positions_public_read on positions;
create policy positions_public_read on positions
    for select to anon, authenticated
    using (status = 'published');

-- Anyone may submit a correction. Nobody may read the queue but you.
drop policy if exists corrections_public_insert on corrections;
create policy corrections_public_insert on corrections
    for insert to anon, authenticated
    with check (true);

-- page_views: no anon policy at all. Writes go through a server route
-- using the service role key, so the counter cannot be inflated directly.

-- =====================================================================
-- Done. Next: run 02_seed.sql.
-- =====================================================================
