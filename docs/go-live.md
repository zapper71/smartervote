# Going live — step by step

**Goal: a working production site you can send to candidates, that Google
cannot find.**

That second half is the important one and it is why there are steps before the
deploy. Nine of twenty-eight candidates have no positions and not one has been
written to. If the site gets indexed in that state, "Huntsville election
candidates" returns a page showing nine people with nothing to say, and search
results are slow to correct. A candidate would be entitled to be angry, and
right.

So: deploy, send the URL directly, stay out of the index until 14 October.
`SITE_INDEXABLE` defaults to **false** and fails closed — a typo or a missing
variable keeps you out of the index rather than publishing early.

Allow 30–40 minutes. Do it when you are not tired.

---

## 1 · Sync and build locally  (5 min)

```bash
cd ~/dev/smartervote
./update.sh
npm run build
```

`update.sh` will list `REMOVED  lib/i18n.ts` and several new files. If it
mentions `package.json`, run `npm install` first.

**The build must pass.** If it fails, stop and send me the error — do not push
a failing build and hope Vercel sorts it out.

Then:

```bash
npm run dev
```

Open `http://localhost:3000/status` and confirm it reads **2026-09-13.22**.
If it says anything older, `./update.sh` did not take.

## 2 · Check the database is where you think it is  (3 min)

In the Supabase SQL editor, run `supabase/99_health_check.sql`.

Every row should say PASS. Pay attention to two:

- **Check 6, awaiting approval** should now be **0** — you approved everything.
- **Check 10, positions with no source_extent** should be 0.

If `17_candidate_contact.sql` or `18_french.sql` have not been run yet, run
them now. `RUN_ORDER.md` has the full list.

## 3 · Confirm no secrets are about to be committed  (1 min)

```bash
cd ~/dev/smartervote
git ls-files | grep -E "\.env|node_modules" || echo "Clean"
```

It must print **Clean**. If it prints a filename, stop and tell me.

## 4 · Commit and push  (5 min)

In GitHub Desktop:

1. Review the changed files in the left panel. You should recognise them all.
2. Summary: `Accessibility fixes, candidate contact tracking, pre-launch noindex`
3. **Commit to main**, then **Push origin**.

Vercel starts building within a few seconds of the push.

## 5 · Set the production environment variables  (5 min)

Vercel → your project → **Settings → Environment Variables**.

| Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the `sb_publishable_…` key | Production, Preview, Development |
| `SUPABASE_SECRET_KEY` | the `sb_secret_…` key | Production only |

Three things to get right:

- **`SITE_INDEXABLE` must NOT be set.** Not `false` — absent. Absent is the
  safe state and it is what you want today.
- **`ADMIN_PASSWORD` must NOT be set in Vercel.** Unset means there is no admin
  area on the public internet at all — not a locked door, no door. You review
  locally against the same database. This is deliberate.
- **Never paste the secret key into a chat, a commit, or an email.** It bypasses
  row-level security. It belongs in `.env.local` and in Vercel, nowhere else.

If you change any variable, **redeploy** — Vercel does not apply new variables
to an existing build.

## 6 · Watch the deploy  (3 min)

Vercel → **Deployments**. Wait for **Ready**.

If it fails, open the build log and read the first error, not the last. Send me
that line.

## 7 · Point the domain  (10 min, plus DNS time)

Vercel → **Settings → Domains** → add `smartervote.ca` and `www.smartervote.ca`.

Vercel will show the DNS records to create at your registrar. Add them, then
wait. Propagation is usually minutes but can be an hour. Vercel issues the
HTTPS certificate automatically once DNS resolves.

Set one of the two as primary and let the other redirect — either direction is
fine, just pick one.

## 8 · Smoke test production  (10 min)

On the real domain, not localhost. **Do this on your phone too** — most voters
will meet this site on a phone.

- [ ] `https://smartervote.ca` loads over HTTPS with no warning
- [ ] `/status` shows the right version
- [ ] A race page lists its candidates
- [ ] A compare page renders the grid, and the sticky issue column works
- [ ] A candidate with positions shows quotes, sources and extent notes
- [ ] A candidate with none reads "No public statement found as of…"
- [ ] Source links open and land on the right page
- [ ] The corrections form submits, and the correction appears in your local
      `/admin` → Corrections
- [ ] **`https://smartervote.ca/robots.txt` says `Disallow: /`** ← the one that
      matters today
- [ ] **`https://smartervote.ca/admin` shows "Admin is off in this
      environment"**, not a login box
- [ ] View source on any page: `<meta name="robots" content="noindex">`

If either of the last two is wrong, stop and fix before sending anyone the URL.

## 9 · Send it to the candidates

Now, and only now, `docs/candidate-email.md`.

Add a line near the top of both templates, something like:

> The site is live but not yet listed on search engines — I'm sending it to
> candidates first so you can check your own page before anyone else sees it.

That is true, it explains why they cannot find it by searching, and it frames
the request as courtesy rather than a favour.

**The same day the emails go out, run the `contacted_at` update** at the bottom
of `17_candidate_contact.sql`. That flips every blank cell from "No public
statement found" to "We asked on [date] — no reply yet." Not before the emails
are actually sent.

---

## Going public on 14 October

One change, no code, no push:

1. Vercel → Settings → Environment Variables → add `SITE_INDEXABLE` = `true`,
   **Production only**.
2. Redeploy.
3. Confirm `https://smartervote.ca/robots.txt` now allows crawling and lists
   the sitemap, and that `/sitemap.xml` returns URLs.
4. Only then submit the site to Google Search Console.

Before you flip it, re-read the blocking list in `docs/launch-checklist.md`.
The screen reader check on a compare table is still outstanding and is the one
I cannot do for you.

---

## If something goes wrong after you have sent the URL

Vercel keeps every previous deployment. **Deployments → the last good one → ⋯ →
Promote to Production.** That is a rollback in about fifteen seconds, and it is
faster than debugging while candidates are looking at the site.

A data problem is different — the database is shared between local and
production, so a bad row is visible everywhere immediately. Unpublish it in
`/admin` locally and it disappears from production within the five-minute
revalidation window.
