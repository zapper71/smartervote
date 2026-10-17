"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// SSR has no layout to measure; the client pass does the measuring.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Clamp content to a preset number of lines, with a "Read more" / "Show
 * less" control that expands the cell in place.
 *
 * The control renders ONLY when the content actually overflows the clamp:
 * a ref + ResizeObserver compares scrollHeight against the clamped box
 * (clientHeight), so the check holds under any font size, zoom level, or
 * column width — it is not an estimate from content length. When the box
 * is expanded there is nothing to measure, so the control stays visible
 * because the user asked to expand, not because of a fresh measurement.
 *
 * Used by the compare page for bio and issue cells.
 */
export default function Clampable({
  children,
  lines = 5,
  className = "",
}: {
  children: React.ReactNode;
  /** Preset clamp height in lines. */
  lines?: number;
  className?: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      // While clamped, clientHeight is the clamp box and scrollHeight the
      // full content: a gap over 1px means the control is needed.
      setOverflows(el.scrollHeight - el.clientHeight > 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Web-font swaps after first paint can grow or shrink the content; a
    // ResizeObserver usually fires on those shifts too, but this covers
    // engines where it does not.
    const done = document.fonts?.ready.then(() => measure());
    done?.catch(() => {});
    return () => ro.disconnect();
  }, [expanded]);

  // Inline styles rather than a line-clamp-N Tailwind class: Tailwind's JIT
  // only generates class names it sees literally in source, so a dynamic
  // line count would silently lose its clamp.
  const clampStyle = expanded
    ? undefined
    : {
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical" as const,
        overflow: "hidden",
      };

  return (
    <div className={className}>
      <div ref={innerRef} style={clampStyle}>
        {children}
      </div>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          // min-h-[24px]: same WCAG 2.2 SC 2.5.8 reasoning as the quote
          // toggle in PositionCell — the control sits on its own line, so
          // the 24px minimum applies.
          className="link mt-2 inline-flex min-h-[24px] cursor-pointer items-center text-xs font-medium"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
