-- =====================================================================
-- Migration 47 (draft) -- Saskatchewan top-10 RMs, second batch
--
-- PREPARE ONLY -- Andreas runs this in the Supabase SQL Editor
-- after reviewing. Nothing here runs or publishes by itself.
--
-- LISTINGS ONLY (Andreas, Oct 29): no deep dives, no position rows.
-- Link scour Oct 29 found 0 qualifying campaign websites/socials
-- across all 31 contested SK candidates, so no website/social
-- columns are populated here. Edenwold profile statements stay
-- flagged only, per Andreas's Oct 29 decision.
-- 8 RMs, 22 division races, 29 candidates -- ONLY what was verified
-- from each RM's own site/notice. Omitted, not guessed:
-- Prince Albert Div 4 (contested, names unpublished by the RM);
-- Dundurn Div 4 (vacant, by-election required, LGEA s. 78(2)).
-- Race type 'council_ward' = division analogue (existing check).
-- Issues: approved RM set (11, municipal) + trustee set (2).
-- Idempotent: ON CONFLICT DO NOTHING, existing rows untouched.
-- Municipality pages ALSO need the static index patch (see
-- sk-top10-second-batch-index-patch.json) -- DB seeding alone does
-- not make a municipality page appear.
-- Numbering: 47 follows the renumbered first batch (46); 45 is
-- already applied in production as link-click counting.
-- =====================================================================

begin;

insert into municipalities
    (name, slug, province, election_date, official_url, coverage_status)
values
    ('RM of Prince Albert No. 461', 'prince-albert-no-461', 'SK', '2026-11-09', 'https://rmprincealbert.ca/', 'partial'),
    ('RM of Buckland No. 491', 'buckland-no-491', 'SK', '2026-11-09', 'https://rmbuckland.ca/', 'partial'),
    ('RM of Vanscoy No. 345', 'vanscoy-no-345', 'SK', '2026-11-09', 'https://www.rmvanscoy.ca/', 'partial'),
    ('RM of Meadow Lake No. 588', 'meadow-lake-no-588', 'SK', '2026-11-09', 'https://www.rmofmeadowlake.com/government/elections', 'partial'),
    ('RM of Dundurn No. 314', 'dundurn-no-314', 'SK', '2026-11-09', 'https://dundurnrm.ca/election-2026', 'partial'),
    ('RM of Rosthern No. 403', 'rosthern-no-403', 'SK', '2026-11-09', 'https://www.rmofrosthern.ca/elections.html', 'partial'),
    ('RM of Britannia No. 502', 'britannia-no-502', 'SK', '2026-11-09', 'https://rmbritannia.com/', 'partial'),
    ('RM of Blucher No. 343', 'blucher-no-343', 'SK', '2026-11-09', 'https://rm343.com/2026-municipal-elections/', 'partial')
on conflict (slug) do nothing;

insert into issues
    (municipality_id, name, slug, voter_question, description, sort_order, applies_to)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order, v.applies_to
from municipalities m
join (values
    ('prince-albert-no-461', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('prince-albert-no-461', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('prince-albert-no-461', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('prince-albert-no-461', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('prince-albert-no-461', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('prince-albert-no-461', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('prince-albert-no-461', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('prince-albert-no-461', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('prince-albert-no-461', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('prince-albert-no-461', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('prince-albert-no-461', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('prince-albert-no-461', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('prince-albert-no-461', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('buckland-no-491', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('buckland-no-491', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('buckland-no-491', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('buckland-no-491', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('buckland-no-491', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('buckland-no-491', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('buckland-no-491', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('buckland-no-491', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('buckland-no-491', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('buckland-no-491', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('buckland-no-491', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('buckland-no-491', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('buckland-no-491', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('vanscoy-no-345', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('vanscoy-no-345', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('vanscoy-no-345', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('vanscoy-no-345', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('vanscoy-no-345', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('vanscoy-no-345', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('vanscoy-no-345', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('vanscoy-no-345', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('vanscoy-no-345', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('vanscoy-no-345', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('vanscoy-no-345', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('vanscoy-no-345', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('vanscoy-no-345', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('meadow-lake-no-588', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('meadow-lake-no-588', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('meadow-lake-no-588', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('meadow-lake-no-588', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('meadow-lake-no-588', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('meadow-lake-no-588', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('meadow-lake-no-588', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('meadow-lake-no-588', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('meadow-lake-no-588', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('meadow-lake-no-588', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('meadow-lake-no-588', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('meadow-lake-no-588', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('meadow-lake-no-588', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('dundurn-no-314', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('dundurn-no-314', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('dundurn-no-314', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('dundurn-no-314', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('dundurn-no-314', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('dundurn-no-314', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('dundurn-no-314', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('dundurn-no-314', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('dundurn-no-314', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('dundurn-no-314', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('dundurn-no-314', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('dundurn-no-314', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('dundurn-no-314', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('rosthern-no-403', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('rosthern-no-403', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('rosthern-no-403', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('rosthern-no-403', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('rosthern-no-403', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('rosthern-no-403', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('rosthern-no-403', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('rosthern-no-403', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('rosthern-no-403', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('rosthern-no-403', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('rosthern-no-403', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('rosthern-no-403', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('rosthern-no-403', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('britannia-no-502', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('britannia-no-502', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('britannia-no-502', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('britannia-no-502', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('britannia-no-502', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('britannia-no-502', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('britannia-no-502', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('britannia-no-502', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('britannia-no-502', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('britannia-no-502', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('britannia-no-502', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('britannia-no-502', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('britannia-no-502', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board'),
    ('blucher-no-343', 'Housing', 'housing', 'Will I be able to afford to live here?', 'Rural lot development and subdivision through zoning -- narrower than the urban housing file, but the RM''s lever on where people can live.', 1, 'municipal'),
    ('blucher-no-343', 'Taxes & spending', 'taxes-and-spending', 'What happens to my tax bill, and where does the money go?', 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.', 2, 'municipal'),
    ('blucher-no-343', 'Emergency services', 'emergency-services', 'When I call for help, will it come fast enough?', 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.', 3, 'municipal'),
    ('blucher-no-343', 'Government', 'government', 'Will decisions be made in the open, and will anyone answer for them?', 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.', 4, 'municipal'),
    ('blucher-no-343', 'Roads & infrastructure', 'roads-and-infrastructure', 'Will the things I use every day actually get fixed?', 'Grid roads, bridges and culverts -- the RM''s signature service -- plus snow clearing and the infrastructure a rural municipality is judged on.', 5, 'municipal'),
    ('blucher-no-343', 'Economy', 'economy', 'Will our main streets and local jobs thrive?', 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.', 6, 'municipal'),
    ('blucher-no-343', 'Environment', 'environment', 'Is the candidate protecting the nature we live in?', 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.', 7, 'municipal'),
    ('blucher-no-343', 'Growth & development', 'growth-and-development', 'How fast should we grow, and who decides what gets built where?', 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.', 8, 'municipal'),
    ('blucher-no-343', 'Social & community services', 'social-and-community-services', 'Who looks after the most vulnerable residents?', 'Community halls, rinks and recreation facilities, and the local services a rural council chooses to support.', 9, 'municipal'),
    ('blucher-no-343', 'Water & waste', 'water-and-waste', 'Is our drinking water safe and our waste handled?', 'Waste disposal grounds, drainage and sewage lagoons where they exist. Most rural homes are on private wells and septic, so piped water supply is largely NOT an RM service -- this issue is explicitly not piped water.', 10, 'municipal'),
    ('blucher-no-343', 'Bylaw enforcement', 'bylaw-enforcement', 'Are the rules fair, and are they actually enforced?', 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.', 11, 'municipal'),
    ('blucher-no-343', 'What a trustee actually does', 'trustee-role', 'Does the candidate understand the trustee job?', 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.', 12, 'school_board'),
    ('blucher-no-343', 'Student wellbeing and learning', 'student-wellbeing', 'Will kids be safe, supported and learning well?', 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.', 13, 'school_board')
) as v(municipality_slug, name, slug, voter_question, description, sort_order, applies_to)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into races
    (municipality_id, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
select m.id, v.name, v.slug, v.race_type, v.seats, v.is_acclaimed, v.sort_order, v.ward_group_label
from municipalities m
join (values
    ('prince-albert-no-461', 'Councillor, Division 2', 'prince-albert-no-461-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('prince-albert-no-461', 'Councillor, Division 6', 'prince-albert-no-461-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('buckland-no-491', 'Councillor, Division 2', 'buckland-no-491-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('buckland-no-491', 'Councillor, Division 4', 'buckland-no-491-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('buckland-no-491', 'Councillor, Division 6', 'buckland-no-491-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('vanscoy-no-345', 'Councillor, Division 2', 'vanscoy-no-345-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('vanscoy-no-345', 'Councillor, Division 4', 'vanscoy-no-345-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('vanscoy-no-345', 'Councillor, Division 6', 'vanscoy-no-345-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('meadow-lake-no-588', 'Councillor, Division 2', 'meadow-lake-no-588-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('meadow-lake-no-588', 'Councillor, Division 4', 'meadow-lake-no-588-councillor-division-4', 'council_ward', 1, false, 4, 'Division 4'),
    ('meadow-lake-no-588', 'Councillor, Division 6', 'meadow-lake-no-588-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('dundurn-no-314', 'Councillor, Division 2', 'dundurn-no-314-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('dundurn-no-314', 'Councillor, Division 6', 'dundurn-no-314-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6'),
    ('rosthern-no-403', 'Councillor, Division 2', 'rosthern-no-403-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('rosthern-no-403', 'Councillor, Division 4', 'rosthern-no-403-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('rosthern-no-403', 'Councillor, Division 6', 'rosthern-no-403-councillor-division-6', 'council_ward', 1, false, 6, 'Division 6'),
    ('britannia-no-502', 'Councillor, Division 2', 'britannia-no-502-councillor-division-2', 'council_ward', 1, false, 2, 'Division 2'),
    ('britannia-no-502', 'Councillor, Division 4', 'britannia-no-502-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('britannia-no-502', 'Councillor, Division 6', 'britannia-no-502-councillor-division-6', 'council_ward', 1, false, 6, 'Division 6'),
    ('blucher-no-343', 'Councillor, Division 2', 'blucher-no-343-councillor-division-2', 'council_ward', 1, true, 2, 'Division 2'),
    ('blucher-no-343', 'Councillor, Division 4', 'blucher-no-343-councillor-division-4', 'council_ward', 1, true, 4, 'Division 4'),
    ('blucher-no-343', 'Councillor, Division 6', 'blucher-no-343-councillor-division-6', 'council_ward', 1, true, 6, 'Division 6')
) as v(municipality_slug, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into candidates
    (race_id, name, slug, status, incumbent, source_url)
select r.id, v.name, v.slug, v.status, v.incumbent, v.source_url
from races r
join (values
    ('prince-albert-no-461-councillor-division-2', 'Tyler Hazelwood', 'prince-albert-no-461-tyler-hazelwood', 'acclaimed', false, 'https://rmprincealbert.ca/'),
    ('prince-albert-no-461-councillor-division-6', 'Richard Sayers', 'prince-albert-no-461-richard-sayers', 'acclaimed', false, 'https://rmprincealbert.ca/'),
    ('buckland-no-491-councillor-division-2', 'Leonard Yungwirth', 'buckland-no-491-leonard-yungwirth', 'certified', false, 'https://rmbuckland.ca/'),
    ('buckland-no-491-councillor-division-2', 'Jason Zalewski', 'buckland-no-491-jason-zalewski', 'certified', false, 'https://rmbuckland.ca/'),
    ('buckland-no-491-councillor-division-4', 'Melinda Lavoie', 'buckland-no-491-melinda-lavoie', 'acclaimed', false, 'https://rmbuckland.ca/'),
    ('buckland-no-491-councillor-division-6', 'Lillian Jacobson', 'buckland-no-491-lillian-jacobson', 'acclaimed', false, 'https://rmbuckland.ca/'),
    ('vanscoy-no-345-councillor-division-2', 'Jeff Colborn', 'vanscoy-no-345-jeff-colborn', 'acclaimed', false, 'https://www.rmvanscoy.ca/'),
    ('vanscoy-no-345-councillor-division-4', 'John Arnold', 'vanscoy-no-345-john-arnold', 'acclaimed', false, 'https://www.rmvanscoy.ca/'),
    ('vanscoy-no-345-councillor-division-6', 'Dean Gregory', 'vanscoy-no-345-dean-gregory', 'acclaimed', false, 'https://www.rmvanscoy.ca/'),
    ('meadow-lake-no-588-councillor-division-2', 'Keray Bacon', 'meadow-lake-no-588-keray-bacon', 'certified', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('meadow-lake-no-588-councillor-division-2', 'Russ Jones', 'meadow-lake-no-588-russ-jones', 'certified', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('meadow-lake-no-588-councillor-division-2', 'Blair Mysko', 'meadow-lake-no-588-blair-mysko', 'certified', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('meadow-lake-no-588-councillor-division-4', 'Garry Ratke', 'meadow-lake-no-588-garry-ratke', 'certified', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('meadow-lake-no-588-councillor-division-4', 'Darwin Schwartz', 'meadow-lake-no-588-darwin-schwartz', 'certified', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('meadow-lake-no-588-councillor-division-6', 'Ernie Schwartz', 'meadow-lake-no-588-ernie-schwartz', 'acclaimed', false, 'https://www.rmofmeadowlake.com/government/elections'),
    ('dundurn-no-314-councillor-division-2', 'Ben J. Wilson', 'dundurn-no-314-ben-j-wilson', 'acclaimed', false, 'https://dundurnrm.ca/election-2026'),
    ('dundurn-no-314-councillor-division-6', 'Rodney Glen Rieder', 'dundurn-no-314-rodney-glen-rieder', 'acclaimed', false, 'https://dundurnrm.ca/election-2026'),
    ('rosthern-no-403-councillor-division-2', 'Larry Fehr', 'rosthern-no-403-larry-fehr', 'acclaimed', false, 'https://www.rmofrosthern.ca/elections.html'),
    ('rosthern-no-403-councillor-division-4', 'Leo Perrin', 'rosthern-no-403-leo-perrin', 'acclaimed', false, 'https://www.rmofrosthern.ca/elections.html'),
    ('rosthern-no-403-councillor-division-6', 'Andrew Robin', 'rosthern-no-403-andrew-robin', 'certified', false, 'https://www.rmofrosthern.ca/elections.html'),
    ('rosthern-no-403-councillor-division-6', 'David Neufeldt', 'rosthern-no-403-david-neufeldt', 'certified', false, 'https://www.rmofrosthern.ca/elections.html'),
    ('britannia-no-502-councillor-division-2', 'Ryan Kerr', 'britannia-no-502-ryan-kerr', 'certified', false, 'https://rmbritannia.com/'),
    ('britannia-no-502-councillor-division-2', 'Wilfred Jurke', 'britannia-no-502-wilfred-jurke', 'certified', true, 'https://rmbritannia.com/'),
    ('britannia-no-502-councillor-division-4', 'Elaine Newman', 'britannia-no-502-elaine-newman', 'acclaimed', false, 'https://rmbritannia.com/'),
    ('britannia-no-502-councillor-division-6', 'H. John Wack', 'britannia-no-502-h-john-wack', 'certified', true, 'https://rmbritannia.com/'),
    ('britannia-no-502-councillor-division-6', 'Karl Jory', 'britannia-no-502-karl-jory', 'certified', false, 'https://rmbritannia.com/'),
    ('blucher-no-343-councillor-division-2', 'Quintin Senger', 'blucher-no-343-quintin-senger', 'acclaimed', true, 'https://rm343.com/2026-municipal-elections/'),
    ('blucher-no-343-councillor-division-4', 'Dale Chysyk', 'blucher-no-343-dale-chysyk', 'acclaimed', true, 'https://rm343.com/2026-municipal-elections/'),
    ('blucher-no-343-councillor-division-6', 'Francis M. Boehm', 'blucher-no-343-francis-m-boehm', 'acclaimed', true, 'https://rm343.com/2026-municipal-elections/')
) as v(race_slug, name, slug, status, incumbent, source_url)
  on v.race_slug = r.slug
on conflict (race_id, slug) do nothing;

commit;

-- VERIFY
select 'sk top10 second municipalities' as check_name, count(*) as n from municipalities
where province = 'SK' and slug in ('prince-albert-no-461', 'buckland-no-491', 'vanscoy-no-345', 'meadow-lake-no-588', 'dundurn-no-314', 'rosthern-no-403', 'britannia-no-502', 'blucher-no-343');
select 'sk top10 second races' as check_name, count(*) as n from races r
join municipalities m on m.id = r.municipality_id where m.slug in ('prince-albert-no-461', 'buckland-no-491', 'vanscoy-no-345', 'meadow-lake-no-588', 'dundurn-no-314', 'rosthern-no-403', 'britannia-no-502', 'blucher-no-343');
select 'sk top10 second candidates' as check_name, count(*) as n from candidates c
join races r on r.id = c.race_id join municipalities m on m.id = r.municipality_id where m.slug in ('prince-albert-no-461', 'buckland-no-491', 'vanscoy-no-345', 'meadow-lake-no-588', 'dundurn-no-314', 'rosthern-no-403', 'britannia-no-502', 'blucher-no-343');
