# SmarterVote.ca

A free, non-partisan guide to what candidates actually say, so voters can compare them side by side.

**Pilot:** Town of Huntsville, Ontario — 2026 municipal and school board election.
**Launch target:** 14 October 2026, the day advance voting opens.
**Voting day:** 26 October 2026. Huntsville votes by internet and telephone.

---

## ⚠️ Move this folder before you run `npm install`

This currently lives inside OneDrive. **Node projects and OneDrive don't mix** — `node_modules` is tens of thousands of small files, and OneDrive will try to sync every one of them. Expect a pegged CPU, sync conflicts, and a slow machine.

Before doing anything else:

```bash
mkdir -p ~/dev
cp -R "$HOME/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote" ~/dev/smartervote
cd ~/dev/smartervote
```

Then create the GitHub repo from `~/dev/smartervote`, and connect Vercel to that repo. The OneDrive copy stays as a reference; the working copy lives outside it.

---

## Setup

### 1. Load the database

In the Supabase dashboard → **SQL Editor** → New query. Run these in order:

1. `supabase/01_schema.sql` — tables, views, row-level security
2. `supabase/02_seed.sql` — the Town of Huntsville, 9 races, 6 wards, 29 candidate records

`02_seed.sql` ends with sanity-check queries. You should see:

| check | value |
|---|---|
| races | 9 |
| wards | 6 |
| candidate rows | 29 |
| running (not withdrawn) | 28 |
| withdrawn | 1 |
| council seats | 9 |
| acclaimed races | 2 |

If any number differs, stop and tell me rather than carrying on — it means the seed didn't apply cleanly.

Both files are safe to re-run. They update existing rows instead of duplicating them.

### 2. Environment variables

Create `.env.local` (already gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Get all three from Supabase → Project Settings → API.

**Never paste the service role key into a chat, a commit, or a client component.** It bypasses row-level security entirely. It belongs in `.env.local` locally and in Vercel's environment variables in production, and nowhere else. The anon key is designed to be public and is safe in the browser.

### 3. Domain

In the Vercel project → Settings → Domains, add `smartervote.ca` and `www.smartervote.ca`, then set the DNS records Vercel gives you at your current registrar. Don't transfer the registrar before the election — CIRA locks a `.ca` against transfer for 60 days after registration anyway.

---

## Run it locally

```bash
npm install
cp .env.example .env.local    # then fill in your Supabase values
npm run dev                   # http://localhost:3000
```

Verified on Node 22: `npm install`, `tsc --noEmit` and `next build` all pass clean.
The build deliberately succeeds even with no database configured — pages render an
honest "information unavailable" state instead of failing the deploy.

## What's here so far

```
smartervote/
├── app/
│   ├── layout.tsx                 nav, footer, non-affiliation notice
│   ├── page.tsx                   home — voting dates, all races, wards
│   ├── races/page.tsx             every race on the ballot
│   ├── races/[race]/page.tsx      one race, its candidates, seat count
│   ├── races/[race]/[candidate]/  candidate page with sourced positions
│   ├── methodology/               how this works — the trust page
│   ├── about/  privacy/  corrections/
│   └── not-found.tsx
├── components/                    Nav, Footer, RaceCard, UnavailableNotice
├── lib/
│   ├── supabase.ts                public (anon) + service clients, kept apart
│   ├── queries.ts                 all data access, fails soft
│   ├── types.ts  dates.ts
├── supabase/
│   ├── 01_schema.sql              tables, views, RLS
│   ├── 02_seed.sql                Huntsville races, wards, candidates
│   └── 03_verify.sql              one query, PASS/FAIL per check
├── docs/
│   ├── RUNBOOK-load-database.md
│   └── issue-taxonomy-DRAFT.md    ← needs your edit before content work starts
└── README.md
```

Still to come: the corrections form and its API route, the position extraction
pipeline, the admin review queue, the compare view, and the page-view counter.

---

## Design decisions worth knowing before you read the code

**Municipal races are non-partisan.** There are no parties and no platforms to compare. You're comparing *people against issues*. Don't reach for the federal party-comparison model — it doesn't fit.

**Nothing publishes without a source.** The `published_needs_source` constraint in `01_schema.sql` enforces this in the database, not just in policy: a published position must either carry a verbatim quote and a source URL, or be explicitly flagged `no_public_position`. There is no third state. A tired reviewer can't accidentally create one.

**Withdrawn candidates stay in the database but never reach a page.** Rod Ward withdrew after nomination. The record is honest; the `public_candidates` view filters him out.

**Home addresses are not stored.** The Town publishes candidates' qualifying addresses. Republishing them serves no voter purpose.

**Analytics are anonymous aggregates.** `page_views` holds a path, an hour, and a count. No IP, no cookie, no session ID, no address — by design, so there is nothing to leak and no consent banner to show.

**Acclaimed races get a real page.** Two school board seats were decided without a contest. "No election needed here, and here's who got the seat" is genuinely useful civic information, not an empty page.

---

## The fairness problem, stated plainly

Ten of the 28 candidates have campaign websites. Eighteen don't. Nine have neither a website nor a listed social account.

If the site only summarises what candidates published, those nine get thin pages — and SmarterVote quietly penalises whoever didn't build a website, which skews against older, less-resourced and first-time candidates. That would be a real bias introduced by a tool claiming to remove bias.

The countermeasures, which are not optional:

- Identical page template and identical issue list for every candidate
- Explicit "no public position found as of [date]" rather than a blank space
- Correction link on every page, in the body, not the footer
- Local news coverage used to supplement, always attributed to the outlet and dated
- The whole rule written out on the methodology page so anyone can check it

---

## Non-affiliation

`smartvoting.ca` is an existing, openly partisan strategic-voting site. SmarterVote is unconnected to it and does not recommend how anyone should vote. That statement belongs on the home page and the About page — not buried — because for a project whose entire value is neutrality, being mistaken for a strategic-voting tool is the worst available confusion.
