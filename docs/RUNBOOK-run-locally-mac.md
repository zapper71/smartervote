# Runbook — run SmarterVote on your Mac

**Time:** 15–20 minutes the first time, about 20 seconds every time after.
**What you'll have at the end:** the site running at `http://localhost:3000` on your own machine, showing your real Huntsville data.

Nothing here touches the internet-facing site. This is a private copy only you can see.

---

## A note on Terminal

Everything below is typed into Terminal. If you haven't used it: it's just a place to type commands instead of clicking. You can't break anything with these particular commands — none of them delete or overwrite anything outside the project folder.

**To open it:** press **⌘ Space**, type `Terminal`, press **Return**.

You'll see a window with a line ending in `%`. That's the prompt, waiting for you.

**How to use it:** copy a command from this page, paste it (**⌘V**), press **Return**. Wait until the `%` prompt comes back before typing the next one.

---

## Step 1 — Check whether Node is installed

Node is the thing that runs the website code. Type:

```
node --version
```

**If you see something like `v22.11.0` or `v20.18.0`** — you're set, skip to Step 3.

**If you see `command not found: node`** — do Step 2.

**If you see `v18.something` or lower** — do Step 2 to update.

---

## Step 2 — Install Node (only if Step 1 said you need it)

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the one on the left — it'll say something like "22.x.x LTS"). You want the **macOS Installer (.pkg)**.
3. Open the downloaded `.pkg` file and click through the installer. Defaults are fine.
4. **Quit Terminal completely (⌘Q) and open it again.** This matters — Terminal won't see Node until it restarts.
5. Run `node --version` again to confirm.

---

## Step 3 — Copy the project out of OneDrive

This matters. `npm install` creates a folder with tens of thousands of small files, and OneDrive will try to sync every one of them — pegging your CPU and creating sync conflicts.

Paste these three lines **one at a time**:

```
mkdir -p ~/dev
```

```
cp -R ~/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote ~/dev/smartervote
```

```
cd ~/dev/smartervote
```

Each should finish silently with no output. Silence means success here.

**If the `cp` line says "No such file or directory"**, your OneDrive folder is named slightly differently. Easy fix:

1. Type `cp -R ` (with a space at the end, don't press Return)
2. Drag the `smartervote` folder from Finder onto the Terminal window — it pastes the exact path
3. Type ` ~/dev/smartervote` on the end and press Return

To confirm you're in the right place:

```
ls
```

You should see: `README.md`, `app`, `components`, `lib`, `package.json`, `supabase`, and a few others.

---

## Step 4 — Install the dependencies

```
npm install
```

⏱ 30 seconds to 2 minutes. You'll see a spinner, then something like:

```
added 114 packages in 31s
```

**Yellow `npm warn` lines are normal** and can be ignored. Red `npm error` lines are not — send those to me.

You only ever have to do this once, unless I add a new dependency.

---

## Step 5 — Add your Supabase keys

The app needs to know where your database is. Two commands:

```
cp .env.example .env.local
```

```
open -a TextEdit .env.local
```

TextEdit opens with a template. Now go get the values.

### The fast way — the Connect button

1. **https://supabase.com/dashboard** → your SmarterVote project
2. Click **Connect** near the top of the page
3. Choose **App Frameworks** → **Next.js**

Supabase shows you a ready-made block with the URL and the public key already filled in. Copy those two values across into your `.env.local`.

### The manual way

Supabase reorganised this in 2026, so it's split across two pages now:

| What you need | Where it lives |
|---|---|
| **Project URL** | Settings → **Data API** |
| **Publishable key** (`sb_publishable_…`) | Settings → **API Keys** |
| **Secret key** (`sb_secret_…`) | Settings → **API Keys** — click to reveal |

> **If your project shows `anon` and `service_role` instead** of publishable/secret, that's fine — it's an older-style project. Use those values, but put them on the commented-out lines in `.env.local` instead (`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`), and delete the `sb_publishable_…` / `sb_secret_…` placeholder lines. The app reads either naming. Supabase is retiring the old pair at the end of 2026.

### Can't find the Project URL at all?

Look at your browser's address bar while you're inside the project:

```
https://supabase.com/dashboard/project/abcdefghijklmnop
                                       ^^^^^^^^^^^^^^^^
```

That last part is your project ref. Your URL is then `https://abcdefghijklmnop.supabase.co`. This works no matter how the dashboard gets rearranged.

### Pasting them in

Paste each value **immediately after the `=` sign, with no spaces and no quotes**:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
```

Then **⌘S** to save and **⌘W** to close.

> **If TextEdit won't let you save as plain text:** menu bar → **Format** → **Make Plain Text**, then save.

> **Reminder:** the `service_role` key bypasses every security rule in your database. It's fine in this file — `.env.local` is gitignored and never leaves your Mac. Don't paste it into a chat, a commit, or an email. Not even to me.

---

## Step 6 — Run it

```
npm run dev
```

After a few seconds you'll see:

```
▲ Next.js 15.x.x
- Local:  http://localhost:3000
✓ Ready in 1.4s
```

**Now open http://localhost:3000 in your browser.**

You should see the SmarterVote home page with the Huntsville voting dates, all nine races, and the six wards listed.

---

## Step 6b — If anything looks wrong, check the status page

Open **http://localhost:3000/status**

It's a private diagnostic page that tells you in plain language whether the app found your URL, found your key, reached the database, and loaded the right number of races and wards. It never shows any part of a key.

Every row should say **PASS** (the secret key row may show **—**, which is fine — it's only needed for the corrections form and admin screens, neither of which exist yet).

If something says FAIL, the page tells you what's wrong. Send me a screenshot if it isn't obvious.

---

## Step 7 — Look around

Click through and check the data actually landed:

- **Home** — should show 9 races and 28 candidates
- **Mayor** — 4 candidates: Armour, Caswell, Mello, Morrison
- **Wards 1 & 2** — 6 candidates, "6 candidates for 2 seats"
- **Simcoe Muskoka Catholic** — should say **Acclaimed**
- Any **candidate page** — contact links, then "Not published yet" for positions (correct — the taxonomy isn't approved yet)
- **Rod Ward should appear nowhere.** He withdrew. If you see him, tell me.

---

## Stopping and restarting

**To stop:** click the Terminal window and press **Ctrl+C** (the `control` key, not ⌘).

**To start again later** — two lines:

```
cd ~/dev/smartervote
```

```
npm run dev
```

That's it. Steps 1–5 are one-time.

---

## If something goes wrong

**`command not found: npm`**
Node isn't installed, or you didn't restart Terminal after installing it. Redo Step 2, including quitting Terminal with ⌘Q.

**`ENOENT: no such file or directory, open 'package.json'`**
You're not in the project folder. Run `cd ~/dev/smartervote` and try again.

**`Port 3000 is already in use`**
Something else is using it. Run it on a different port instead:
```
npm run dev -- -p 3001
```
Then use `http://localhost:3001`.

**The page loads but says "Candidate information isn't available right now"**
This means the app can't reach your database — and it's doing the right thing by saying so rather than crashing. Almost always one of:
- `.env.local` wasn't saved (go back to Step 5)
- A value got pasted with a space, a quote mark, or a line break in it
- TextEdit saved it as rich text instead of plain text
- You need to stop the server (Ctrl+C) and `npm run dev` again — it only reads `.env.local` at startup

**Data loads but numbers look wrong**
Send me what you're seeing versus what you expected. Don't re-run the SQL to try to fix it.

**Anything with a red error**
Copy the whole thing — all of it, including the lines above the error — and send it to me. The useful part is often not the last line.

---

## Using the review queue

The review queue is where you approve draft positions before they appear on the site.

### Turn it on (local only)

1. Generate a password. In Terminal:

   ```
   openssl rand -base64 24
   ```

   Copy what it prints.

2. Open your environment file:

   ```
   open -a TextEdit ~/dev/smartervote/.env.local
   ```

3. Add a line at the bottom, pasting your generated password after the `=`:

   ```
   ADMIN_PASSWORD=paste-the-generated-password-here
   ```

4. Save (⌘S), close (⌘W), then stop the server (**Ctrl+C**) and start it again:

   ```
   npm run dev
   ```

5. Go to **http://localhost:3000/admin** and sign in.

### Leave it OFF in Vercel

Do not add `ADMIN_PASSWORD` to Vercel's environment variables.

With no password set in production, **there is no admin area on the public internet at all** — not a locked door, no door. The page just says admin is off. You review locally against the same live database, so approving a position at your kitchen table publishes it to the real site immediately.

That's the safest arrangement and it costs you nothing, because you're the only reviewer.

### How reviewing works

Positions are grouped by candidate, so you judge one person's whole page at a time rather than hopping between people — much easier to spot inconsistent treatment.

For each one:

- **The quote comes first, above the summary.** That's deliberate. The question you're answering is *does the summary say anything the quote doesn't?*
- **Approve & publish** — goes live immediately.
- **Edit the summary box, then approve** — your edit is saved with the approval.
- **Reject** — sends it back to draft. It stays in the database but never appears anywhere.
- **Approve all for this candidate** — offered per candidate only, never site-wide. A global "approve everything" button is the one you click at 11pm without reading, and the entire premise of this site is that a person read every line.

Under **Published** you can **Unpublish** anything, which pulls it off the site immediately. Useful if a candidate disputes something and you want it down while you check.

### If you forget the password

Change `ADMIN_PASSWORD` in `.env.local` to something new and restart. Any existing session stops working the moment the password changes, because the session cookie is derived from it.
