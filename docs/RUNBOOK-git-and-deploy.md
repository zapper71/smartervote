# Runbook — updates, GitHub and deploying

Two separate things, in order. **Part 1 fixes your immediate problem** (the admin page) and takes two minutes. Part 2 is the GitHub and Vercel setup, worth doing once you're unblocked.

---

# Part 1 — Fix the stale copy, permanently

## What went wrong, three times now

Your `~/dev/smartervote` folder is a **copy** of the OneDrive folder. When I add a file, your copy doesn't have it until you sync. The symptom is "page not found", which tells you nothing useful.

From now on there's one command that syncs and tells you exactly what changed.

## One-time setup

```
rm -rf ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote/.git
```

> I tried to create a git repo directly in the OneDrive folder and it failed — that mount doesn't allow deleting files, so git left lock files behind and wedged itself. It's harmless but broken, and it must be removed before it confuses anything. You can delete it; I can't.

Then copy the update script across and make it runnable:

```
cp ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote/update.sh ~/dev/smartervote/
```

```
chmod +x ~/dev/smartervote/update.sh
```

## From now on, updating is one command

```
cd ~/dev/smartervote && ./update.sh
```

It prints something like:

```
Checking for changes...

  NEW      app/admin/page.tsx
  NEW      app/admin/actions.ts
  NEW      lib/admin-auth.ts
  UPDATED  lib/version.ts

Updated.

Database files changed:
  supabase/05_positions.sql
  Run these in the Supabase SQL editor if you haven't already.

Now restart the server:  npm run dev
```

If nothing changed it says so plainly — which means "stale copy" is ruled out as a cause, and the problem is something else.

**It never touches `.env.local` or `node_modules`.** Your password and keys are safe.

**It tells you when `package.json` changed** (run `npm install`) and **when new SQL appeared** (run it in Supabase). Both were things you previously had to remember.

### A note on how it compares files

The script uses checksums rather than file sizes and timestamps. That's deliberate: when I first tested it with the faster default, it **silently skipped a file whose content had changed but whose size hadn't** — the exact failure it exists to prevent. Checksums are slower in principle, but this project is under 200 KB, so it's instant.

## Do this now to get the admin page working

```
rm -rf ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote/.git
cp ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote/update.sh ~/dev/smartervote/
chmod +x ~/dev/smartervote/update.sh
cd ~/dev/smartervote && ./update.sh
npm run dev
```

Then **http://localhost:3000/status** should read **2026-09-13.2**, and **/admin** should show a sign-in box.

---

# Part 2 — GitHub and deploying to Vercel

Now that updates are reliable, this gets you version history and a live site.

## Step 1 — Make your working copy a git repo

```
cd ~/dev/smartervote
git init -b main
git add -A
git commit -m "SmarterVote: Huntsville 2026 pilot"
```

If git asks who you are:

```
git config user.name "Andreas Zapletal"
git config user.email "support.smartervote.ca@gmail.com"
```

**Check nothing secret got committed:**

```
git ls-files | grep -E "\.env|node_modules" || echo "Clean — no secrets, no node_modules"
```

It must print **Clean**. If it lists `.env.local`, stop and tell me before pushing anywhere.

## Step 2 — Create the repo on GitHub

1. Go to **https://github.com/new**
2. Repository name: `smartervote`
3. **Private** — recommended for now. You can make it public later; an open-source civic tool is a genuine credibility asset, but do that deliberately rather than by accident.
4. **Do not** tick "Add a README", "Add .gitignore" or "Choose a license" — the project already has them and those options will cause a conflict.
5. Click **Create repository**

GitHub then shows a page with commands. Use the ones under **"…or push an existing repository"**, which look like:

```
git remote add origin https://github.com/YOUR-USERNAME/smartervote.git
git push -u origin main
```

It'll ask you to sign in to GitHub in a browser window. That's normal.

## Step 3 — Connect Vercel

1. **https://vercel.com/dashboard** → your SmarterVote project → **Settings** → **Git**
2. Connect the `smartervote` repository
3. Vercel deploys automatically on every push

## Step 4 — Set environment variables in Vercel

**Settings → Environment Variables.** Add exactly these two:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as in your `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same as in your `.env.local` |

**Do NOT add `ADMIN_PASSWORD`.** Leaving it out means there is no admin area on the public internet at all — you review locally against the same database. That's the safest arrangement and it costs you nothing.

**Do NOT add the secret key yet.** Nothing public needs it. It'll be needed when the corrections form goes live, and we'll add it then.

## Step 5 — Keep the domain pointed at the preview URL for now

Per your earlier decision, leave `smartervote.ca` unpointed until positions are published. Vercel gives you a `.vercel.app` address to test with.

## From then on

```
cd ~/dev/smartervote
./update.sh          # get my latest changes
git add -A
git commit -m "what changed"
git push             # Vercel deploys automatically
```

`git diff` before committing shows you exactly what I changed, line by line — which is worth doing for anything touching candidate content.

---

## Why not put the git repo in OneDrive?

I tried. It doesn't work: the OneDrive mount blocks file deletion, so git can't clean up its lock files and the repo wedges after the first commit. The working copy in `~/dev` is a normal folder on your disk, where git behaves properly.

This also keeps a useful separation: **OneDrive is where I write, `~/dev` is where you work and deploy from.** `update.sh` is the bridge, and it reports what crossed it.
