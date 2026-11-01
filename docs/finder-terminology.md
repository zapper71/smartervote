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

- The finder lives on its own page, not in an inline section: on a phone
  an inline finder below the tiles is easy to miss entirely, while a
  dedicated page makes the search the whole point of the screen. A
  province page shows only its Federal / Provincial / Municipal tile
  columns — no finder fields and no "Coming soon" note — until a tile is
  clicked.
- Clicking a tile goes to `/provinces/<slug>/finder?level=<level>`,
  preset to that province (the province toggle is hidden) with that
  level's language, and the cursor in the search field. A "Back to
  overview" link returns to the province page.
- Current race tiles are links when that province + level has finder
  data. Next race tiles are never clickable — there is nothing to select
  for an election years out.
- Past race tiles carry a finder link below the drop-down instead of
  being a link themselves: the drop-down is interactive content and
  cannot live inside a link.
- Tiles for a province + level with no finder data stay plain (no link,
  no finder). A finder page opened with a missing, invalid, or
  uncovered `?level=` shows a short "no finder for this yet" message
  with a back link, never a dead end.
- Municipality pages link back with the same mapping: their "Find your
  municipality/district" link goes to their province's finder page when
  one exists for that level (ON/SK municipal, BC provincial), else to
  the province overview — never to the home province list.

## Finder data coverage (as of Oct 31, 2026)

- Ontario municipalities, including ward and community aliases, from the
  static expansion index — opened by Ontario municipal tiles.
- BC electoral districts, from the same index — opened by BC provincial
  tiles.
- Saskatchewan municipalities: the 15 RMs with live pages and data
  (migrations 46 + 47), hand-maintained in `lib/sk-finder.ts` because
  the generated finder file must not be edited by hand — opened by
  Saskatchewan municipal tiles. When a new Saskatchewan municipality
  goes live, add it to `lib/sk-finder.ts`; the tile link follows
  automatically.
- Nothing else yet: federal ridings and every other province/territory
  have no finder data, so their tiles are plain. When data lands for a
  new province + level, add a case to `finderFor` in
  `lib/tracked-elections.ts`; the terminology above already covers it.

## Where it lives

- `lib/tracked-elections.ts` — `finderFor`, the province + level →
  finder mapping.
- `lib/sk-finder.ts` — the hand-maintained Saskatchewan finder list.
- `app/provinces/[province]/page.tsx` — tile links to the finder page.
- `app/provinces/[province]/finder/page.tsx` — the dedicated finder
  page (level from `?level=`, back link, no-finder message).
- `components/MunicipalityFinder.tsx` — labels, placeholders, hints, and
  no-match text per province (ON and SK = municipality, BC = district).
