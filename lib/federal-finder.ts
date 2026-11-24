/**
 * Federal byelection finder lists — hand-maintained, NOT generated.
 *
 * lib/expansion-finder.ts is a generated file (do not edit by hand) and
 * only covers Ontario municipalities + BC districts, so the six federal
 * byelection ridings (Dec 7, 2026) live here instead, in the same shape
 * as lib/sk-finder.ts. They mirror the riding entries in
 * lib/expansion-index.ts (raceType "federal_riding"): exactly the
 * ridings with live pages and data. When a new federal riding goes
 * live, add its index slug + display name to its province's list so
 * the finder picks it up. Slugs must match the index or the finder
 * link 404s.
 */
import type { FinderMunicipality } from "@/lib/expansion-finder";

export const FINDER_FEDERAL_ON: FinderMunicipality[] = [
  { slug: "brantford-brant-south", name: "Brantford–Brant South" },
  { slug: "scarborough-north", name: "Scarborough North" },
];

export const FINDER_FEDERAL_QC: FinderMunicipality[] = [
  { slug: "laurier-sainte-marie", name: "Laurier–Sainte-Marie" },
  { slug: "rosemont-la-petite-patrie", name: "Rosemont–La Petite-Patrie" },
  { slug: "saint-hyacinthe-bagot-acton", name: "Saint-Hyacinthe–Bagot–Acton" },
];

export const FINDER_FEDERAL_SK: FinderMunicipality[] = [
  { slug: "yorkton-melville", name: "Yorkton–Melville" },
];
