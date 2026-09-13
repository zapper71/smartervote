-- =====================================================================
-- SmarterVote.ca — candidate positions, batch 2
--
-- Extracted 13 September 2026 from:
--   * Rylind Davis's campaign website (6 platform pages)
--   * Geordie Sabbagh's campaign website (3 plan pages)
--   * Huntsville Doppler reporting on 10 candidates
--
-- 41 positions. Coverage goes from 8 of 28 candidates to 18 of 28.
--
-- status = 'in_review'. Nothing appears on the site until you approve it.
--
-- ---------------------------------------------------------------------
-- THE QUOTE RULE, APPLIED TO NEWSPAPER REPORTING
--
-- Batch 1 came from candidates' own websites, so every word was theirs.
-- Local news is different: an article mixes the candidate's quoted words
-- with the reporter's paraphrase of them. Those are not the same thing.
--
-- verbatim_quote in this file only ever contains words Doppler placed
-- inside quotation marks and attributed to the candidate. Reported
-- paraphrase — "Bowler also plans to focus on waste collection", say —
-- appears in summary_bullets, clearly as our summary, never inside
-- quotation marks beside a candidate's name.
--
-- This is why several candidates have fewer rows here than the length of
-- their article would suggest. Where Doppler paraphrased and did not
-- quote, there is nothing we can honestly print as their words, so we
-- print nothing. See the gap list at the bottom.
--
-- Where Doppler quoted two separate fragments with "he said" between
-- them, they are two separate utterances. We use one of them whole; we do
-- not splice them into a single sentence the candidate never spoke.
--
-- ---------------------------------------------------------------------
-- ON MORE THAN ONE POSITION PER ISSUE
--
-- Dan Armour, Dan Caswell and Rebecca Mello each pick up a second row on
-- an issue they had already spoken about. That is NOT a conflict, and
-- is_conflicting is false on every row in this file. Two sources agreeing
-- is the normal case. PositionCell now stacks them under "This candidate
-- has spoken about this issue more than once" rather than flagging them.
--
-- Run AFTER 07_verified_links.sql. Safe to re-run.
-- =====================================================================

begin;

with m as (select id from municipalities where slug = 'huntsville')
insert into positions (candidate_id, issue_id, summary_short, summary_bullets,
                       verbatim_quote, source_url, source_title, source_type,
                       source_date, status, model_confidence)
select
    (select c.id from candidates c join races r on r.id = c.race_id
      where r.municipality_id = m.id and r.slug = v.race_slug and c.slug = v.cand_slug),
    (select i.id from issues i where i.municipality_id = m.id and i.slug = v.issue_slug),
    v.summary_short, v.summary_bullets::jsonb, v.verbatim_quote,
    -- source_type is a plain text column with a CHECK constraint, not an enum,
    -- so it needs no cast. Batch 1 hard-coded 'candidate_website' here because
    -- every row came from a website; this batch mixes websites and local news,
    -- so it travels per-row in the VALUES list.
    v.source_url, v.source_title, v.source_type, v.source_date::date,
    'in_review', 0.90
from m, (values

-- =====================================================================
-- RYLIND DAVIS — Huntsville and Chaffey Ward
-- Six platform pages, read in full 13 September 2026.
-- Note the URL really is spelled "platfrom" on his site. Do not correct it;
-- correcting it would break the link.
-- =====================================================================

('rylind-davis', 'wards-1-2', 'taxes-and-spending',
 'Wants a governance and administration review to test whether the Town is delivering value for money.',
 '["Supports reviewing Huntsville''s governance and administrative structure.", "Wants efficiencies identified without cutting services residents rely on.", "Frames preventative maintenance as a way to protect taxpayer money over the long term."]',
 'Taxpayers deserve confidence that their municipal government is delivering value for money.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/governance-administration-and-customer-service',
 'Rylind Davis campaign website — Governance, Administration and Customer Service',
 'candidate_website', '2026-09-13'),

('rylind-davis', 'wards-1-2', 'roads-and-infrastructure',
 'Fix things before they get expensive, and make potholes easier to report.',
 '["Supports continued investment in roads and critical infrastructure.", "Would add pothole reporting to the Town''s online Report a Concern portal.", "Supports implementing Huntsville''s Sidewalk Master Plan."]',
 'Supporting proactive repairs and preventative maintenance to address issues before they become larger and more costly, helping protect taxpayer dollars over the long term.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/roads-and-infrastructure',
 'Rylind Davis campaign website — Roads and Infrastructure',
 'candidate_website', '2026-09-13'),

('rylind-davis', 'wards-1-2', 'how-council-works',
 'A 311 service, plain-language council updates, and councillor drop-in hours before meetings.',
 '["Wants a 311 system where residents can call or text a problem, with a photo, and have it routed to the right department.", "Would bring back pre- and post-meeting Council highlights explaining what is coming, why it matters and what was decided.", "Proposes councillors be available 30 to 45 minutes before every Council meeting for informal drop-in conversations.", "Wants every major development to have a dedicated page on the Town website with the location, applicant, staff reports and current status."]',
 'Good government should be easy to understand, easy to access, and focused on serving the people of Huntsville.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/governance-administration-and-customer-service',
 'Rylind Davis campaign website — Governance, Administration and Customer Service',
 'candidate_website', '2026-09-13'),

('rylind-davis', 'wards-1-2', 'growth-and-development',
 'Growth should be planned and sustainable without losing the character of the place.',
 '["Frames growth as bringing both opportunities and challenges.", "Links responsible growth to keeping infrastructure and services in step.", "Wants development applications documented publicly so misinformation has less room."]',
 'We need to ensure that growth is well-planned, sustainable, and benefits everyone—while preserving the character and quality of life that make our community such a special place to call home.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/housing-and-development',
 'Rylind Davis campaign website — Housing and Development',
 'candidate_website', '2026-09-13'),

('rylind-davis', 'wards-1-2', 'housing',
 'Use Town-owned land and partnerships to get more affordable rental housing built.',
 '["Would investigate whether Huntsville should apply for housing incentive programs from other levels of government.", "Wants more awareness of existing Town and District rebates and deferrals for eligible builders.", "Would evaluate with builders and community organisations whether existing housing programs are achieving their goals."]',
 'Supporting the strategic use of Town-owned land and public-private and non-profit partnerships to help develop more affordable rental housing for residents.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/housing-and-development',
 'Rylind Davis campaign website — Housing and Development',
 'candidate_website', '2026-09-13'),

('rylind-davis', 'wards-1-2', 'parks-and-trails',
 'More public water access, and a major playground plus a walking route at McCulley-Robertson.',
 '["Wants a major regional playground at McCulley-Robertson Sports Complex, noting there is none on the west side of Highway 11.", "Would fund it through grants, naming rights and sponsorship, with the Town covering the remainder once community fundraising reaches a target such as 75 per cent.", "Wants a dedicated pedestrian connection to the park, noting one was recommended by the Parks and Trails Advisory Committee in 2006 and still has not been built.", "Supports implementing the Community Services Master Plan and the Waterfront Development Strategy."]',
 'Increased public water access for swimming and paddle sports throughout Huntsville''s waterways, including the Big East River and the Muskoka River, so more residents can safely enjoy the natural beauty that surrounds us.',
 'https://www.rylinddavis4huntsvillechaffey.ca/platfrom/sports-parks-and-recreation',
 'Rylind Davis campaign website — Sports, Parks and Recreation',
 'candidate_website', '2026-09-13'),

-- =====================================================================
-- GEORDIE SABBAGH — Huntsville and Chaffey Ward
-- Three plan pages under Vision, read in full 13 September 2026.
-- =====================================================================

('geordie-sabbagh', 'wards-1-2', 'taxes-and-spending',
 'Test every major decision against cost, result and benefit — and chase outside funding first.',
 '["Says taxes have gone up significantly and families and businesses are feeling it.", "Wants plain-language reporting of where tax dollars go and what major projects actually cost.", "Would pursue provincial and federal grants so local property taxpayers are not left carrying costs that could be shared.", "Explicitly rejects arbitrary cuts made to satisfy a campaign promise, and would ask first what work needs doing and whether there is a cheaper way to do it.", "Says growth should help pay for the services and infrastructure it requires."]',
 'Every major decision should answer three questions: What does it cost? What do we get? And how does it make Huntsville better?',
 'https://yourneighbourgeordie.ca/value-for-money',
 'Geordie Sabbagh campaign website — Value for Money',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'how-council-works',
 'Bring residents in before decisions are made, and draw on expertise already in town.',
 '["Says he does not need to have every answer, and that good leadership means finding the people who understand an issue and bringing them to the table.", "Wants Council to set out the choices, costs and trade-offs before major spending decisions, with a meaningful chance for residents to be heard."]',
 'Residents shouldn''t simply hear about decisions after they''re made. We should invite people in, listen to different perspectives, use the expertise around us, and build solutions together.',
 'https://yourneighbourgeordie.ca/huntsville-strong',
 'Geordie Sabbagh campaign website — Huntsville Strong',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'economy-and-downtown',
 'Keep tourism, but build a year-round economy beyond it.',
 '["Wants to support entrepreneurs and small businesses already here.", "Would actively pursue professional, knowledge-based businesses that can operate from Muskoka.", "Links year-round jobs to young people being able to build a future locally."]',
 'Tourism will always be an important part of Huntsville, but we can find new reasons for people to visit throughout the year while also diversifying beyond tourism.',
 'https://yourneighbourgeordie.ca/future-ready',
 'Geordie Sabbagh campaign website — Future Ready',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'growth-and-development',
 'Build the homes the community actually needs, without losing the lakes and forests.',
 '["Frames development as something to encourage, conditional on the type of housing and on environmental protection.", "Says Huntsville should look at what has worked in other communities facing the same pressures."]',
 'We should encourage responsible development that adds the kinds of homes our community actually needs while protecting our lakes, forests, and environment. Growth shouldn''t mean losing what makes Huntsville special.',
 'https://yourneighbourgeordie.ca/future-ready',
 'Geordie Sabbagh campaign website — Future Ready',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'housing',
 'Economic growth only counts if people can afford to live here.',
 '["Ties housing, infrastructure, transportation and community services together as things that must keep pace with growth.", "Connects affordable housing to attracting working families and professionals."]',
 'But economic growth only works if people can afford to live here. Housing, infrastructure, transportation, and community services need to keep pace.',
 'https://yourneighbourgeordie.ca/future-ready',
 'Geordie Sabbagh campaign website — Future Ready',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'district-table',
 'Huntsville should be at the table with the District and other governments, not waiting to be told.',
 '["Names the District, neighbouring municipalities, the Province, the federal government and the private and non-profit sectors as relationships to build.", "Frames it in terms of Huntsville getting its fair share of funding and programs."]',
 'We need to build strong relationships with the District, neighbouring municipalities, the Province, the federal government, and the private and non-profit sectors. When funding, programs, partnerships, or new opportunities are available, Huntsville should be at the table — and fighting for its fair share.',
 'https://yourneighbourgeordie.ca/future-ready',
 'Geordie Sabbagh campaign website — Future Ready',
 'candidate_website', '2026-09-13'),

('geordie-sabbagh', 'wards-1-2', 'healthcare-and-hospital',
 'Sees a stronger local economy as the way to attract doctors and healthcare workers.',
 '["Treats doctor recruitment as a by-product of good jobs and a liveable town rather than a standalone program.", "Lists better access to healthcare among the services a strong Huntsville needs."]',
 -- Two adjacent sentences, quoted together so "That, in turn" has its
 -- antecedent and needs no bracketed insertion from us.
 'Good jobs help young people build a future here, support local businesses, and attract working families and professionals. That, in turn, can make Huntsville a more attractive place for doctors, healthcare workers, educators, and other people we need.',
 'https://yourneighbourgeordie.ca/future-ready',
 'Geordie Sabbagh campaign website — Future Ready',
 'candidate_website', '2026-09-13'),

-- =====================================================================
-- SCOTT MORRISON — Mayor
-- =====================================================================

('scott-morrison', 'mayor', 'how-council-works',
 'Would publish video and audio from every meeting and answer his own phone.',
 '["Names podcasts of meetings and a video from the mayor after every meeting.", "Frames accountability as being personally reachable by phone."]',
 'The biggest thing is transparency: podcasts at the meeting to go out to the public, videos from the mayor after every meeting, so you know what we discussed and why, and an accountability where you can call me anytime and I''ll answer the phone',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

('scott-morrison', 'mayor', 'healthcare-and-hospital',
 'Points to the doctor recruitment program he says he built with Bob Stone.',
 '["Claims the program has brought almost ten doctors to Huntsville.", "Says he wants to keep focusing on healthcare in a further term.", "Note: this is his own account of his record; SmarterVote has not independently verified the number."]',
 'I built the doctor recruitment program with Bob Stone, which has brought us almost ten doctors now',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

('scott-morrison', 'mayor', 'growth-and-development',
 'Says he tried to cut planning red tape while keeping the protections that matter.',
 '["Frames planning reform as a balance rather than deregulation.", "Cites it as part of his record in the current term."]',
 'I tried to reform the planning process to make the red tape go away a little bit while still protecting the stuff that matters',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

('scott-morrison', 'mayor', 'economy-and-downtown',
 'Has made redeveloping Brendale Square the centrepiece of his campaign.',
 '["Launched his campaign on a pledge to redevelop the plaza and end its flooding.", "Shared a conceptual sketch including green space, a public skating rink, a farmers'' market and a splash pad, saying any final design would need community input.", "Says he believes much of the cost could be covered by outside grants and brownfield redevelopment programs.", "The site has a history of commercial vacancies, aging infrastructure and contamination from a former landfill and a former gas station."]',
 'It''s been way too long that Brendale Square has looked the way it has. It''s been a blight on our town. It is one of the most important pieces of our town, and it needs to be better.',
 'https://doppleronline.ca/huntsville/morrison-pledges-to-end-flooding-at-brendale-square-during-huntsville-mayoral-campaign-launch/',
 'Huntsville Doppler — Morrison pledges to end flooding at Brendale Square during mayoral campaign launch',
 'local_news', '2026-05-21'),

('scott-morrison', 'mayor', 'roads-and-infrastructure',
 'Promises to end the annual flooding that hits Brendale Square businesses.',
 '["Says he has already done preliminary work and had discussions with the landowner.", "Planning reports have repeatedly identified extensive remediation and flood mitigation as prerequisites to redevelopment.", "Also cites what he describes as a 65 per cent increase in road spending during the current term."]',
 'Every year this happens, and I can tell you that I''ve done some work and I''m ready to fix it. I am going to fix it',
 'https://doppleronline.ca/huntsville/morrison-pledges-to-end-flooding-at-brendale-square-during-huntsville-mayoral-campaign-launch/',
 'Huntsville Doppler — Morrison pledges to end flooding at Brendale Square during mayoral campaign launch',
 'local_news', '2026-05-21'),

-- =====================================================================
-- DAN ARMOUR — Mayor (second source; he already has website positions)
-- =====================================================================

('dan-armour', 'mayor', 'taxes-and-spending',
 'Describes his platform as a return to basics: taxes, transparency and accountability.',
 '["Says he is prepared to undertake both a governance review and a financial review.", "Spoken at the Chamber meet-and-greet, 9 September 2026."]',
 'We need to start looking after our own. We need to start listening more, be more transparent, and stop the burden of taxes on all our constituents',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

-- =====================================================================
-- DAN CASWELL — Mayor (second source)
-- =====================================================================

('dan-caswell', 'mayor', 'district-table',
 'Wants a stronger Huntsville voice alongside a District chair now appointed by the Province.',
 '["Notes the District chair is appointed rather than elected.", "Frames the goal as Huntsville and the District working in harmony rather than in conflict."]',
 'Right now the District is having their chair appointed from the province, and I want to have a big voice, work along with that chair, so we, Huntsville and the District, work in harmony.',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

('dan-caswell', 'mayor', 'roads-and-infrastructure',
 'Maintain what the Town already owns before starting anything new.',
 '["Frames maintenance of existing assets as the priority over new projects.", "Raised alongside respecting taxpayers and healthcare readiness at the Chamber event."]',
 'We want to invest in some of the items that we already have before we look at new stuff',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

-- =====================================================================
-- REBECCA MELLO — Mayor
-- =====================================================================

('rebecca-mello', 'mayor', 'economy-and-downtown',
 'Focus on helping local businesses scale, and on stopping young adults leaving.',
 '["Names seasonality and a limited hiring pool as the constraints on local businesses.", "Frames growing jobs and a sustainable year-round framework as the way to combat what she calls the young adult exodus."]',
 'Areas that require focus include providing support to entrepreneurs and local businesses in scaling while meeting challenges, including seasonality, hiring pool limitations, and housing affordability and availability options.',
 'https://doppleronline.ca/huntsville/rebecca-mello-is-also-running-to-become-huntsvilles-next-mayor/',
 'Huntsville Doppler — Rebecca Mello is also running to become Huntsville''s next mayor',
 'local_news', '2026-05-05'),

('rebecca-mello', 'mayor', 'roads-and-infrastructure',
 'Names roads and public access to the lakes as needing attention.',
 '["Stated briefly, without further detail, in her announcement.", "A commenter on the article asked her to specify which roads and what kind of water access; the article does not record an answer."]',
 'Our roads and public access to lakes also need attention',
 'https://doppleronline.ca/huntsville/rebecca-mello-is-also-running-to-become-huntsvilles-next-mayor/',
 'Huntsville Doppler — Rebecca Mello is also running to become Huntsville''s next mayor',
 'local_news', '2026-05-05'),

('rebecca-mello', 'mayor', 'how-council-works',
 'Frames her approach as bringing people of different ages and backgrounds together.',
 '["Says interdisciplinary and intergenerational connection is central to her platform.", "Is the youngest candidate in the mayoral race."]',
 'Finally, bringing people together to learn from each other, that''s where our strength lies. This is what I will focus on.',
 'https://doppleronline.ca/huntsville/rebecca-mello-is-also-running-to-become-huntsvilles-next-mayor/',
 'Huntsville Doppler — Rebecca Mello is also running to become Huntsville''s next mayor',
 'local_news', '2026-05-05'),

-- A SECOND ROW ON how-council-works, four months after the first. Not a
-- conflict — the same theme, said again at the Chamber event — so it
-- stacks under both sources rather than carrying the red pill.
--
-- This quote was originally filed under growth-and-development on the
-- strength of the surrounding paragraph. It was moved: the words
-- themselves are about listening to residents and say nothing about
-- growth. Filing a quote under an issue it does not actually address is
-- how a summary starts drifting away from its source.
('rebecca-mello', 'mayor', 'how-council-works',
 'Says her campaign has been shaped by conversations with residents.',
 '["Told the Chamber meet-and-greet she wants to bring younger and older generations together and learn from their different experiences.", "Doppler also reported she emphasised protecting Huntsville''s natural environment and water and building a community attractive to families and retirees; that was the reporter''s summary, not a direct quotation, so it is not shown as her words."]',
 'Every person has a different story, and every person is showing me a different part of what Huntsville is made of',
 'https://doppleronline.ca/huntsville/huntsville-mayoral-candidates-make-their-pitch-at-chamber-meet-and-greet/',
 'Huntsville Doppler — Mayoral candidates make their pitch at Chamber meet and greet (event 9 Sep 2026)',
 'local_news', '2026-09-11'),

-- =====================================================================
-- PEGGY PETERSON — District and Town Councillor
-- =====================================================================

('peggy-peterson', 'district-and-town-councillor', 'taxes-and-spending',
 'Says property taxes are the biggest concern she hears, and wants spending priorities examined.',
 '["Says she has been hearing tax concerns for many years.", "Links the pressure to rising costs for housing, food and energy.", "Frames the response as examining spending priorities, services and long-term financial sustainability."]',
 'We have to take those pressures seriously and look carefully at spending priorities, services and long-term financial sustainability.',
 'https://doppleronline.ca/huntsville/peterson-campaigns-on-taxes-growth-and-protecting-huntsvilles-character/',
 'Huntsville Doppler — Peterson campaigns on taxes, growth and protecting Huntsville''s character',
 'local_news', '2026-08-28'),

('peggy-peterson', 'district-and-town-councillor', 'growth-and-development',
 'Puts the question as how Huntsville stays Huntsville while still growing.',
 '["Pairs responsible growth with environmental protection and natural character.", "Says she wants council to think beyond the next election cycle."]',
 'And I keep coming back to one question: How do we ensure Huntsville stays Huntsville? How do we nurture responsible growth while protecting our environment and respecting the natural character that makes this place so special?',
 'https://doppleronline.ca/huntsville/peterson-campaigns-on-taxes-growth-and-protecting-huntsvilles-character/',
 'Huntsville Doppler — Peterson campaigns on taxes, growth and protecting Huntsville''s character',
 'local_news', '2026-08-28'),

('peggy-peterson', 'district-and-town-councillor', 'environment',
 'Frames environmental protection as stewardship for future generations.',
 '["Started a professional gardening service in 1991 and later became involved in permaculture and education.", "Describes permaculture as responsible, respectful and resilient approaches to land use, food security and community systems."]',
 'I believe we need to think beyond the next election cycle and consider what kind of community we want to leave for future generations. For me, that means responsible stewardship, thoughtful growth, environmental protection, financial accountability and a willingness to listen.',
 'https://doppleronline.ca/huntsville/peterson-campaigns-on-taxes-growth-and-protecting-huntsvilles-character/',
 'Huntsville Doppler — Peterson campaigns on taxes, growth and protecting Huntsville''s character',
 'local_news', '2026-08-28'),

('peggy-peterson', 'district-and-town-councillor', 'how-council-works',
 'Says leadership means listening, asking hard questions and being accountable.',
 '["Says municipal government cannot solve every problem.", "Previously ran for mayor in 2018 and for Huntsville Ward councillor in 2022."]',
 'I don''t believe the government can solve everything, but I do believe good leadership means listening, asking difficult questions, working with others and being accountable for the decisions we make',
 'https://doppleronline.ca/huntsville/peterson-campaigns-on-taxes-growth-and-protecting-huntsvilles-character/',
 'Huntsville Doppler — Peterson campaigns on taxes, growth and protecting Huntsville''s character',
 'local_news', '2026-08-28'),

('peggy-peterson', 'district-and-town-councillor', 'parks-and-trails',
 'Wants a public decision about the Fairvern waterfront site before it is disposed of.',
 '["Raises what happens to the existing Fairvern property on the Muskoka River once the long-term care home moves.", "Says she is researching adaptive reuse options, which could include affordable or supportive housing, food security initiatives, community services or a community hub.", "Says all reasonable options should be examined before an irreversible decision."]',
 'I believe we should have clear assurances and a transparent public discussion about what happens to this important waterfront property when Fairvern moves to its new location. I want to see the community''s interests protected and meaningful public access to the waterfront maintained.',
 'https://doppleronline.ca/huntsville/peterson-campaigns-on-taxes-growth-and-protecting-huntsvilles-character/',
 'Huntsville Doppler — Peterson campaigns on taxes, growth and protecting Huntsville''s character',
 'local_news', '2026-08-28'),

-- =====================================================================
-- JAMES BOWLER — District and Town Councillor
-- =====================================================================

('james-bowler', 'district-and-town-councillor', 'taxes-and-spending',
 'Frames the councillor''s job as oversight of how tax dollars are used.',
 '["Wants more open conversation about municipal spending at both the Town and the District.", "Says he would examine how services are delivered and look for efficiencies without jeopardising services residents rely on."]',
 'Councillors have a responsibility to oversee those dollars and make sure they are being used in ways that genuinely benefit the people who pay them.',
 'https://doppleronline.ca/huntsville/muskoka-journalist-james-bowler-makes-a-run-for-huntsville-district-council/',
 'Huntsville Doppler — Muskoka journalist James Bowler makes a run for Huntsville District council',
 'local_news', '2026-08-14'),

('james-bowler', 'district-and-town-councillor', 'how-council-works',
 'Would carry a reporter''s habit of listening first into the council chamber.',
 '["Spent more than a decade reporting on Muskoka municipal councils before running.", "Names increasing transparency and public discussion of spending as a priority.", "Doppler also reported he plans to focus on access to primary care, downtown safety and waste collection; those were the reporter''s summary and are not quoted here."]',
 'I''ve spent my career listening to people from all sides of an issue. I want to bring that same approach to District council: listen first, understand the issue, and then work with others to find practical solutions.',
 'https://doppleronline.ca/huntsville/muskoka-journalist-james-bowler-makes-a-run-for-huntsville-district-council/',
 'Huntsville Doppler — Muskoka journalist James Bowler makes a run for Huntsville District council',
 'local_news', '2026-08-14'),

-- =====================================================================
-- KARIN TERZIANO — Huntsville and Chaffey Ward
-- =====================================================================

('karin-terziano', 'wards-1-2', 'taxes-and-spending',
 'Running on the argument that recent levy and payroll growth is unaffordable.',
 '["Says the Town levy has risen 37 per cent, about $4.5 million, over the past four years, and municipal payroll 41 per cent. These are her figures, reported by Doppler; SmarterVote has not independently verified them.", "Wants council to review and repeal bylaws that allow spending before the annual budget is approved.", "Served 12 years on Huntsville Town Council between 2010 and 2022 and says the Town was in an excellent financial position when she left."]',
 'Many of our residents simply cannot afford these increases',
 'https://doppleronline.ca/huntsville/karin-terziano-seeks-return-to-huntsville-council-cites-spending-and-tax-concerns/',
 'Huntsville Doppler — Karin Terziano seeks return to Huntsville council, cites spending and tax concerns',
 'local_news', '2026-07-24'),

('karin-terziano', 'wards-1-2', 'how-council-works',
 'Offers accessibility and follow-through as what she would bring back to the table.',
 '["Doppler also reported she pledged a common-sense approach to development decisions and improved staff efficiency; those were the reporter''s summary and are not quoted here."]',
 'I will be an approachable council member who will listen to your concerns and act upon them.',
 'https://doppleronline.ca/huntsville/karin-terziano-seeks-return-to-huntsville-council-cites-spending-and-tax-concerns/',
 'Huntsville Doppler — Karin Terziano seeks return to Huntsville council, cites spending and tax concerns',
 'local_news', '2026-07-24'),

-- =====================================================================
-- STEPHEN HERNEN — Huntsville and Chaffey Ward
-- =====================================================================

('stephen-hernen', 'wards-1-2', 'how-council-works',
 'Says local government is a service organisation as much as a regulatory one.',
 '["Says good government begins by putting people first.", "Argues regulation matters for protecting communities and the environment, but should be applied with common sense and practical solutions.", "Brings 37 years of municipal experience, including as Huntsville Fire Chief and Director of Protective Services, and has also worked as a private developer.", "Ran for Mayor of Huntsville in 2022."]',
 'That [good government] means listening carefully, understanding the needs and priorities of residents, and making thoughtful decisions that balance those needs with responsible financial management and available resources.',
 'https://doppleronline.ca/huntsville/stephen-hernen-announces-bid-for-town-chaffey-wards-council-seat/',
 'Huntsville Doppler — Stephen Hernen announces bid for Town/Chaffey Ward council seat',
 'local_news', '2026-08-04'),

-- =====================================================================
-- MICHAEL LOWE — Huntsville and Chaffey Ward
-- =====================================================================

('michael-lowe', 'wards-1-2', 'taxes-and-spending',
 'Argues rising taxes are pushing people out of Huntsville.',
 '["Points to what he describes as an almost 30 per cent increase in municipal taxes over the past term. This is his figure, reported by Doppler; SmarterVote has not independently verified it.", "Wants the Town to take a closer look at its spending.", "Would explore incentives to attract doctors and young families."]',
 'Taxes are driving people away',
 'https://doppleronline.ca/huntsville/michael-lowe-files-to-run-for-huntsville-and-chaffey-ward-council-seat/',
 'Huntsville Doppler — Michael Lowe files to run for Huntsville and Chaffey Ward council seat',
 'local_news', '2026-08-11'),

('michael-lowe', 'wards-1-2', 'how-council-works',
 'Proposes regular public meetings and says his job would be to listen, not to arrive with answers.',
 '["Says a lot of people want to be heard and nobody seems to be listening.", "Proposes regular public meetings where residents could raise concerns, suggest ideas and discuss solutions.", "Says he does not expect to have an immediate answer to every issue, but will ask questions and back what makes sense for residents."]',
 'It''s not what I want done; it''s what the residents of Huntsville and Chaffey want done',
 'https://doppleronline.ca/huntsville/michael-lowe-files-to-run-for-huntsville-and-chaffey-ward-council-seat/',
 'Huntsville Doppler — Michael Lowe files to run for Huntsville and Chaffey Ward council seat',
 'local_news', '2026-08-11'),

('michael-lowe', 'wards-1-2', 'roads-and-infrastructure',
 'Wants winter sidewalk clearing treated as an accessibility problem, not a nicety.',
 '["Says a close friend who uses a wheelchair has shown him the barriers that remain in the community.", "Argues accessibility means more than an automatic door: once inside, people need to be able to move around safely.", "Also raises accessible access to businesses and public facilities."]',
 'I find it really disturbing looking outside my window and watching a person in a wheelchair going down a main road because the sidewalks haven''t been done in the middle of the day yet.',
 'https://doppleronline.ca/huntsville/michael-lowe-files-to-run-for-huntsville-and-chaffey-ward-council-seat/',
 'Huntsville Doppler — Michael Lowe files to run for Huntsville and Chaffey Ward council seat',
 'local_news', '2026-08-11'),

-- =====================================================================
-- MONTY CLOUTHIER — Brunel Ward
-- =====================================================================

('monty-clouthier', 'ward-6', 'taxes-and-spending',
 'Defends the term''s tax increases as catching up on deferred maintenance, and says the worst is done.',
 '["Says equipment replacement and building maintenance were kept to a minimum during the COVID years and had to be caught up.", "Cites the price of a truck tire rising from about $400 to about $975 as an example of cost escalation."]',
 'We''ve upgraded a lot of our facilities, did repairs on them. That stuff is done, so we can go forward and keep the taxes at a minimum',
 'https://doppleronline.ca/huntsville/huntsville-councillor-monty-clouthier-is-running-again-for-brunel-ward/',
 'Huntsville Doppler — Huntsville Councillor Monty Clouthier is running again for Brunel Ward',
 'local_news', '2026-05-03'),

('monty-clouthier', 'ward-6', 'roads-and-infrastructure',
 'Wants a salt dome built first, then the new operations centre phased in over years.',
 '["Argues the absence of a salt dome is costing the Town money every year.", "Wants the new operations building rebuilt on the Town''s existing property in phases to limit the impact on the tax base.", "Points to work on Swallowdale Road, West Browns Road and Otter Lake Road during the current term."]',
 'We don''t have a salt dome, and it''s costing us a lot of extra money because we don''t. So I''d like to see a salt dome built first and then a phased-in approach over the years of the whole operation there',
 'https://doppleronline.ca/huntsville/huntsville-councillor-monty-clouthier-is-running-again-for-brunel-ward/',
 'Huntsville Doppler — Huntsville Councillor Monty Clouthier is running again for Brunel Ward',
 'local_news', '2026-05-03'),

('monty-clouthier', 'ward-6', 'how-council-works',
 'Acknowledges the term was controversial and stands by the decisions.',
 '["Says he has learned a lot over four years and wants to keep representing Brunel specifically.", "Notes some residents are unhappy about traffic calming barriers on Woodland Heights and says he is working with that group."]',
 'I''ve actually enjoyed myself doing the job. I know it''s been quite controversial at times, but a lot of tough decisions were made with this council.',
 'https://doppleronline.ca/huntsville/huntsville-councillor-monty-clouthier-is-running-again-for-brunel-ward/',
 'Huntsville Doppler — Huntsville Councillor Monty Clouthier is running again for Brunel Ward',
 'local_news', '2026-05-03')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_type, source_date)
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------
-- VERIFY — single query.
-- ---------------------------------------------------------------------
select 'positions in this batch' as "Check",
       count(*)::text || ' of 41 expected' as "Result"
from   positions
where  source_date in ('2026-09-13','2026-09-11','2026-08-28','2026-08-14',
                       '2026-08-11','2026-08-04','2026-07-24','2026-05-21',
                       '2026-05-05','2026-05-03')
  and  status = 'in_review'
union all
select 'every row has a quote and a source',
       case when not exists (
         select 1 from positions
         where status = 'in_review'
           and no_public_position = false
           and (verbatim_quote is null or source_url is null)
       ) then 'PASS' else 'FAIL — a row is missing one' end
union all
select 'no row failed to match a candidate or issue',
       case when not exists (
         select 1 from positions where candidate_id is null or issue_id is null
       ) then 'PASS' else 'FAIL — check the slugs' end
union all
select 'nothing flagged conflicting in this batch',
       case when not exists (
         select 1 from positions where is_conflicting = true and status = 'in_review'
       ) then 'PASS — none' else 'some flagged; check they really conflict' end
union all
select 'candidates with at least one position',
       count(distinct candidate_id)::text || ' of 28'
from   positions;

-- ---------------------------------------------------------------------
-- WHAT IS STILL MISSING, AND WHY
--
-- TEN CANDIDATES STILL HAVE NOTHING. No website, no Doppler article:
--   Brian Ellas, Helena Renwick (District and Town)
--   Jason FitzGerald, Dione Schumacher (Stisted/Stephenson/Port Sydney)
--   Elizabeth Purcell, Bruce Reain (TLDSB trustee)
--   Joshua Boutotte (SMCDSB, acclaimed)
--   Bruce Cazabon (CSPNE, acclaimed)
--   Donald Blais, Innocent Legrand (CSC MonAvenir)
-- These are NOT marked "no public position found". We have not finished
-- looking. The 22 September all-candidates meeting at Utterson Hall is the
-- next real chance, followed by writing to every candidate in early October.
--
-- THINGS DOPPLER PARAPHRASED BUT DID NOT QUOTE, so we could not use them:
--   Bowler on primary care, downtown safety and waste collection
--   Morrison on the Affordable Housing Action Plan and accessory dwelling units
--   Terziano on development decisions and staff efficiency
--   Hernen on fiscal responsibility and affordability
--   Lowe on youth recreation and the balance between tourism and residents
--   Mello on protecting the natural environment and water
-- Each of these is a real position we simply cannot print in quotation
-- marks. They are good questions to put to the candidate directly.
--
-- TWO PLATFORM PILLARS HAVE NO ISSUE TO LIVE IN:
--   Rylind Davis campaigns heavily on (a) police and fire services and
--   (b) transit and accessible transportation. Neither fits the ten
--   approved issues. See 09_two_more_issues_OPTIONAL.sql — do not run it
--   without deciding first.
--
-- SOCIAL LINKS OBSERVED, NOT YET VERIFIED:
--   Geordie Sabbagh's own campaign website publishes an Instagram and a
--   Facebook address in its footer. Because he published them himself
--   they are almost certainly his — but "almost certainly" is what went
--   wrong last time. They are listed at the bottom of
--   09_two_more_issues_OPTIONAL.sql for you to open and confirm before
--   anything is inserted into verified_links.
-- ---------------------------------------------------------------------
