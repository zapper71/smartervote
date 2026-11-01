"use client";

import { useState } from "react";
import type { TileRow } from "@/lib/tracked-elections";

/**
 * Past races for one tile, as a drop-down. Past races have no dedicated
 * pages yet (historical loading is deferred), so choosing one shows its
 * label and date below the drop-down rather than navigating anywhere.
 */
export default function PastRacesDropdown({ races }: { races: TileRow[] }) {
  const [selected, setSelected] = useState(0);
  const race = races[selected] ?? races[0];
  if (!race) return null;

  return (
    <div>
      <label className="sr-only" htmlFor="past-races">
        Choose a past race
      </label>
      <select
        id="past-races"
        value={selected}
        onChange={(e) => setSelected(Number(e.target.value))}
        className="mt-2 w-full rounded border border-paper-edge bg-white px-3 py-2 text-ink-soft"
      >
        {races.map((r, i) => (
          <option key={i} value={i}>
            {r.label ? `${r.label} — ${r.date}` : r.date}
          </option>
        ))}
      </select>
      <p className="mt-2 text-ink-soft">
        {race.label ? `${race.label} — ${race.date}` : race.date}
      </p>
    </div>
  );
}
