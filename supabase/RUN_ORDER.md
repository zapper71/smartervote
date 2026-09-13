# Which SQL files to run, in what order

Run these in the Supabase SQL editor, top to bottom. Every file is safe to
re-run — if you're unsure whether one went through, run it again.

Each file ends with a VERIFY query. The SQL editor only shows the result of
the **last** statement, which is why the checks are written as one query.

| # | File | What it does | Status |
|---|------|--------------|--------|
| 01 | `01_schema.sql` | Tables, constraints, the `published_needs_source` rule | ✅ run |
| 02 | `02_seed.sql` | 9 races, 6 wards, 29 candidates from the certified list | ✅ run |
| 03 | `03_verify.sql` | Sanity check on 01 and 02 | ✅ run |
| 04 | `04_issues.sql` | The 10 approved issues | ✅ run |
| 05 | `05_positions.sql` | 47 positions, batch 1 | ✅ run, all approved |
| 06 | `06_conflicting_positions.sql` | Allows more than one position per issue | ✅ run |
| 07 | `07_verified_links.sql` | `verified_links` column and its validation trigger | ✅ run |
| 08 | `08_positions_round2.sql` | 41 positions, batch 2 | ✅ run, **awaiting approval in /admin** |
| 09 | `09_two_more_issues.sql` | Emergency services + transit; 16 social links | ⬜ |
| 10 | `10_sabbagh_additions.sql` | 3 more Sabbagh positions — **needs 09** | ⬜ |
| 11 | `11_source_extent.sql` | `source_extent` column, view, Davis + Sabbagh | ⬜ |
| 12 | `12_facebook_links.sql` | Clouthier and Koop Facebook links | ⬜ |
| 13 | `13_source_extent_batch1.sql` | `source_extent` for the 47 live rows — **needs 11** | ⬜ |
| 14 | `14_ankenmann_platform.sql` | 8 Ankenmann positions from his platform page — **needs 11** | ⬜ |
| 15 | `15_full_site_sweep.sql` | 9 positions from pages never opened — **needs 11** | ⬜ |
| 16 | `16_social_and_school_board.sql` | Scopes issues to race type; 3 positions from public Facebook pages — **needs 11** | ⬜ |
| 17 | `17_candidate_contact.sql` | Records who we've written to, so blanks stop implying silence | ⬜ |
| 18 | `18_french.sql` | French for the CSC MonAvenir trustee race | ⬜ |
| 99 | `99_health_check.sql` | Read-only. Run any time to see the state of the data | — |

After 16, expect **111 positions**, 47 published and 64 awaiting approval, and
**15 issues** — 12 municipal, 3 for school board races only.

⚠️ **16 also changes app code** (`lib/queries.ts`, both race pages,
`lib/types.ts`). Run `./update.sh` before `npm run dev` or the pages will ask
the database for a column the old code doesn't know about.

Superseded, do not run: `09_two_more_issues_OPTIONAL.sql`. Safe to delete.

## Dependencies

Most files only need the ones before them, but two have a hard requirement
and will stop with a plain-English message rather than a Postgres error if
it isn't met:

- **10 needs 09** — two of its positions belong to the emergency-services
  issue, which 09 creates.
- **13 needs 11** — it fills in the `source_extent` column, which 11 adds.

If you see `column "source_extent" of relation "positions" does not exist`,
that's 13 without 11. Nothing was changed; run 11, then 13.

## Re-running

All thirteen are safe to re-run in any order, and re-running never
duplicates or deletes anything. If you're unsure whether one went through,
just run it again — that is cheaper than working out what happened.

One file had to be repaired to make that true. `09` originally *assigned*
`verified_links` rather than merging into it, so running it after `12` would
have silently wiped Kirsty Koop's Facebook link. It now keeps whatever is
already there and adds to it.

## Reading an error: did it actually fail?

Every file is `begin; … commit;` followed by a VERIFY query. **The verify
runs after the commit**, so an error in it means the data went in fine and
only the report broke. Look at the line number the error points to: if it's
below the `commit;`, your changes are safe and re-running the file is
harmless.

That happened once already: `10` reported `column reference "status" is
ambiguous` from its verify block. Both `positions` and `candidates` have a
`status` column, so a join needs `p.status`. The three positions had
already been inserted.

## After running these

1. **Approve batch 2 in `/admin`.** The 41 positions from 08 and the 3 from
   10 are `in_review` and invisible on the public site until you approve
   them. This is why Sabbagh, Morrison, Mello, Peterson, Bowler, Terziano,
   Hernen, Lowe, Clouthier and Davis currently look blank.
2. **Set `source_extent` on anything new** as you approve it. The dropdown
   is on each card in the review screen.
3. `./update.sh`, then `npm run dev`, and check a candidate page, a compare
   page and `/admin` before committing.
