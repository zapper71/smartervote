# Writing to the candidates

**You send these. I don't send email on your behalf, and shouldn't.**

Everything below is a draft. Read it, change what doesn't sound like you, and
send from `support.smartervote.ca@gmail.com`. Your personal address stays off
this entirely.

---

## Before you send

1. Run the mail-merge query at the bottom of `17_candidate_contact.sql`. It
   returns every candidate, their email from the Town's certified list, and
   exactly what the site currently holds for them. Run it the day you send, so
   nothing you tell them is out of date.
2. The list splits into two groups. Use Template A for the 19 candidates we
   have positions for, Template B for the nine we don't.
3. Send individually, not as a bulk BCC. Twenty-eight separate emails is an
   hour, and a candidate who can see they were one of twenty-eight recipients
   will read it as spam rather than as an invitation.
4. **The same day you send, run the update at the bottom of
   `17_candidate_contact.sql`.** That flips every blank cell on the site from
   "No public statement found" to "We asked on 16 Sep — no reply yet." Do not
   run it before the emails go, or the site will be making a claim you haven't
   yet earned.

## Timing

Earlier than the 5 October date we'd penciled in. Sending mid-September means
replies land before the 22 September meeting rather than after it, and a
candidate who has already heard from you is far more likely to talk to you at
Utterson Hall. Give them a reply-by date before advance voting opens on
14 October, but make clear it isn't a cut-off.

---

## Template A — candidates we already have positions for

> **Subject:** Your page on SmarterVote.ca — please check it
>
> Dear [NAME],
>
> I'm a Huntsville resident running SmarterVote.ca, a free, non-partisan site
> that puts every candidate in each race side by side on the same issues, using
> their own words with a link to the source.
>
> You have a page. I'd like you to check it before voting opens on 14 October:
>
> **[LINK TO THEIR PAGE]**
>
> Right now it shows [N] positions, drawn from [SOURCE — their website, Doppler,
> etc.]. Every one carries a direct quote and a link to where it came from. The
> issues where I haven't found anything from you are marked as such.
>
> Three things I'd ask:
>
> 1. **Is anything wrong?** If I've misquoted you, taken something out of
>    context, or summarised it in a way you wouldn't recognise, tell me and I'll
>    fix it. Corrections from candidates go to the front of the queue.
> 2. **Anything missing?** If you've said something on an issue that shows as
>    blank, send it and I'll add it with a source.
> 3. **Is your contact information right?** I've used what the Town published.
>
> A few things it may help to know. I don't endorse, rank or score anyone, and
> there's no comment section. Every candidate gets the same template and the
> same list of issues, in the same order. Nothing comes from anonymous sources —
> if it's on the page, it's something you published or something a reporter
> quoted you saying. I'm not registered as a third-party advertiser, and my
> reasoning for that is set out publicly at smartervote.ca/methodology so it can
> be checked rather than assumed.
>
> No reply is needed if the page looks right to you. If it doesn't, I'd rather
> hear from you than have a voter find the mistake.
>
> Andreas Zapletal
> SmarterVote.ca
> support.smartervote.ca@gmail.com

---

## Template B — the nine candidates with nothing

These are the ones this whole exercise is for: Brian Ellas, Helena Renwick,
Jason FitzGerald, Dione Schumacher, Bruce Reain, Joshua Boutotte, Bruce
Cazabon, Donald Blais, Innocent Legrand.

No website, no press coverage, no readable social media. Their pages are empty
not because they have nothing to say but because there is nowhere public to
find it. **Do not send Template A to these nine** — telling someone their page
is empty and asking them to check it reads as an accusation.

> **Subject:** A page for you on SmarterVote.ca — I'd like to fill it in
>
> Dear [NAME],
>
> I'm a Huntsville resident running SmarterVote.ca, a free, non-partisan site
> that puts every candidate in each race side by side on the same issues, using
> their own words with a link to the source.
>
> You have a page:
>
> **[LINK TO THEIR PAGE]**
>
> It's largely empty, and I want to be straight with you about why. I've
> searched the Town's certified candidate list, Huntsville Doppler, and what's
> publicly visible online, and I haven't found positions from you on the issues
> the site covers. That's a limit of where I've been able to look, not a
> judgment about you — and I don't want a voter reading your page to mistake one
> for the other.
>
> So I'm asking directly. The issues are:
>
> [PASTE THE ISSUE LIST FOR THEIR RACE — 12 municipal, or 3 for school board]
>
> A sentence or two on any of them is enough. Write as much or as little as you
> like, on whichever ones matter to you. I'll publish it as your own words with
> the date, attributed to you directly.
>
> If you'd rather not take part, that's completely fine — just say so and I'll
> note that you were asked and chose not to, which is a fairer thing for your
> page to say than nothing at all.
>
> Some things worth knowing. I don't endorse, rank or score anyone. Every
> candidate gets the same template and the same issues in the same order. There
> is no comment section and no advertising. You can see exactly how it works at
> smartervote.ca/methodology.
>
> I'd genuinely rather have your words than an empty page.
>
> Andreas Zapletal
> SmarterVote.ca
> support.smartervote.ca@gmail.com

---

## When they reply

- **They send positions.** Enter them as you would any source:
  `source_type = 'candidate_submission'`, source title "Sent to SmarterVote by
  the candidate", the date they sent it. They still go through `/admin` like
  everything else — a candidate's own words get a quote and a date, not a free
  pass past review.
- **They decline.** Set `responded_at` and note it. "We asked and they declined"
  is a different fact from "we asked and heard nothing", and both are fairer
  than a bare blank.
- **The address bounces.** Record it in `contact_note`. A bounced email is not
  a candidate ignoring you, and if you don't write it down you will forget the
  difference by October.
- **They're angry.** Likely at some point, and usually about a quote's context
  rather than its accuracy. The corrections process exists for exactly this:
  log it, review it, answer it. Don't argue by email.

## What not to do

- Don't offer to write their positions for them.
- Don't send a follow-up more than once. One reminder, around 1 October, then
  stop. Chasing a candidate who has chosen not to engage starts to look like
  pressure from a site claiming to be neutral.
- Don't treat a reply as an endorsement of the site, and don't quote candidates
  praising it. That's the fastest way to lose the non-partisan claim.
