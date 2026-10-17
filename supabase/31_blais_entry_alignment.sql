-- =====================================================================
-- SmarterVote.ca — align every Donald Blais candidate entry with the
-- Huntsville entry (migration 31, Andreas's request, 2026-10-17).
--
-- Donald Blais is the single CSC MonAvenir (French Catholic) trustee
-- candidate for Simcoe Muskoka; the expansion seeded one candidate row
-- per municipality whose ballot carries that race — 20 rows beyond
-- Huntsville's original. They drifted:
--   * bios: only 4 rows have one, in THREE different wordings
--     (Bracebridge short-fragment version; Georgian Bay / Lake of Bays /
--     Muskoka Lakes long version) — none identical to Huntsville's, and
--     the second Bracebridge race row has no bio at all;
--   * website: votedonaldblais.ca set on only 4 rows;
--   * Wasaga Beach's row is misspelled "Donald Blaise"
--     (slug wasaga-beach-donald-blaise).
--
-- This copies name / website / bio / photo_url FROM the Huntsville row
-- itself (slug 'donald-blais'), so the copies can never drift from the
-- reference text, and fixes the Wasaga Beach name + slug. Contact
-- fields (email / phone) are deliberately left alone.
--
-- Idempotent: re-running after a successful run changes nothing.
-- =====================================================================

begin;

update candidates c
set name       = 'Donald Blais',
    slug       = replace(c.slug, 'donald-blaise', 'donald-blais'),
    website    = h.website,
    bio        = h.bio,
    photo_url  = h.photo_url,
    updated_at = now()
from candidates h
where h.slug = 'donald-blais'
  and c.id <> h.id
  and (c.slug like '%-donald-blais' or c.slug like '%-donald-blaise');

commit;

-- ---------------------------------------------------------------------
-- VERIFY — expect 20 rows (every non-Huntsville Blais entry), all with
-- name_matches / website_matches / bio_matches = true, and the Wasaga
-- Beach row renamed to donald-blais.
-- ---------------------------------------------------------------------
select c.slug,
       c.name = h.name       as name_matches,
       c.website = h.website as website_matches,
       c.bio = h.bio         as bio_matches
from candidates c, candidates h
where h.slug = 'donald-blais'
  and c.id <> h.id
  and (c.slug like '%-donald-blais' or c.slug like '%-donald-blaise')
order by c.slug;
