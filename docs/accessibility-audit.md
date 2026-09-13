# Accessibility audit — WCAG 2.2 AA

**Audited 13 September 2026, against version `2026-09-13.19`.**

The methodology page states the site targets WCAG 2.2 Level AA and is built to
meet Ontario's AODA requirements. That claim had never been tested. This is the
test, what it found, and what it still cannot tell you.

---

## Fixed

### 1.4.3 Contrast (Minimum) — FAILED, now fixed

`ink-faint`, the grey used for every source line, date, extent note and voter
question, was `#6b7787`.

| Background | Ratio | Verdict |
|---|---|---|
| `paper` white `#ffffff` | 4.55:1 | pass, barely |
| `paper-warm` `#faf9f7` | **4.33:1** | **fail** |

`paper-warm` is the `<body>` background and every other row of the comparison
table, so this failed across most of the site. The irony matters: it was the
colour used for the *evidence* — the source, the date, the link a reader clicks
to check us — rendered in the one shade hardest to read.

Darkened to `#616d7c`: **5.0:1 on warm, 5.3:1 on white.**

### 2.5.8 Target Size (Minimum) — FAILED, now fixed

The "Show their words & source" control was a `<summary>` at `text-xs`, about
16px tall against a 24×24 minimum. The inline exception doesn't rescue it: it
sits on its own line rather than within a sentence. Now `min-h-[24px]`.

This is the control a reader uses to check our evidence. It should not have
been the hardest thing on the page to hit.

### 2.4.11 Focus Not Obscured (Minimum) — AT RISK, now fixed

The comparison table has a horizontally sticky issue column (`w-48`). Tabbing
to a link in the leftmost visible cell scrolls it flush against that column,
which then sits on top of it. Added `scroll-pl-48` to the scroll container, so
the browser leaves the sticky column's width clear when it scrolls a focused
element into view.

### 1.4.1 Use of Colour — WEAK, now fixed

Links are distinguished from body text by being teal *and* underlined. The
underline is the part that works for a colour-blind reader — and it was set at
40% opacity, close to invisible on small text. A cue in name only. Now 70%.

---

## Passed

| Criterion | Finding |
|---|---|
| 1.3.1 Info and Relationships | Comparison table has `<caption>`, `scope="col"` on candidate headers, `scope="row"` on issue headers, proper `thead`/`tbody`. |
| 1.3.2 Meaningful Sequence | Duplicate desktop/mobile layouts use `hidden md:block` and `md:hidden`. `display:none` removes from the accessibility tree, so exactly one is ever exposed — no duplicate announcement. |
| 1.4.3 Contrast, other colours | `ink` 15.8:1 · `ink-soft` 9.0:1 · `accent` links 7.7:1 · Conflicting pill (`red-800` on `red-50`) 7.6:1 · white on `accent` buttons 7.7:1. |
| 1.4.11 Non-text Contrast | Focus ring is 2px `accent` — about 7.4:1, well over the 3:1 required. |
| 2.1.1 Keyboard | No custom widgets. Native `details`/`summary`, native form controls, real links. |
| 2.4.1 Bypass Blocks | Skip link present, correctly `sr-only focus:not-sr-only`, targets `<main id="main">`. |
| 2.3.3 Animation from Interactions | `prefers-reduced-motion` honoured, including disabling smooth scroll. |
| 3.1.1 Language of Page | `lang="en-CA"`. |
| 3.3.2 Labels or Instructions | Every input on the corrections form has an `id` and a matching `<label htmlFor>`. Status region is `aria-live="polite"`. |
| 3.3.8 Accessible Authentication | No CAPTCHA anywhere. The bot defence is a honeypot — and it is done correctly: `tabIndex={-1}` and `autoComplete="off"` inside `aria-hidden`, so it is neither a keyboard trap nor announced to a screen reader. |
| 4.1.2 Name, Role, Value | Links carry `sr-only` context ("— Louisa Chiaramonte's campaign website, opens in a new tab") rather than bare domain names. |

---

## What this audit cannot tell you

I read code and computed contrast ratios. That catches a specific and useful
class of problem, and it is not the same as using the site.

**These need you, on a real screen reader:**

1. **The comparison table with VoiceOver.** The single most important thing to
   test. When you arrow into a cell, does VO announce both the candidate
   (column header) and the issue (row header)? Sticky positioning sometimes
   confuses header association even when the markup is right. `Ctrl+Option+→`
   through a few cells and listen.
2. **`details`/`summary` state.** Does VO say "collapsed"/"expanded" when you
   toggle a quote open? It should, natively, but Safari has been inconsistent.
3. **The extent note in the summary.** "Show their words & source (a page or
   more)" — confirm that reads as one coherent phrase rather than a fragment.
4. **Keyboard path, end to end.** Tab from the top of a compare page to the
   bottom without a mouse. Watch for focus disappearing behind the sticky
   column — that is the fix above, and it needs confirming in a real browser.
5. **200% zoom, and 320px width.** SC 1.4.10 Reflow and 1.4.4 Resize Text. The
   comparison table scrolls horizontally by design, which is permitted for
   data tables, but check nothing is clipped or unreachable.

**One thing I'd change regardless of what the tools say.** On a screen reader
the compare page announces a large table of mostly-empty cells. It is
technically correct and genuinely tedious. Before launch, consider whether the
mobile grouped-by-issue layout should be the default for screen reader users
too — it reads as a sequence of headings and short statements, which is a much
better experience than a 6×12 grid.

---

## Re-check after any change to

- `tailwind.config.ts` colours — every ratio above depends on those four values
- `globals.css` — `.link`, `.tap-target`, `:focus-visible`
- `PositionCell.tsx` — the empty states and the summary control are the most
  frequently rendered text on the site
- The comparison table's sticky column
