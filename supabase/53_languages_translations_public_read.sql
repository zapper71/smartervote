-- =====================================================================
-- SmarterVote — fix 53: public read access to languages + translations
--
-- PROBLEM (found Nov 27 on the multilingual preview): the site reads the
-- two new tables through the anon (publishable) key, but anon gets
-- NOTHING back from either table — so the language switcher hides
-- itself (it renders nothing with fewer than two languages), all UI
-- strings fall back to English, and every French summary/issue name
-- renders as native English tagged "(en anglais)". The old content
-- tables (candidates, issues, positions) read fine through anon, so
-- the preview renders real candidate data while the new tables read
-- empty. The data IS in the tables — the SQL-editor verify (postgres
-- role, bypasses RLS) showed 1,280 translation rows. The gap is
-- permissions on the two new tables, not the code and not the data.
--
-- FIX: grant anon/authenticated SELECT on both tables, and enable row
-- level security with a public read-only policy, so the result is the
-- same whichever of the two mechanisms was blocking the read. The
-- policy is SELECT-only: nothing can write to these tables through
-- the public key. Writes stay in the SQL editor / service key, as now.
--
-- Run in the Supabase SQL editor. VERIFY at the end expects 2 policies
-- and 2 grants listed. After running, reload the preview — the switcher
-- and the French content should appear (pages revalidate within the
-- hour; a preview redeploy forces it immediately).
-- =====================================================================

grant select on public.languages to anon, authenticated;
grant select on public.translations to anon, authenticated;

alter table public.languages enable row level security;
alter table public.translations enable row level security;

drop policy if exists "languages_public_read" on public.languages;
drop policy if exists "translations_public_read" on public.translations;

create policy "languages_public_read"
    on public.languages
    for select to anon, authenticated
    using (true);

create policy "translations_public_read"
    on public.translations
    for select to anon, authenticated
    using (true);

-- VERIFY — expect 2 policy rows and 2 grant rows.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where tablename in ('languages', 'translations')
order by tablename;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_name in ('languages', 'translations')
  and grantee in ('anon', 'authenticated')
  and privilege_type = 'SELECT'
order by table_name, grantee;
