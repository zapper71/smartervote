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


## Finding `~/dev/smartervote` in Finder or a file picker

`~` is shorthand for your home folder. The real path is:

```
/Users/andreaszapletal/dev/smartervote
```

Finder doesn't always show your home folder in the sidebar, so this folder can feel invisible. Three ways to get to it:

**Open it in Finder from Terminal** — simplest:

```
open ~/dev
```

**In any macOS file dialog** (including GitHub Desktop's "Add Local Repository"), press **⌘⇧G**. A box appears where you can paste a path directly:

```
~/dev/smartervote
```

**Add it to your Finder sidebar permanently** so you never hunt for it again: run `open ~/dev`, then drag the `smartervote` folder onto the Favourites section of the Finder sidebar.

### If the folder genuinely isn't there

```
ls ~/dev/smartervote
```

If that errors, the original copy never completed. Rebuild it:

```
mkdir -p ~/dev
cp -R ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote ~/dev/smartervote
cd ~/dev/smartervote && npm install
```

### Which folder should you be working in?

- **`~/dev/smartervote`** — where you run `npm run dev`, where git lives, what you publish to GitHub. Your working copy.
- **OneDrive `…/SmartVote.ca/smartervote`** — where Claude writes. Never run anything here, and `node_modules` must never end up here or OneDrive will try to sync tens of thousands of files.

`update.sh` is the bridge between them. If you're ever unsure which folder a Terminal window is in, type `pwd`.

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


## ⚠️ "Authentication failed" when pushing

**This is expected, and it isn't your password being wrong.** GitHub stopped accepting account passwords for git operations in August 2021. If Terminal asked for a password and you typed your GitHub one, it will fail every time, no matter how many times you retype it.

You have two ways forward. I'd strongly suggest the first.

---

### Option A — GitHub Desktop (recommended)

A free app from GitHub. It signs you in through your browser, and replaces every git command in this runbook with buttons. **You never touch git in Terminal again.**

For what you're doing — reviewing changes I've made to candidate content before they go live — the visual diff is genuinely better than the command line anyway. You see exactly what changed, line by line, with removals in red and additions in green.

1. Download from **https://desktop.github.com** and install it.
2. Open it and sign in to GitHub. It opens a browser window — that's the correct flow, and it's why this works when the password didn't.
3. **File → Add Local Repository** → choose `~/dev/smartervote`
   - If it says the folder isn't a git repository, click **Create a repository** when offered.
4. **Before publishing, check nothing secret is committed.** In Terminal:

   ```
   cd ~/dev/smartervote && git ls-files | grep -E "\.env|node_modules" || echo "Clean — safe to push"
   ```

   It must print **Clean**. If it lists `.env.local`, stop — that would send your Supabase secret key to GitHub, which means rotating keys rather than just deleting a file.

5. Click the button at the top. **You'll see one of two labels, and both are correct:**

   - **"Publish repository"** — you haven't created the repo on GitHub yet. Name it `smartervote` and **tick "Keep this code private"**.
   - **"Publish branch"** — a remote is already configured (because you ran `git remote add origin` in Terminal earlier). Just click it; it pushes to the repo that's already set up.

   > If "Publish branch" errors saying the repository doesn't exist, you added the remote but never created the repo. Go to **https://github.com/new**, name it `smartervote`, tick **Private**, add no README or .gitignore, click **Create repository**, then click Publish branch again.

6. Done. Your code is on GitHub.

**From then on, your whole routine is:**

```
cd ~/dev/smartervote && ./update.sh
```

Then in GitHub Desktop: review the changes shown in the left panel, type a short summary, click **Commit to main**, then **Push origin**. Vercel deploys automatically.

---

### Option B — Personal access token in Terminal

If you'd rather stay in Terminal: GitHub wants a **personal access token** where it says "password".

1. Go to **https://github.com/settings/tokens** → **Generate new token (classic)**
2. Give it a name like `smartervote-mac`, set an expiry, and tick the **`repo`** scope
3. Click **Generate token** and copy it — GitHub shows it exactly once
4. Run `git push -u origin main` again. At the **Password** prompt, paste the **token**, not your password. Your GitHub username stays the same.

macOS will remember it in Keychain, so you only do this once.

**Never paste that token into a chat, a commit, or a file** — including to me. It grants full access to your repositories. If it ever leaks, revoke it on that same settings page.

---

## Step 3 — Connect Vercel

1. **https://vercel.com/dashboard** → your SmarterVote project → **Settings** → **Git**
2. Connect the `smartervote` repository
3. Vercel deploys automatically on every push

## Step 4 — Set environment variables in Vercel

### Finding the page (this trips people up)

**Vercel has two different Settings pages.** The obvious one is the wrong one:

- **Settings in the top-right avatar menu** = your *account* settings. No environment variables here.
- **Settings inside a project** = what you want.

**Fastest route — go straight to the URL:**

```
https://vercel.com/YOUR-USERNAME/smartervote/settings/environment-variables
```

Not sure of the exact names? Open **vercel.com/dashboard**, click your project, and read the address bar — it shows `vercel.com/<owner>/<project>`. Those are the two parts.

**By clicking:** vercel.com/dashboard → click the project tile → **Settings** tab *along the top of the project page* → **Environment Variables** in the left sidebar.

**If no project tile exists**, the project was never created or sits under a different team. Easiest fix now that the repo is on GitHub: **Add New → Project** → import `smartervote`. Vercel prompts for environment variables during that flow, which skips this navigation entirely.

### What to add

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as in your `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same as in your `.env.local` |

Apply both to **Production**, **Preview** and **Development** (Vercel usually ticks all three by default).

**Do NOT add `ADMIN_PASSWORD`.** Leaving it out means there is no admin area on the public internet at all — you review locally against the same database. Safest arrangement, and it costs you nothing.

**Do NOT add the secret key yet.** Nothing public needs it. It'll be required when the corrections form goes live, and we'll add it then.

> **Environment variables only apply to new deployments.** If you add them after a deploy has already run, go to the **Deployments** tab and **Redeploy** the latest one, or the site will still behave as though the keys are missing.

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
