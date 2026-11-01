# Finder terminology

User-facing words for the area a voter belongs to, by level of government.
These words are used in the province-page finder (labels, hints, no-match
text, and the tile links that open it). Do not mix them across levels.

## Level language

| Level | Singular | Plural | Finder text |
|---|---|---|---|
| Federal | riding | ridings | "Find your riding" (when a federal finder exists) |
| Provincial / territorial | district | districts | "Find your district" |
| Municipal | municipality | municipalities | "Find your municipality" |

Notes on the choices:

- The official term for both federal and provincial areas is "electoral
  district". The site deliberately splits them: federal uses "riding"
  (the common Canadian word), provincial/territorial uses "district", so
  a voter never wonders which level a "district" belongs to.
- BC's official term is "electoral district"; the finder shortens it to
  "district" ("Find your district", "N BC districts").
- Ontario provincial districts are also colloquially called "ridings";
  the site still uses "district" for the provincial level, to keep it
  distinct from federal ridings.
- "Municipality" covers every local form in finder UI (city, town,
  village, and, when covered, rural municipality or hamlet) — the finder
  does not split local forms into separate words.

## Finder behaviour (province pages)

- The finder is hidden until a tile opens it. There is no always-visible
  finder section and no "Coming soon" note: a province page shows only
  its Federal / Provincial / Municipal tile columns until a tile is
  clicked.
- Clicking a tile opens the finder via `?finder=<level>` on the same
  province page, preset to that province (the province toggle is hidden)
  with that level's language. A "Back to overview" link closes it (plain
  province URL).
- Current race tiles are links when that province + level has finder
  data. Next race tiles are never clickable — there is nothing to select
  for an election years out.
- Past race tiles carry a finder link below the drop-down instead of
  being a link themselves: the drop-down is interactive content and
  cannot live inside a link.
- Tiles for a province + level with no finder data stay plain (no link,
  no finder). No finder section renders for an invalid `?finder=` value.

## Finder data coverage (as of Oct 31, 2026)

- Ontario municipalities, including ward and community aliases, from the
  static expansion index — opened by Ontario municipal tiles.
- BC electoral districts, from the same index — opened by BC provincial
  tiles.
- Nothing else yet: federal ridings and every other province/territory
  have no finder data, so their tiles are plain. When data lands for a
  new province + level, add a case to `finderFor` in
  `app/provinces/[province]/page.tsx`; the terminology above already
  covers it.

## Where it lives

- `app/provinces/[province]/page.tsx` — `finderFor`, tile links, the
  gated finder section.
- `components/MunicipalityFinder.tsx` — labels, placeholders, hints, and
  no-match text per province (ON = municipality, BC = district).
