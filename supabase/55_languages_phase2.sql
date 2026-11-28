-- =====================================================================
-- SmarterVote — migration 55: Phase 2 languages (Nov 28, 2026)
--
-- Adds Simplified Chinese, Traditional Chinese, Tamil, Punjabi.
-- Rows land DISABLED (is_enabled = false): the switcher only shows
-- enabled languages, so nothing appears on the site until the Phase 2
-- code lands and the enable UPDATE runs. Safe to run now.
--
-- Codes (BCP 47): zh-Hans (Simplified), zh-Hant (Traditional),
-- ta (Tamil), pa (Punjabi, Gurmukhi script).
-- Flags: Simplified Chinese gets flags/china.svg (added in this
-- branch). Traditional, Tamil and Punjabi have no flag — the switcher
-- shows their native name instead (a flag would be wrong for all
-- three: Traditional spans Hong Kong/Taiwan, Tamil and Punjabi are
-- languages, not countries).
--
-- Run in the Supabase SQL editor. VERIFY at the end expects:
-- 6 languages total, the 4 new ones all is_enabled = false.
-- =====================================================================

insert into languages (code, name, native_name, flag_asset, is_default, is_enabled, sort_order)
values
    ('zh-Hans', 'Chinese (Simplified)', '简体中文', 'flags/china.svg', false, false, 3),
    ('zh-Hant', 'Chinese (Traditional)', '繁體中文', NULL, false, false, 4),
    ('ta', 'Tamil', 'தமிழ்', NULL, false, false, 5),
    ('pa', 'Punjabi', 'ਪੰਜਾਬੀ', NULL, false, false, 6)
on conflict (code) do nothing;

-- VERIFY
select code, name, native_name, flag_asset, is_enabled from languages order by sort_order;
