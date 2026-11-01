/**
 * Saskatchewan finder list — hand-maintained, NOT generated.
 *
 * lib/expansion-finder.ts is a generated file (do not edit by hand), so
 * the Saskatchewan entries live here instead. They mirror the 15 RMs
 * published in migrations 46 + 47 and listed in lib/expansion-index.ts
 * (province "SK"): exactly the municipalities with live pages and data.
 * When a new Saskatchewan municipality goes live, add its index slug +
 * display name here so the Saskatchewan finder (and its province-page
 * tile link) picks it up. Slugs must match the index or the finder link
 * 404s.
 */
import type { FinderMunicipality } from "@/lib/expansion-finder";

export const FINDER_SASKATCHEWAN: FinderMunicipality[] = [
  { slug: "blucher-no-343", name: "RM of Blucher No. 343" },
  { slug: "britannia-no-502", name: "RM of Britannia No. 502" },
  { slug: "buckland-no-491", name: "RM of Buckland No. 491" },
  { slug: "corman-park-no-344", name: "RM of Corman Park No. 344" },
  { slug: "dundurn-no-314", name: "RM of Dundurn No. 314" },
  { slug: "edenwold-no-158", name: "RM of Edenwold No. 158" },
  { slug: "grayson-no-184", name: "RM of Grayson No. 184" },
  { slug: "gull-lake-no-139", name: "RM of Gull Lake No. 139" },
  { slug: "laird-no-404", name: "RM of Laird No. 404" },
  { slug: "lomond-no-37", name: "RM of Lomond No. 37" },
  { slug: "meadow-lake-no-588", name: "RM of Meadow Lake No. 588" },
  { slug: "meota-no-468", name: "RM of Meota No. 468" },
  { slug: "prince-albert-no-461", name: "RM of Prince Albert No. 461" },
  { slug: "rosthern-no-403", name: "RM of Rosthern No. 403" },
  { slug: "vanscoy-no-345", name: "RM of Vanscoy No. 345" },
];
