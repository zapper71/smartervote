-- =====================================================================
-- SmarterVote.ca — candidate positions, batch 1
--
-- Extracted 13 September 2026 from candidates' own campaign websites.
-- 8 candidates, 47 positions.
--
-- EVERY ROW carries a verbatim quote and a source URL. Summaries restate
-- only what the quoted text says — no inference, no outside knowledge.
--
-- status = 'in_review'. NOTHING here is visible on the site until you
-- approve it. The public_positions view only shows status='published'.
--
-- Candidates NOT in this batch, and why:
--   Geordie Sabbagh, Rylind Davis — have websites, but their platforms sit
--     across many sub-pages still to be read. Next batch.
--   The 18 candidates with no website — need the local-news pass and the
--     22 Sep all-candidates meeting. Deliberately NOT marked
--     'no public position found' yet: we haven't finished looking, so
--     saying so would be a claim we haven't earned.
--
-- Run AFTER 04_issues.sql. Safe to re-run.
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
    v.source_url, v.source_title, 'candidate_website', v.source_date::date,
    'in_review', 0.90
from m, (values

('dan-armour', 'mayor', 'taxes-and-spending',
 'Wants a full financial and governance review before any new spending.',
 '["Control municipal spending and improve efficiencies.", "Undertake a comprehensive financial and governance review.", "Says he will ask harder questions before Council spends or raises taxes."]',
 'Control municipal spending, improve efficiencies, and recognize the financial pressures facing residents, families, and businesses.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'housing',
 'Would look at cutting development charges on qualifying rental projects.',
 '["Supports purpose-built rental housing.", "Would explore reducing or eliminating development charges on qualifying rental projects."]',
 'Support the development of purpose-built rental housing by exploring opportunities to reduce or eliminate development charges on qualifying rental projects.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'how-council-works',
 'Wants Council to get “back to the basics” of listening and transparency.',
 '["Meaningful engagement and open communication.", "Says residents should understand where tax money goes before it is raised."]',
 'Ensure residents have a strong voice through meaningful engagement, open communication, and transparent decision-making.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'growth-and-development',
 'Supports growth that protects Huntsville’s character and quality of life.',
 '["Frames growth as something to be managed rather than stopped."]',
 'Support growth that strengthens our community while protecting the character, environment, and quality of life that make Huntsville special.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'healthcare-and-hospital',
 'Backs the new hospital and working with community partners on healthcare.',
 '["Supports efforts to strengthen healthcare services.", "Notes plans moving forward for a new hospital."]',
 'Support efforts to strengthen healthcare services and continue to work with community partners as plans move forward for a new hospital.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'environment',
 'Protect lakes, rivers and forests alongside responsible development.',
 '["Environmental stewardship paired with responsible development."]',
 'Protect our lakes, rivers, forests, and natural spaces while promoting responsible development and environmental stewardship.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'roads-and-infrastructure',
 'Continue investing in roads and municipal services for current and future residents.',
 '["Frames infrastructure investment as serving both today’s residents and future growth."]',
 'Continue investing in roads, infrastructure, and municipal services to support both current residents and future growth.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-armour', 'mayor', 'economy-and-downtown',
 'Support local business and attract investment to create jobs.',
 '["Business support, investment attraction, job creation."]',
 'Support local businesses, attract investment, and encourage economic growth that creates jobs and opportunities.',
 'https://danarmour4mayor.ca/', 'Dan Armour campaign website — Platform', '2026-09-13'),

('dan-caswell', 'mayor', 'healthcare-and-hospital',
 'Wants a dedicated fund built now for Huntsville’s $10 million hospital share.',
 '["Proposes a dedicated Huntsville Community Hospital Fund.", "Targets the $10 million local share he says will be required.", "Wants milestones published so residents can see how prepared the Town is.", "Says the money should come from efficiencies rather than from roads and trails budgets."]',
 'My focus is to support a dedicated Huntsville Community Hospital Fund, focused on preparing for the required $10 million local share.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('dan-caswell', 'mayor', 'taxes-and-spending',
 'Responsible spending means setting priorities and showing residents the value.',
 '["Reduce waste, find efficiencies, set clear priorities.", "Argues major expenses should not catch the Town off guard."]',
 'Every tax dollar comes from someone’s hard work. That should matter every time a decision is made.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('dan-caswell', 'mayor', 'roads-and-infrastructure',
 'Treats roads, sidewalks, trails and facilities as daily life, not line items.',
 '["Maintain what exists before adding new.", "Practical improvements residents can see and feel."]',
 'Residents deserve roads, trails, parks, sidewalks, facilities, and services they can count on.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('dan-caswell', 'mayor', 'district-table',
 'Wants Huntsville leading at the District table rather than reacting.',
 '["Better communication, less duplication, stronger representation.", "Argues overlapping services and slow decisions cost residents money."]',
 'Huntsville should not be reacting from the sidelines. We should be leading the conversation.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('dan-caswell', 'mayor', 'how-council-works',
 'Says good leadership starts with listening, including to people who disagree.',
 '["Wants to hear from residents who see things differently.", "Residents should feel heard before decisions are made, not after."]',
 'Residents deserve to feel heard before decisions are made, not after.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('dan-caswell', 'mayor', 'growth-and-development',
 'Frames decisions in terms of what the next generation inherits.',
 '["Responsible growth and long-term planning.", "Protecting Huntsville’s character while making room for growth."]',
 'Planning for future generations means protecting what makes Huntsville feel like home while making room for responsible growth.',
 'https://www.caswellformayor.ca/mypriorities', 'Dan Caswell campaign website — My Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'housing',
 'Wants to find every opportunity to add rental housing.',
 '["Support development that serves local housing needs.", "Work with developers on affordable options."]',
 'Find every opportunity to create more rental housing.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'healthcare-and-hospital',
 'Wants the new hospital moving quickly and more doctors recruited.',
 '["Says a doctor recruitment program he co-created has attracted 8 new doctors.", "Continue recruiting doctors and nurse practitioners."]',
 'Ensure the new hospital moves forward quickly.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'environment',
 'Points to the Dark Sky bylaw as a model for protecting Huntsville as it grows.',
 '["Was Town spokesman for the outdoor lighting bylaw.", "Wants to build on it with sustainable growth."]',
 'Earnestly protect our environment as Huntsville grows.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'taxes-and-spending',
 'Says he voted against a District Council salary increase.',
 '["Frames fiscal responsibility as respect for taxpayers’ money.", "Lists reducing the future tax levy as a priority."]',
 'Listen to the people and never forget it’s their money.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'district-table',
 'Wants to reduce the size and influence of District Planning.',
 '["Also lists replacing the aging Operations Centre and making Muskoka Heritage Place break even."]',
 'Reduce the size and influence of District Planning.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'economy-and-downtown',
 'Wants a real solution for Brendale Square and support for downtown.',
 '["Support local businesses and downtown vitality.", "Smart, measured development that fits Huntsville."]',
 'Find a real solution for Brendale Square.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'parks-and-trails',
 'Wants more active transportation trails connecting neighbourhoods.',
 '["Chairs the Active Transportation and Transit Committee.", "Connect neighbourhoods with safe routes."]',
 'Create more active transportation trails.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('bob-stone', 'district-and-town-councillor', 'growth-and-development',
 'Points to a height and density plan that sets where development cannot go.',
 '["Chaired Planning Council when the plan was created.", "Frames it as protecting what residents value, not only enabling building."]',
 'As Chair of Planning Council we created a plan that not only shows where it’s appropriate to build taller, BUT more importantly lays out where development cannot go to protect what we love about Huntsville.',
 'https://votebobstone.ca/', 'Bob Stone campaign website — Future Priorities', '2026-09-13'),

('leland-maw', 'district-and-town-councillor', 'housing',
 'Frames housing as keeping local workers, young families and seniors in town.',
 '["Supports dignified, attainable and low-income housing choices.", "Says rising costs are driving out the local workforce."]',
 'Our community thrives when the people who build it, work in it, and care for it can actually afford to live here.',
 'https://www.lelandmawforcouncil.ca', 'Leland Maw campaign website — Campaign Priorities', '2026-09-13'),

('leland-maw', 'district-and-town-councillor', 'how-council-works',
 'Wants local government to be understandable, not confusing.',
 '["Says trust is built when neighbours are genuinely informed and involved.", "Wants everyday neighbourhood concerns acted on, not lost."]',
 'Local government should be accessible, clear, and easy to understand—not confusing.',
 'https://www.lelandmawforcouncil.ca', 'Leland Maw campaign website — Campaign Priorities', '2026-09-13'),

('leland-maw', 'district-and-town-councillor', 'roads-and-infrastructure',
 'Focuses on sidewalk safety, traffic calming and neighbourhood maintenance.',
 '["Advocating for a fair share of local infrastructure funding.", "Ensuring streets are safe for kids and seniors."]',
 'Well-maintained roads, safe sidewalks, and reliable local infrastructure are the foundation of a strong community.',
 'https://www.lelandmawforcouncil.ca', 'Leland Maw campaign website — Campaign Priorities', '2026-09-13'),

('leland-maw', 'district-and-town-councillor', 'economy-and-downtown',
 'Says the local jobs problem is seasonal, part-time and low-paying work.',
 '["Argues Muskoka needs younger people and families but lacks year-round work.", "Links an influx of outside wealth to rising local costs."]',
 'Right now, the big issue is that most of our jobs are seasonal, part-time, and low-paying.',
 'https://www.lelandmawforcouncil.ca', 'Leland Maw campaign website — Campaign Priorities', '2026-09-13'),

('leland-maw', 'district-and-town-councillor', 'district-table',
 'Wants to bridge taxpayers and residents with regional governance.',
 '["Says residents’ voices get lost in bureaucracy."]',
 'I am committed to bridging the gap between taxpayers, local residents, and regional governance, ensuring your voice is never lost in bureaucracy.',
 'https://www.lelandmawforcouncil.ca', 'Leland Maw campaign website — Campaign Priorities', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'how-council-works',
 'Would publish why she voted the way she did on each decision.',
 '["Regular ward town halls and open office hours.", "Publish summaries of what information was considered and how public input shaped the outcome.", "Says she would approach issues without a predetermined agenda."]',
 'Publish clear summaries of why votes are cast, what information was considered, and how public input shaped the outcome.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'growth-and-development',
 'Wants development aligned to the Official Plan with residents consulted early.',
 '["Supports development aligned with the Official Plan and Strategic Plan.", "Says residents should be heard at the start of planning.", "Intensification belongs closer to existing services; protect rural Chaffey character."]',
 'Residents should be heard at the start of planning, not after a decision is essentially made.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'roads-and-infrastructure',
 'Prioritises finishing the Chaffey Township Road reconstruction.',
 '["Pedestrian safety work near schools and growing residential areas.", "Evidence-first asset management for roads, sidewalks and trails."]',
 'Prioritize timely completion of that [Chaffey Township Road] reconstruction and related pedestrian safety work.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'parks-and-trails',
 'Wants ward voices represented in the Parks and Trails Master Plan.',
 '["Parks and trails for families, seniors, youth and people wanting quiet natural space.", "Champions accessibility and year-round usability."]',
 'Represent Huntsville and Chaffey voices in the ongoing Parks and Trails Master Plan.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'taxes-and-spending',
 'Wants a clear cost-benefit analysis before any major spending.',
 '["Focus on municipal responsibilities and efficient use of what exists.", "Use partnerships to stretch local dollars."]',
 'Demand a clear analysis before major spending.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('louisa-chiaramonte', 'wards-1-2', 'environment',
 'Wants environmental studies and public input given full weight in planning.',
 '["Uphold protection of natural features as a Strategic Plan priority.", "Balance growth with lakes, forests and open spaces."]',
 'Environmental studies and public input get full weight in development decisions.',
 'https://louisachiaramonte.ca/', 'Louisa Chiaramonte campaign website — Platform', '2026-09-13'),

('tyler-ellis', 'wards-3-4-5', 'roads-and-infrastructure',
 'Wants a published five-year rural roads schedule, worst roads first.',
 '["Publish road rankings and planned construction years.", "Address drainage and culverts before resurfacing.", "Keep road-project savings inside the roads program.", "Says funding should come from existing allocations and senior-government grants, not a new road tax."]',
 'I will work for a publicly available five-year rural roads schedule based on road condition, safety, drainage, emergency access and the cost of delaying repairs.',
 'https://tylerwilliamellis.com', 'Tyler Ellis campaign website — A Plan That Can Be Measured', '2026-09-13'),

('tyler-ellis', 'wards-3-4-5', 'taxes-and-spending',
 'Targets $300,000 in recurring savings — about a 1% tax rate cut.',
 '["Line-by-line budget and service review before any tax increase.", "Publish the tax impact of every proposed program or position.", "Says relief must come from permanent efficiencies, not depleted reserves."]',
 'My goal will be to identify at least $300,000 in recurring efficiencies—approximately the amount required for a 1% reduction in Huntsville’s municipal tax rate—subject to verification by Town staff.',
 'https://tylerwilliamellis.com', 'Tyler Ellis campaign website — A Plan That Can Be Measured', '2026-09-13'),

('tyler-ellis', 'wards-3-4-5', 'how-council-works',
 'Wants rotating rural office hours and an annual ward service report.',
 '["Publish an annual Wards 3, 4 & 5 service and investment report.", "Clearly identify whether a concern belongs to the Town or the District.", "Provide telephone and in-person options, not online-only communication."]',
 'I will make representation more accessible by holding regular community office hours and public meetings throughout Stisted, Stephenson and Port Sydney.',
 'https://tylerwilliamellis.com', 'Tyler Ellis campaign website — A Plan That Can Be Measured', '2026-09-13'),

('tyler-ellis', 'wards-3-4-5', 'parks-and-trails',
 'Would build a business case for a rural recreation hub before committing money.',
 '["Notes the Community Services Master Plan found an additional arena was not needed immediately.", "Would update participation data and compare arena, multi-use hub and covered rink options.", "Would not support construction without outside capital and a sustainable operating plan."]',
 'I will not ignore that evidence or promise an unaffordable building simply for political appeal.',
 'https://tylerwilliamellis.com', 'Tyler Ellis campaign website — A Plan That Can Be Measured', '2026-09-13'),

('tyler-ellis', 'wards-3-4-5', 'district-table',
 'Wants residents told plainly whether an issue is Town or District.',
 '["Frames it as part of making representation accessible."]',
 'Clearly identify whether concerns belong to the Town or District.',
 'https://tylerwilliamellis.com', 'Tyler Ellis campaign website — A Plan That Can Be Measured', '2026-09-13'),

('michael-ankenmann', 'ward-6', 'taxes-and-spending',
 'Says taxes rose almost 30% in four years and wants that reversed.',
 '["Argues services have not kept pace with the increases.", "Wants spending and taxes brought back down."]',
 'Taxes have gone up almost 30% in four years, and residents haven’t seen services keep pace.',
 'https://www.michaelankenmann.ca/', 'Michael Ankenmann campaign website — Principles for Town Council', '2026-09-13'),

('michael-ankenmann', 'ward-6', 'how-council-works',
 'Wants a smaller Council role — essentials only, no pet projects.',
 '["Says Council should stay out of residents’ property and private lives.", "Wants Town Hall fast and straightforward to deal with."]',
 'Council should stick to the essentials and stay out of your business, your property, and your life. Council should provide thoughtful leadership, not chase pet projects.',
 'https://www.michaelankenmann.ca/', 'Michael Ankenmann campaign website — Principles for Town Council', '2026-09-13'),

('michael-ankenmann', 'ward-6', 'growth-and-development',
 'Supports growth “on our terms” to preserve Huntsville’s character.',
 '["Frames growth as inevitable but shapeable.", "Emphasis on the historic and quaint character of the town."]',
 'Huntsville is growing. But growth should happen on our terms, in a way that protects the friendly, quaint, historic, and beautiful community we all chose to call home.',
 'https://www.michaelankenmann.ca/', 'Michael Ankenmann campaign website — Principles for Town Council', '2026-09-13'),

('kirsty-koop', 'ward-6', 'housing',
 'Wants more housing choices so people are not priced out of Brunel.',
 '["Supports secondary dwelling units and attainable housing options.", "Names young adults, squeezed families and seniors as those affected."]',
 'People shouldn’t have to leave the community they love simply because they can no longer afford to live here.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13'),

('kirsty-koop', 'ward-6', 'taxes-and-spending',
 'Wants Council to examine spending and show residents the value.',
 '["Names young people, families and seniors on fixed incomes.", "Says growth must be financially sustainable."]',
 'Residents deserve to know they are getting good value for their tax dollars.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13'),

('kirsty-koop', 'ward-6', 'roads-and-infrastructure',
 'Focuses on rural basics — roads, bridges, snow removal and cell service.',
 '["Names safe intersections and reliable cell service as rural concerns.", "Wants infrastructure spending planned carefully."]',
 'Living in Brunel Ward means that roads, bridges, snow removal, safe intersections, reliable cell service and other essential services matter.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13'),

('kirsty-koop', 'ward-6', 'growth-and-development',
 'Wants infrastructure and services to keep pace with growth.',
 '["Says protecting lakes, forests and dark skies should stay part of growth decisions."]',
 'I believe development should be thoughtful and responsible, with infrastructure and services keeping pace with growth, while respecting our natural environment and character of our neighbourhoods.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13'),

('kirsty-koop', 'ward-6', 'environment',
 'Says lakes, forests and dark skies belong in every growth decision.',
 '["Ties environmental protection directly to development choices."]',
 'Protecting our lakes, forests and dark skies should remain part of the conversation as desicions [sic] about future growth are made.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13'),

('kirsty-koop', 'ward-6', 'how-council-works',
 'Wants to be reachable, and for residents to feel heard even when they disagree.',
 '["Says residents know their own roads and neighbourhoods best.", "Commits to listening, asking questions and communicating openly."]',
 'You may not always get the answer you hoped for, but you should always feel heard, respected, and represented.',
 'https://www.kirstyforbrunel.ca/priorities', 'Kirsty Koop campaign website — My Priorities', '2026-09-13')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_date)
on conflict (candidate_id, issue_id) do update set
    summary_short   = excluded.summary_short,
    summary_bullets = excluded.summary_bullets,
    verbatim_quote  = excluded.verbatim_quote,
    source_url      = excluded.source_url,
    source_title    = excluded.source_title,
    source_date     = excluded.source_date,
    status          = 'in_review';

commit;

-- ---------------------------------------------------------------------
-- VERIFY — single query. Expect 47 rows, all 'in_review',
-- every one with a quote and a source, and zero orphans.
-- ---------------------------------------------------------------------
select c.name                         as "Candidate",
       i.name                         as "Issue",
       left(p.summary_short, 60)      as "Summary",
       p.status                       as "Status",
       case
         when p.candidate_id is null or p.issue_id is null then 'FAIL — orphan row'
         when p.verbatim_quote is null or p.source_url is null then 'FAIL — missing source'
         else 'ok'
       end                            as "Result"
from   positions p
join   candidates c on c.id = p.candidate_id
join   issues i     on i.id = p.issue_id
order  by c.name, i.sort_order;
