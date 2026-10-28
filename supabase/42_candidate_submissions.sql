-- =============================================================
-- 42 — Candidate self-submissions (staging only)
--
-- The candidate input page (/races/<race>/<candidate>/input) lets a
-- roster candidate submit their own bio, website, socials, public email
-- and per-issue positions. Submissions land HERE and nowhere else:
-- nothing in this table is ever read by a public page, and the
-- published tables (candidates, positions, candidate_responses)
-- change only inside the /admin/submissions Approve action.
--
-- Verification model (decided Oct 28, 2026 — see the candidate input
-- page design doc):
--   * No token links are sent to candidates up front.
--   * On submit, a confirmation email is sent to the ROSTER address
--     (never the typed address) carrying a link to
--     /submissions/confirm?token=... . The submission stays
--     pending_confirmation until that link is clicked.
--   * Candidates with no roster email on file go straight to status
--     'new' with manual_verification = true: an out-of-band check by
--     Andreas at approval time is the only verification they get.
--   * A typed address matching the roster address is a SIGNAL, never
--     proof of control — the admin queue must never label it
--     "verified".
--
-- EMAIL TRANSPORT IS NOT IN THIS MIGRATION. The app holds no mail
-- credential and invents no provider: the confirmation email is sent
-- by a Muse-side Gmail-connector sweep that picks up
-- pending_confirmation rows with confirmation_sent_at IS NULL
-- (service-role read of this table joined to candidates for the
-- roster email), exactly like the approval notification drafts, which
-- Muse also creates via the Gmail connector. The sweep OWNS the
-- token lifecycle: it generates the raw token, stores its SHA-256
-- hash + expiry here, stamps confirmation_sent_at, and sends the
-- link — the app never sees a raw token, which is why the submit
-- action inserts pending_confirmation rows with a NULL token hash.
-- Until that sweep runs, a pending_confirmation row simply waits;
-- the confirm route still works the moment the email goes out.
--
-- NOTIFICATION DRAFTS. On approval the submission is marked
-- notification_status = 'pending'. Muse then drafts (never sends)
-- the "your updates are live" email from the Support address via the
-- Gmail connector and the row is flipped to 'drafted' with the draft
-- reference recorded, so a notification is never drafted twice.
--
-- RUN BY ANDREAS in the Supabase SQL editor. Idempotent: safe to
-- re-run (CREATE IF NOT EXISTS + DROP POLICY IF EXISTS guards).
-- =============================================================

create table if not exists candidate_submissions (
    id                uuid primary key default gen_random_uuid(),
    candidate_id      uuid not null references candidates(id) on delete cascade,

    -- Contact email typed by the submitter. PRIVATE: never displayed
    -- anywhere public, used only for the approval notification draft.
    contact_email     text not null,
    -- Public campaign email. Displayed below the candidate's name on
    -- race/compare/candidate pages once approved. Defaults to the
    -- roster email on the form; blank means "leave the current one".
    public_email      text,
    bio               text,
    website           text,
    -- {"facebook": "...", "instagram": "...", "x": "..."} — same shape
    -- as candidates.socials. Blank values mean "leave the current one".
    socials           jsonb not null default '{}'::jsonb,
    -- [{issue_slug, summary_short, summary_bullets, verbatim_quote}]
    positions         jsonb not null default '[]'::jsonb,

    status            text not null default 'pending_confirmation'
                      check (status in (
                        'pending_confirmation',
                        'new',
                        'approved',
                        'rejected'
                      )),

    -- SHA-256 hex of the confirmation token. The raw token appears
    -- only in the confirmation email link; the table never holds it.
    confirmation_token_hash text,
    confirmation_expires_at timestamptz,
    -- Stamped by the confirmation-email sweep when it sends (see header).
    -- NULL means the sweep has not picked this row up yet.
    confirmation_sent_at timestamptz,
    confirmed_at      timestamptz,
    -- True when the candidate has no roster email on file, so no
    -- confirmation email could be sent and approval needs an
    -- out-of-band check. Only such rows may skip confirmation.
    manual_verification boolean not null default false,

    notification_status text not null default 'pending'
                      check (notification_status in ('pending', 'drafted')),
    notification_draft_ref text,

    submitted_at      timestamptz not null default now(),
    reviewed_by       text,
    reviewed_at       timestamptz,
    review_note       text,
    -- [{issue_slug, reason}] — position rows skipped at approval
    -- because the candidate already has a published position on
    -- that issue (positions has unique(candidate_id, issue_id)).
    skipped_positions jsonb not null default '[]'::jsonb
);

create index if not exists candidate_submissions_candidate_idx
    on candidate_submissions (candidate_id);
create index if not exists candidate_submissions_status_idx
    on candidate_submissions (status);

alter table candidate_submissions enable row level security;

-- Anon may INSERT submissions (the public form posts through the
-- anon client, so this policy is the actual backstop) but may never
-- SELECT, UPDATE or DELETE them: there is deliberately no read
-- policy, so a pending submission cannot be re-read by anyone but
-- the service role. The server action enforces the status rule
-- (pending_confirmation when a roster email exists, 'new' + manual
-- verification only when it does not); the policy permits both
-- insert statuses because RLS cannot see the roster email.
drop policy if exists candidate_submissions_anon_insert
    on candidate_submissions;
create policy candidate_submissions_anon_insert
    on candidate_submissions for insert to anon
    with check (status in ('pending_confirmation', 'new'));

-- No anon SELECT / UPDATE / DELETE policies: default-deny.
-- Admin reads and writes go through the service-role client, which
-- bypasses RLS, exactly like the rest of /admin.
