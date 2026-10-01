-- =====================================================================
-- 19_candidate_response_review.sql
--
-- Two things, both for the review queue's new response cards and the
-- /admin/import page:
--
-- 1. Consolidate the candidate_responses schema into the repo. The table was
--    created by ~/workspace/smartervote-sweep/migration-responses.sql, run
--    directly in the SQL editor on 2026-09-28 and never committed here.
--    Everything below is IF NOT EXISTS / OR REPLACE / DROP IF EXISTS, so on
--    the live database it changes nothing except part 2. (Data rows are NOT
--    included — Ellis, Sabbagh and Reain are already live.)
--
-- 2. Add 'draft' to candidate_responses.status, so the queue can reject a
--    response the same way it rejects a position. Without this,
--    rejectResponseAction fails on the check constraint — which is the safe
--    direction to fail in, but not the useful one.
--
-- Run in the Supabase SQL editor BEFORE deploying the admin changes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. candidate_responses — the full, unedited reply behind every
--    candidate_submission position row.
-- ---------------------------------------------------------------------
create table if not exists candidate_responses (
    id           uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    received_at  date not null,
    status       text not null default 'in_review'
                 check (status in ('draft','in_review','published')),
    subject      text,
    body_text    text not null,
    -- [{heading, anchor, issue_slug|null}] — headings are exact lines from
    -- body_text; anchors are resp-<candidate-slug>-<slugified-heading> and
    -- must match what the frontend generates for deep links.
    sections     jsonb not null default '[]'::jsonb,
    reviewed_by  text,
    reviewed_at  timestamptz,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create or replace view public_candidate_responses as
select id, candidate_id, received_at, subject, body_text, sections
from   candidate_responses
where  status = 'published';

alter table candidate_responses enable row level security;
drop policy if exists candidate_responses_public_read on candidate_responses;
create policy candidate_responses_public_read on candidate_responses
    for select to anon, authenticated
    using (status = 'published');

drop trigger if exists candidate_responses_set_updated_at on candidate_responses;
create trigger candidate_responses_set_updated_at
    before update on candidate_responses
    for each row execute function set_updated_at();

create index if not exists idx_candidate_responses_candidate on candidate_responses (candidate_id);
create index if not exists idx_candidate_responses_status    on candidate_responses (status);

-- ---------------------------------------------------------------------
-- 2. 'draft' status for rejected responses.
--
-- On the live database the table already exists with the old two-value
-- check, so widen it. On a fresh database the CREATE above already has
-- the three-value check and these two lines are no-ops.
-- ---------------------------------------------------------------------
alter table candidate_responses drop constraint if exists candidate_responses_status_check;
alter table candidate_responses add constraint candidate_responses_status_check
    check (status in ('draft','in_review','published'));
