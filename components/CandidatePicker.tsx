"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Candidate } from "@/lib/types";

/**
 * Narrowing, not gating.
 *
 * Everyone is selected when you arrive. That is deliberate: if a voter had to
 * choose who to compare before seeing anything, they would pick the names they
 * recognise — which favours incumbents and anyone with lawn signs, and buries
 * first-time candidates. The default view is the complete one; this is a
 * convenience for narrowing down afterwards.
 *
 * Selection is written to the URL so a comparison can be shared or bookmarked.
 * It also means this works without JavaScript: the form submits as a GET.
 */
export default function CandidatePicker({
  candidates,
  selected,
  raceSlug,
}: {
  candidates: Candidate[];
  selected: string[];
  raceSlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === candidates.length;
  // In a crowded race (more than 10 candidates) ticking one checkbox at a
  // time is tedious, so bulk controls appear. Races with 10 or fewer
  // candidates keep exactly the UI they had before — no extra controls.
  const showBulkControls = candidates.length > 10;
  // Controlled checkboxes so "Select all" / "Deselect all" can flip the whole
  // list at once. The form still submits as GET with `only` params, exactly
  // as before.
  const [checked, setChecked] = useState<Set<string>>(() => new Set(selected));

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="candidate-picker"
        className="tap-target rounded-md border border-paper-edge bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
      >
        {allSelected
          ? `Comparing all ${candidates.length} candidates`
          : `Comparing ${selected.length} of ${candidates.length}`}
        <span aria-hidden="true" className="ml-2 text-ink-faint">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <form
          id="candidate-picker"
          method="GET"
          action={`/races/${raceSlug}/compare`}
          className="mt-3 rounded-lg border border-paper-edge bg-paper p-4"
        >
          <fieldset>
            <legend className="text-sm font-medium text-ink">
              Choose who to compare
            </legend>
            <p className="mt-1 text-sm text-ink-faint">
              All candidates are shown by default. Narrowing is just for
              readability — it doesn&rsquo;t change anything about the comparison.
            </p>
            {showBulkControls && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setChecked(new Set(candidates.map((c) => c.slug)))
                  }
                  className="tap-target rounded-md border border-paper-edge bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setChecked(new Set())}
                  className="tap-target rounded-md border border-paper-edge bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
                >
                  Deselect all
                </button>
              </div>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {candidates.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="only"
                    value={c.slug}
                    checked={checked.has(c.slug)}
                    onChange={(e) => {
                      setChecked((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(c.slug);
                        else next.delete(c.slug);
                        return next;
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-ink-soft">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Compare selected
            </button>
            <button
              type="button"
              onClick={() => {
                router.push(`/races/${raceSlug}/compare`);
                setOpen(false);
              }}
              className="tap-target rounded-md border border-paper-edge px-4 py-2 text-sm"
            >
              Show everyone
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
