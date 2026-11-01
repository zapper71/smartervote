-- =====================================================================
-- Migration 46 (draft; renumbered Oct 29 from 45 -- 45 is already applied
-- in production as link-click counting) -- Saskatchewan RM Nov 9, 2026, first batch
--
-- PREPARE ONLY -- Andreas runs this in the Supabase SQL Editor
-- after reviewing. Nothing here runs or publishes by itself.
--
-- 7 RMs, 20 division races, 31 candidates -- ONLY what was verified
-- from each RM's own site/notice (see generator header). Races and
-- candidates not verified are omitted, not guessed. Edenwold candidates
-- verified Oct 29 from the RM's candidate profiles on its election page.
-- Race type 'council_ward' = division analogue (existing check).
-- Issues: approved RM set (11, municipal) + trustee set (2).
-- Idempotent: ON CONFLICT DO NOTHING, existing rows untouched.
-- Municipality pages ALSO need the static index patch (see
-- sk-nov9-index-patch.json) -- DB seeding alone does not make
-- a municipality page appear, it renders from expansion-index.ts.
-- =====================================================================

begin;

insert into municipalities
    (name, slug, province, election_date, official_url, coverage_status)
values
    ('RM of Corman Park No. 344', 'corman-park-no-344', 'SK', '2026-11-09', 'https://rmcormanpark.ca/281/Elections-and-Voting', 'partial'),
    ('RM of Laird No. 404', 'laird-no-404', 'SK', '2026-11-09', 'https://rmoflaird.ca/category/current-posts/', 'partial'),
    ('RM of Lomond No. 37', 'lomond-no-37', 'SK', '2026-11-09', 'https://rm37.ca/notice-of-abandonment-of-poll-4/', 'partial'),
    ('RM of Meota No. 468', 'meota-no-468', 'SK', '2026-11-09', 'https://www.rmmeota468.ca/', 'partial'),
    ('RM of Grayson No. 184', 'grayson-no-184', 'SK', '2026-11-09', 'http://www.rmofgrayson184.ca/home.html', 'partial'),
    ('RM of Gull Lake No. 139', 'gull-lake-no-139', 'SK', '2026-11-09', 'https://rmgulllake.ca/council-staff/', 'partial'),
    ('RM of Edenwold No. 158', 'edenwold-no-158', 'SK', '2026-11-09', 'http://rmedenwold.ca/election-information', 'partial')
on conflict (slug) do nothing;

insert into issues
    (municipality_id, name, slug, voter_question, description, sort_order, applies_to)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order, v.applies_to
from municipalities m
join (values
    ('corman-park-no-344', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('corman-park-no-344', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('corman-park-no-344', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('corman-park-no-344', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('corman-park-no-344', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('corman-park-no-344', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('corman-park-no-344', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('corman-park-no-344', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('corman-park-no-344', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('corman-park-no-344', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('corman-park-no-344', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('corman-park-no-344', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('corman-park-no-344', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('laird-no-404', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('laird-no-404', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('laird-no-404', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('laird-no-404', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('laird-no-404', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('laird-no-404', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('laird-no-404', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('laird-no-404', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('laird-no-404', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('laird-no-404', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('laird-no-404', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('laird-no-404', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('laird-no-404', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('lomond-no-37', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('lomond-no-37', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('lomond-no-37', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('lomond-no-37', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('lomond-no-37', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('lomond-no-37', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('lomond-no-37', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('lomond-no-37', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('lomond-no-37', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('lomond-no-37', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('lomond-no-37', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('lomond-no-37', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('lomond-no-37', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('meota-no-468', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('meota-no-468', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('meota-no-468', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('meota-no-468', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('meota-no-468', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('meota-no-468', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('meota-no-468', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('meota-no-468', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('meota-no-468', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('meota-no-468', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('meota-no-468', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('meota-no-468', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('meota-no-468', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('grayson-no-184', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('grayson-no-184', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('grayson-no-184', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('grayson-no-184', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('grayson-no-184', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('grayson-no-184', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('grayson-no-184', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('grayson-no-184', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('grayson-no-184', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('grayson-no-184', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('grayson-no-184', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('grayson-no-184', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('grayson-no-184', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('gull-lake-no-139', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('gull-lake-no-139', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('gull-lake-no-139', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('gull-lake-no-139', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('gull-lake-no-139', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('gull-lake-no-139', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('gull-lake-no-139', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('gull-lake-no-139', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('gull-lake-no-139', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('gull-lake-no-139', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('gull-lake-no-139', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('gull-lake-no-139', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('gull-lake-no-139', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('edenwold-no-158', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('edenwold-no-158', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('edenwold-no-158', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('edenwold-no-158', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('edenwold-no-158', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('edenwold-no-158', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('edenwold-no-158', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('edenwold-no-158', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('edenwold-no-158', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('edenwold-no-158', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('edenwold-no-158', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('edenwold-no-158', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('edenwold-no-158', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board')
) as v(municipality_slug, name, slug, voter_question, description, sort_order, applies_to)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into races
    (municipality_id, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
select m.id, v.name, v.slug, v.race_type, v.seats, v.is_acclaimed, v.sort_order, v.ward_group_label
from municipalities m
join (values
    ('corman-park-no-344', 'Councillor, Division 2', 'corman-park-no-344-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('corman-park-no-344', 'Councillor, Division 4', 'corman-park-no-344-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('corman-park-no-344', 'Councillor, Division 6', 'corman-park-no-344-councillor-division-6', 'council_ward', 1, false, 6, 'Division 6'),
    ('corman-park-no-344', 'Councillor, Division 8', 'corman-park-no-344-councillor-division-8', 'council_ward', 1, false, 8, 'Division 8'),
    ('laird-no-404', 'Councillor, Division 2', 'laird-no-404-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('laird-no-404', 'Councillor, Division 4', 'laird-no-404-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('laird-no-404', 'Councillor, Division 6', 'laird-no-404-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('lomond-no-37', 'Councillor, Division 2', 'lomond-no-37-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('lomond-no-37', 'Councillor, Division 4', 'lomond-no-37-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('lomond-no-37', 'Councillor, Division 6', 'lomond-no-37-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('meota-no-468', 'Councillor, Division 4', 'meota-no-468-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('meota-no-468', 'Councillor, Division 6', 'meota-no-468-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('grayson-no-184', 'Councillor, Division 2', 'grayson-no-184-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('gull-lake-no-139', 'Councillor, Division 1', 'gull-lake-no-139-councillor-division-1', 'council_ward', 1, false, 1, 'Division 1'),
    ('gull-lake-no-139', 'Councillor, Division 2', 'gull-lake-no-139-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('gull-lake-no-139', 'Councillor, Division 4', 'gull-lake-no-139-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('gull-lake-no-139', 'Councillor, Division 6', 'gull-lake-no-139-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('edenwold-no-158', 'Councillor, Division 2', 'edenwold-no-158-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('edenwold-no-158', 'Councillor, Division 4', 'edenwold-no-158-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('edenwold-no-158', 'Councillor, Division 6', 'edenwold-no-158-councillor-division-6', 'council_ward', 1, false, 6, 'Division 6')
) as v(municipality_slug, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into candidates
    (race_id, name, slug, status, incumbent, source_url)
select r.id, v.name, v.slug, v.status, v.incumbent, v.source_url
from races r
join (values
    ('corman-park-no-344-councillor-division-2', 'Michelle Chuhaniuk', 'corman-park-no-344-michelle-chuhaniuk', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-2', 'Kyle Jantzen', 'corman-park-no-344-kyle-jantzen', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-2', 'Tarren Pederson', 'corman-park-no-344-tarren-pederson', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-4', 'David Greenwood', 'corman-park-no-344-david-greenwood', 'acclaimed', true, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-6', 'Steven Balzer', 'corman-park-no-344-steven-balzer', 'certified', true, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-6', 'Shaun May', 'corman-park-no-344-shaun-may', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-8', 'Ashley Hubbard', 'corman-park-no-344-ashley-hubbard', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-8', 'Brent Priel', 'corman-park-no-344-brent-priel', 'certified', false, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('corman-park-no-344-councillor-division-8', 'Wendy Trask', 'corman-park-no-344-wendy-trask', 'certified', true, 'https://rmcormanpark.ca/281/Elections-and-Voting'),
    ('laird-no-404-councillor-division-2', 'Phil Loewen', 'laird-no-404-phil-loewen', 'acclaimed', false, 'https://rmoflaird.ca/category/current-posts/'),
    ('laird-no-404-councillor-division-4', 'Ken Fehr', 'laird-no-404-ken-fehr', 'acclaimed', false, 'https://rmoflaird.ca/category/current-posts/'),
    ('laird-no-404-councillor-division-6', 'Salton Willems', 'laird-no-404-salton-willems', 'acclaimed', false, 'https://rmoflaird.ca/category/current-posts/'),
    ('lomond-no-37-councillor-division-2', 'Todd Persson', 'lomond-no-37-todd-persson', 'acclaimed', false, 'https://rm37.ca/notice-of-abandonment-of-poll-4/'),
    ('lomond-no-37-councillor-division-4', 'Fred Morrice', 'lomond-no-37-fred-morrice', 'acclaimed', false, 'https://rm37.ca/notice-of-abandonment-of-poll-4/'),
    ('lomond-no-37-councillor-division-6', 'Denis Sidloski', 'lomond-no-37-denis-sidloski', 'acclaimed', false, 'https://rm37.ca/notice-of-abandonment-of-poll-4/'),
    ('meota-no-468-councillor-division-4', 'Gary Heidel', 'meota-no-468-gary-heidel', 'acclaimed', false, 'https://www.rmmeota468.ca/'),
    ('meota-no-468-councillor-division-6', 'Jodie Gabruck', 'meota-no-468-jodie-gabruck', 'acclaimed', false, 'https://www.rmmeota468.ca/'),
    ('grayson-no-184-councillor-division-2', 'Darren Butler', 'grayson-no-184-darren-butler', 'certified', false, 'http://www.rmofgrayson184.ca/home.html'),
    ('grayson-no-184-councillor-division-2', 'Mike Lang', 'grayson-no-184-mike-lang', 'certified', false, 'http://www.rmofgrayson184.ca/home.html'),
    ('grayson-no-184-councillor-division-2', 'Vernon Taillon', 'grayson-no-184-vernon-taillon', 'certified', false, 'http://www.rmofgrayson184.ca/home.html'),
    ('gull-lake-no-139-councillor-division-1', 'Dennis Kirk', 'gull-lake-no-139-dennis-kirk', 'certified', false, 'https://rmgulllake.ca/council-staff/'),
    ('gull-lake-no-139-councillor-division-1', 'Aaron Deitrich', 'gull-lake-no-139-aaron-deitrich', 'certified', false, 'https://rmgulllake.ca/council-staff/'),
    ('gull-lake-no-139-councillor-division-1', 'Camara Froese', 'gull-lake-no-139-camara-froese', 'certified', false, 'https://rmgulllake.ca/council-staff/'),
    ('gull-lake-no-139-councillor-division-2', 'Kenneth Mitchell', 'gull-lake-no-139-kenneth-mitchell', 'acclaimed', true, 'https://rmgulllake.ca/council-staff/'),
    ('gull-lake-no-139-councillor-division-4', 'Rob Toney', 'gull-lake-no-139-rob-toney', 'acclaimed', true, 'https://rmgulllake.ca/council-staff/'),
    ('gull-lake-no-139-councillor-division-6', 'Collette Jones', 'gull-lake-no-139-collette-jones', 'acclaimed', false, 'https://rmgulllake.ca/council-staff/'),
    ('edenwold-no-158-councillor-division-2', 'Ashley Fullerton', 'edenwold-no-158-ashley-fullerton', 'certified', false, 'http://rmedenwold.ca/election-information'),
    ('edenwold-no-158-councillor-division-2', 'Randy Schulz', 'edenwold-no-158-randy-schulz', 'certified', false, 'http://rmedenwold.ca/election-information'),
    ('edenwold-no-158-councillor-division-4', 'Karen Kotylak', 'edenwold-no-158-karen-kotylak', 'acclaimed', false, 'http://rmedenwold.ca/election-information'),
    ('edenwold-no-158-councillor-division-6', 'Glenn Lechner', 'edenwold-no-158-glenn-lechner', 'certified', false, 'http://rmedenwold.ca/election-information'),
    ('edenwold-no-158-councillor-division-6', 'Tim Brodt', 'edenwold-no-158-tim-brodt', 'certified', false, 'http://rmedenwold.ca/election-information')
) as v(race_slug, name, slug, status, incumbent, source_url)
  on v.race_slug = r.slug
on conflict (race_id, slug) do nothing;

commit;

-- VERIFY
select 'rm nov9 municipalities' as check_name, count(*) as n from municipalities
where province = 'SK' and slug in ('corman-park-no-344', 'laird-no-404', 'lomond-no-37', 'meota-no-468', 'grayson-no-184', 'gull-lake-no-139', 'edenwold-no-158');
select 'rm nov9 races' as check_name, count(*) as n from races r
join municipalities m on m.id = r.municipality_id where m.slug in ('corman-park-no-344', 'laird-no-404', 'lomond-no-37', 'meota-no-468', 'grayson-no-184', 'gull-lake-no-139', 'edenwold-no-158');
select 'rm nov9 candidates' as check_name, count(*) as n from candidates c
join races r on r.id = c.race_id join municipalities m on m.id = r.municipality_id where m.slug in ('corman-park-no-344', 'laird-no-404', 'lomond-no-37', 'meota-no-468', 'grayson-no-184', 'gull-lake-no-139', 'edenwold-no-158');
