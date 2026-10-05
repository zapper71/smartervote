"use client";

/**
 * Scroll cues for the desktop compare table.
 *
 * The table is long and its native horizontal scrollbar sits at the bottom
 * of the page, so visitors never see it and assume the off-screen candidates
 * are missing. These two cues fix discoverability:
 *
 * - CompareScrollHint: a "Scroll right to see all N candidates →" line above
 *   the table, rendered only while the table actually overflows.
 * - CompareFloatingBar: a slim pill pinned to the viewport bottom (sticky)
 *   while the comparison section is on screen. It holds ‹ › step buttons and
 *   a thin scrollbar synced with the table in both directions, so the scroll
 *   control is always where the visitor's eyes are.
 *
 * Both hide on mobile (the cards stack vertically there — nothing scrolls
 * sideways) and both disappear entirely when every column fits on screen.
 * The table keeps its own native scrollbar and edge shadows; this is purely
 * additive. Small, reversible, no data impact.
 */

import { useEffect, useRef, useState } from "react";

const SCROLL_TARGET_ID = "compare-scroll";
/** One candidate column is w-80 (20rem = 320px); the step buttons move by one. */
const COLUMN_STEP_PX = 320;

/** True while the compare table overflows its container horizontally. */
function useCompareOverflow(targetId: string) {
  const [table, setTable] = useState<HTMLElement | null>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setTable(el);
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  return { table, overflows };
}

export function CompareScrollHint({
  candidateCount,
}: {
  candidateCount: number;
}) {
  const { overflows } = useCompareOverflow(SCROLL_TARGET_ID);
  if (!overflows) return null;
  return (
    <p className="mb-2 hidden text-right text-xs text-ink-faint md:block">
      Scroll right to see all {candidateCount} candidates{" "}
      <span aria-hidden="true">→</span>
    </p>
  );
}

export function CompareFloatingBar() {
  const { table, overflows } = useCompareOverflow(SCROLL_TARGET_ID);
  const barRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const spacer = spacerRef.current;
    if (!overflows || !table || !bar || !spacer) return;

    // Size the spacer so the pill's scroll range exactly matches the
    // table's: then positions map 1:1 with no ratio math to drift.
    const fitSpacer = () => {
      const tableRange = table.scrollWidth - table.clientWidth;
      spacer.style.width = `${Math.max(0, bar.clientWidth + tableRange)}px`;
    };
    fitSpacer();
    const ro = new ResizeObserver(fitSpacer);
    ro.observe(table);
    ro.observe(bar);
    window.addEventListener("resize", fitSpacer);

    // Two-way sync. lastBarWrite remembers the exact position the pill
    // set, so when the table's echo of that write arrives we recognize it
    // and don't yank the pill back mid-drag. (That yank is what felt
    // choppy: a fast drag outran the echo, and every echo shoved the
    // thumb backwards.) Writes from anywhere else — step buttons,
    // keyboard, the table's own scrollbar — never match lastBarWrite,
    // so they sync through to the pill normally.
    const lastBarWrite = { current: -1 };
    const onTableScroll = () => {
      if (Math.abs(table.scrollLeft - lastBarWrite.current) < 1) return;
      const target = table.scrollLeft;
      if (Math.abs(bar.scrollLeft - target) > 0.5) bar.scrollLeft = target;
    };
    const onBarScroll = () => {
      const target = bar.scrollLeft;
      if (Math.abs(table.scrollLeft - target) > 0.5) {
        lastBarWrite.current = target;
        table.scrollLeft = target;
      }
    };
    table.addEventListener("scroll", onTableScroll, { passive: true });
    bar.addEventListener("scroll", onBarScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fitSpacer);
      table.removeEventListener("scroll", onTableScroll);
      bar.removeEventListener("scroll", onBarScroll);
    };
  }, [table, overflows]);

  if (!overflows) return null;

  const step = (dir: 1 | -1) =>
    table?.scrollBy({ left: dir * COLUMN_STEP_PX, behavior: "smooth" });
  const btn =
    "tap-target flex h-8 w-8 items-center justify-center rounded-full text-base text-ink-soft hover:bg-accent-light hover:text-accent";

  return (
    <div
      role="group"
      aria-label="Scroll the candidate table sideways"
      className="sticky bottom-3 z-30 hidden justify-center md:flex"
    >
      <div className="flex items-center gap-1 rounded-full border border-paper-edge bg-paper-warm/95 py-1 pl-1 pr-2 shadow-lg backdrop-blur">
        <button type="button" className={btn} aria-label="Scroll table left" onClick={() => step(-1)}>
          <span aria-hidden="true">‹</span>
        </button>
        <div
          ref={barRef}
          className="compare-floatbar w-[min(24rem,40vw)] overflow-x-auto overflow-y-hidden"
        >
          <div ref={spacerRef} className="h-2.5" />
        </div>
        <button type="button" className={btn} aria-label="Scroll table right" onClick={() => step(1)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Pins the candidate header row (names + links) to the viewport top while
 * the comparison table scrolls underneath.
 *
 * Why JS instead of `sticky top-0`: the table sits inside an overflow-x:auto
 * wrapper for the horizontal scroll, and any non-visible overflow on an
 * ancestor captures sticky positioning — the thead would stick to the
 * wrapper, which never scrolls vertically. So we clone the rendered thead
 * into a fixed bar and toggle it on scroll. Columns are fixed-width
 * (w-48/w-80 with table-fixed), so the clone — which copies the thead's
 * classes verbatim — lines up with the table exactly.
 *
 * The clone is aria-hidden with its links taken out of tab order, so
 * keyboard and screen-reader users keep one single set of links (the real
 * header); sighted mouse users get a clickable pinned header.
 */
export function StickyCompareHead() {
  useEffect(() => {
    const scroller = document.getElementById(SCROLL_TARGET_ID);
    const table = scroller?.querySelector("table");
    const thead = table?.querySelector("thead");
    if (!scroller || !table || !thead) return;

    const bar = document.createElement("div");
    bar.setAttribute("aria-hidden", "true");
    bar.style.cssText =
      "position:fixed;top:0;left:0;z-index:40;display:none;" +
      "box-shadow:0 2px 10px rgb(26 35 50 / 0.10);";
    const clone = document.createElement("table");
    clone.className = table.className;
    const headClone = thead.cloneNode(true) as HTMLElement;
    headClone
      .querySelectorAll("a,button")
      .forEach((el) => el.setAttribute("tabindex", "-1"));
    clone.appendChild(headClone);
    bar.appendChild(clone);
    document.body.appendChild(bar);

    // Positions the bar exactly over the table. Must run on the table's
    // own horizontal scrolls too: tableRect.left moves as the table
    // scrolls sideways, and a stale left is precisely a visible
    // header/column misalignment.
    const position = () => {
      const r = table.getBoundingClientRect();
      const headH = thead.getBoundingClientRect().height || 0;
      // The desktop table is hidden below md, so its rects are zero there
      // and the bar simply never appears on mobile.
      const stick = r.top < 0 && r.bottom > headH + 4 && r.width > 0;
      bar.style.display = stick ? "block" : "none";
      if (!stick) return;
      bar.style.left = `${r.left}px`;
      bar.style.width = `${r.width}px`;
      clone.style.width = `${r.width}px`;
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          position();
        });
      }
    };
    position();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    scroller.addEventListener("scroll", position, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      scroller.removeEventListener("scroll", position);
      bar.remove();
    };
  }, []);

  return null;
}
