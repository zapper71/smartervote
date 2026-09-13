/** Election dates are fixed facts, so these are safe to hard-code as fallbacks. */
export const VOTING_DAY = "2026-10-26";
export const ADVANCE_VOTING_OPENS = "2026-10-14";

/**
 * Days between today and a date, floored at zero.
 * Uses UTC midnight on both sides so the answer doesn't flicker by one
 * depending on the visitor's timezone.
 */
export function daysUntil(iso: string | null | undefined, from: Date = new Date()): number | null {
  if (!iso) return null;
  const target = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  const today = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  return Math.max(0, Math.round((target - today) / 86_400_000));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "4 candidates for 1 seat" — the sentence that makes a race legible. */
export function contestLabel(candidateCount: number, seats: number): string {
  const c = `${candidateCount} candidate${candidateCount === 1 ? "" : "s"}`;
  const s = `${seats} seat${seats === 1 ? "" : "s"}`;
  if (candidateCount === 0) return `No candidates listed · ${s}`;
  if (candidateCount <= seats) return `${c} for ${s} · acclaimed`;
  return `${c} for ${s}`;
}
