# Runbook — load the SmarterVote database

**Time needed:** about 10 minutes.
**What you'll have at the end:** a Supabase database holding the Town of Huntsville, 9 races, 6 wards and 29 candidate records.

Nothing here is destructive. All three files are safe to re-run.

---

## ⚠️ Which files go in the SQL editor

**Only files in the `supabase/` folder.** They all end in `.sql`.

Everything else in the project is website code or notes that run on your Mac, never in the database:

| Folder | What it is | Goes in SQL editor? |
|---|---|---|
| `supabase/*.sql` | Database scripts | **Yes** |
| `app/`, `components/`, `lib/` | Website code (`.tsx`, `.ts`) | No |
| `docs/` | Notes and runbooks (`.md`) | No |

If you paste a `.tsx` file into Supabase you'll get something like:

```
ERROR: 42601: syntax error at or near "type"
LINE 1: import type { Metadata } from "next";
```

That's harmless — Postgres rejects it on the first line, so nothing runs and nothing is damaged. Just close the query and open the right file.

---

## Before you start

Have these open:

- The Supabase dashboard: **https://supabase.com/dashboard** — signed in as `support.smartervote.ca@gmail.com`
- A Finder window at `OneDrive-Personal → SmartVote.ca → smartervote → supabase`

You'll run three files, in this order:

| Order | File | What it does |
|---|---|---|
| 1 | `01_schema.sql` | Creates the tables, views and security rules |
| 2 | `02_seed.sql` | Loads Huntsville's races, wards and candidates |
| 3 | `03_verify.sql` | Checks it all landed correctly |

---

## Step 1 — Open the SQL Editor

1. Go to **https://supabase.com/dashboard**
2. Click your SmarterVote project.
3. **Check the project name at the top left is the one you meant.** If you created more than one project, running this in the wrong one is the easiest mistake to make here.
4. In the left sidebar, click **SQL Editor** (icon looks like a database with `>_`).
5. Click **+ New query** at the top of the query list.

You should now see an empty black text area with a green **Run** button at the bottom right.

---

## Step 2 — Run `01_schema.sql`

1. In Finder, open `supabase/01_schema.sql`. Right-click → **Open With** → **TextEdit** (or VS Code if you have it).
2. Select all (**⌘A**), copy (**⌘C**).
3. Click into the Supabase query box and paste (**⌘V**).
4. Click **Run** (or press **⌘↵**).

**Expected result:** a green bar saying **"Success. No rows returned"**.

That message is correct and means it worked. This script creates things; it doesn't return data.

⏱ Takes 2–5 seconds.

---

## Step 3 — Run `02_seed.sql`

1. Click **+ New query** again. *(Don't paste over the previous one — a fresh query box avoids accidentally re-running half of step 2.)*
2. Open `supabase/02_seed.sql`, select all, copy.
3. Paste into the new query box.
4. Click **Run**.

**Expected result:** **"Success. No rows returned"** again.

⏱ Takes 1–3 seconds.

---

## Step 4 — Run `03_verify.sql`

1. Click **+ New query** one more time.
2. Open `supabase/03_verify.sql`, select all, copy, paste.
3. Click **Run**.

**This one returns a table.** You should see 21 rows, and **every row should say `PASS` or start with `ok`**:

| Check | Actual | Expected | Result |
|---|---|---|---|
| Municipalities | 1 | 1 | PASS |
| Races | 9 | 9 | PASS |
| Wards | 6 | 6 | PASS |
| Candidate rows (all) | 29 | 29 | PASS |
| Running (not withdrawn) | 28 | 28 | PASS |
| Withdrawn | 1 | 1 | PASS |
| Acclaimed | 2 | 2 | PASS |
| Council seats on ballot | 9 | 9 | PASS |
| Races decided by acclamation | 2 | 2 | PASS |
| Candidates with a website | 10 | 10 | PASS |
| Wards linked to a race | 6 | 6 | PASS |
| Candidates with no race | 0 | 0 | PASS |
| Race: Mayor | 4 | 1 | ok — 4 running for 1 seat(s) |
| Race: District and Town Councillor | 6 | 3 | ok — 6 running for 3 seat(s) |
| Race: Councillor — Wards 1 & 2 | 6 | 2 | ok — 6 running for 2 seat(s) |
| Race: Councillor — Wards 3, 4 & 5 | 3 | 2 | ok — 3 running for 2 seat(s) |
| Race: Councillor — Ward 6 | 3 | 1 | ok — 3 running for 1 seat(s) |
| Race: School Trustee — Trillium Lakelands DSB | 2 | 1 | ok — 2 running for 1 seat(s) |
| Race: School Trustee — Simcoe Muskoka Catholic DSB (Area 5) | 1 | 1 | ok — acclaimed / uncontested |
| Race: Conseiller scolaire — Conseil scolaire public du Nord-Est (Zone A) | 1 | 1 | ok — acclaimed / uncontested |
| Race: Conseiller scolaire — Conseil scolaire catholique MonAvenir | 2 | 1 | ok — 2 running for 1 seat(s) |

**If every row says PASS or ok, you're done.** Tell me and I'll start the app.

**If any row says FAIL or CHECK**, copy the whole table and send it to me. Don't try to fix it by re-running things in a different order.

---

## Step 5 (optional) — look at the data

Left sidebar → **Table Editor** → pick `candidates` from the dropdown. You should see 29 rows with real names in them.

Worth 30 seconds just to see your own data sitting there.

---

## If something goes wrong

**Red error box — `relation "municipalities" does not exist`**
You ran `02_seed.sql` before `01_schema.sql`. Go back to step 2 and run them in order.

**Red error box — `permission denied to create extension "pgcrypto"`**
Delete the very first line of `01_schema.sql` (`create extension if not exists pgcrypto;`) and run it again. Supabase already provides what that line asks for; the line is only there so the file also works on a plain Postgres server.

**`duplicate key value violates unique constraint`**
Harmless in principle — it means some data was already there. But it also means the script stopped partway. Re-run `02_seed.sql` from the top; it's written to update existing rows rather than duplicate them.

**"Success" but `03_verify.sql` shows zeroes everywhere**
You're probably looking at a different project than the one you seeded. Check the project name at the top left.

**Anything else**
Copy the *full* red error text — all of it, not just the first line — and send it to me. The useful part is usually at the end.

---

## One thing to be careful about

While you're in Supabase, you'll see **Project Settings → API** with three values: the project URL, the `anon` key, and the `service_role` key.

The `service_role` key bypasses every security rule in the database. **Don't paste it into a chat** — including with me. When we get to the app, it goes into `.env.local` on your machine and into Vercel's environment variables, and nowhere else.

The `anon` key is designed to be public and is safe to share.
