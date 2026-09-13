# Launch checklist — SmarterVote.ca

**Target: live by 14 October 2026**, when advance voting opens. Election day is
26 October. Today is 13 September, so that is 31 days.

Ordered by when it has to happen, not by how big it is. The dated items are the
ones that cannot be recovered if missed.

---

## Blocking — the site should not go live without these

- [ ] **`rm smartervote/lib/i18n.ts`** — orphaned when French was dropped.
      Nothing imports it, so it is harmless, but dead modules invite someone
      to wire them back up without reading why they were unwired.
- [ ] **Screen reader pass on a compare table.** The one test that matters: in
      VoiceOver, arrow into a few cells and confirm it announces both the
      candidate and the issue. If header association is broken, the comparison
      page is unusable non-visually. See `docs/accessibility-audit.md`.
- [ ] **`npm run build` passes** on the current working copy, and `/status`
      shows the expected version.
- [ ] **`git ls-files | grep -E "\.env|node_modules"` prints nothing.**
- [ ] **`ADMIN_PASSWORD` is NOT set in Vercel.** Unset means there is no admin
      area on the public internet at all. This is deliberate, not an oversight
      to be tidied up later.
- [ ] **Every published position has a source URL that loads.** A dead link on
      a site whose entire promise is "check us" is worse than no link.
- [ ] **Read the methodology page end to end as if you were a candidate who
      dislikes the site.** Every claim it makes should now be true. It has been
      wrong twice — the "ten issues" count and the untested accessibility
      promise — and both times the error was a claim about ourselves.

---

## Dated, and unrecoverable if missed

### 16 September — send the candidate emails
`docs/candidate-email.md`. Earlier than the 5 October we first planned, so
replies land before the 22nd rather than after. Template B, for the nine with
nothing, is the one that matters.

Same day, and only after the mail is actually sent, run the `contacted_at`
update at the bottom of `17_candidate_contact.sql`.

### 22 September, 7–9pm — Utterson Hall, all-candidates meeting
Nine days out. For most of the nine silent candidates this is the only chance
to hear them say anything before ballots open.

- [ ] Check the recording rules with the organiser beforehand.
- [ ] Capture speaker, verbatim words, issue, and time for each statement.
- [ ] `source_type = 'all_candidates_meeting'` — takes no length claim, by
      design.
- [ ] Enter the same night while you can still hear the room.

### 30 September — PIN letters mail out
Voters start paying attention. The site should look finished by now.

### 1 October — one reminder to non-responders
One. Then stop. Chasing a candidate who has chosen not to engage starts to look
like pressure from a site claiming neutrality.

### 14 October, 10am — advance voting opens
Launch target. After this, every change is a change to something people are
actively using to decide a vote. Treat corrections as urgent from here.

### 26 October, 8pm — polls close
- [ ] Decide in advance what the site says on 27 October. Leaving a live
      comparison of candidates up after the election, with no result and no
      context, is misleading. A banner and an archive note, written now while
      you are calm, beats a decision made at midnight.

---

## Before the domain points at it

- [ ] `smartervote.ca` DNS → Vercel, with `www` redirecting to apex (or the
      reverse — just pick one and make the other a 301).
- [ ] HTTPS certificate issued and forced.
- [ ] `metadataBase` in `app/layout.tsx` matches the real domain.
- [ ] An OG image that isn't the default. It is what gets shared on Facebook,
      which is where this will actually spread in Huntsville.
- [ ] `robots.txt` and a sitemap. `/admin` excluded.
- [ ] A 404 page that offers the race list rather than a dead end.
- [ ] Test on a real phone on cellular data. Most voters will meet this site on
      a phone, standing up, with one bar.

---

## Known gaps at launch — decide, don't drift

These are not bugs. They are things the site does not do, and each needs a
decision about whether to say so publicly.

- **Nine candidates with no positions.** Ellas, Renwick, FitzGerald,
  Schumacher, Reain, Boutotte, Cazabon, Blais, Legrand. Every public source has
  been exhausted. After the emails go out, their pages will say "We asked on
  [date] — no reply yet", which is honest. Consider whether the race pages
  should carry a short note explaining why some rows are empty.
- **Two of the three school board issues have no content from anyone.** They
  are listed because they are part of the role, not because a candidate raised
  them. Marked as such in `16_social_and_school_board.sql`.
- **Social media is largely unreadable.** Facebook and Instagram show a
  logged-out visitor almost nothing, and a source only visible to signed-in
  users fails our own rule that a reader must be able to check it.
- **The tax figures do not agree.** Stone 20.8%, Ankenmann and Lowe "almost
  30%", Terziano a 37% levy increase. All correctly sourced, all incompatible.
  This is the strongest candidate for an explainer and is currently unwritten.
- **The site is English only, including the CSC MonAvenir trustee race.**
  Decided 13 September, deliberately, not by omission: Ontario francophones are
  overwhelmingly bilingual so the benefit was recognition rather than access,
  unreviewed French aimed at rights holders is worse than clear English, and a
  French mirror one person cannot keep current would say "afterthought" more
  loudly than an English page does. The reasoning is preserved in the header of
  `18_french.sql`. If anyone raises it, that is the answer — and it is a
  defensible answer, not an apology.
- **The education section does not exist.** Three explainers are drafted in
  outline only: why the tax numbers differ, Town versus District, and the
  Huntsville–Chaffey ward pairing that means you now vote for two.

---

## Not needed for launch

Resist these until after 26 October.

- Analytics beyond anonymous aggregate counts. The methodology page promises no
  IP, no cookie, no session ID, no address. Do not quietly relax that because a
  dashboard would be interesting.
- Any other municipality. The pilot is Huntsville. Expanding before this one
  has survived an actual election would be borrowing trouble.
- A comment section. Ever.
- Candidate photographs. They add nothing to a comparison of positions and
  introduce a consistency problem — some candidates have a professional
  headshot and some do not, and the page starts comparing production values.
