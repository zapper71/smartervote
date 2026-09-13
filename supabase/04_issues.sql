-- =====================================================================
-- SmarterVote.ca — issue taxonomy
-- Town of Huntsville, 2026 municipal election
--
-- APPROVED BY ANDREAS, 13 September 2026.
-- Derived from reading six candidate platforms in depth, not from
-- assumptions about what municipal issues usually are. See
-- docs/issue-taxonomy-v2.md for the evidence behind each one.
--
-- THIS IS THE EDITORIAL SPINE OF THE SITE. Every candidate is described
-- against this same list, in this same order, or comparison is meaningless.
-- Changing it after positions are published means re-reviewing everything.
--
-- sort_order is presentation order, NOT a ranking of importance. The
-- methodology page says so; keep it that way.
--
-- Run AFTER 01_schema.sql and 02_seed.sql. Safe to re-run.
-- =====================================================================

begin;

with m as (select id from municipalities where slug = 'huntsville')
insert into issues (municipality_id, name, slug, voter_question, description, sort_order)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order
from m, (values

('Taxes, spending and value for money',
 'taxes-and-spending',
 'What happens to my tax bill, and where does the money go?',
 'The municipal levy and the District portion, efficiencies and waste, and what a candidate would cut or fund. Raised by all six candidates whose platforms we read — the most universal issue in this election.',
 1),

('Roads, infrastructure and the basics',
 'roads-and-infrastructure',
 'Will the things I use every day actually get fixed?',
 'Roads, sidewalks, bridges, snow removal, water and wastewater, safe intersections. Named specifics include Chaffey Township Road, winter sidewalk clearing, safe routes to school, the aging Operations Centre, and rural cell service.',
 2),

('How council works',
 'how-council-works',
 'How would this person actually govern?',
 'Transparency, public consultation, communication and accountability. In a non-partisan municipal race voters are choosing judgment and temperament, not a party platform — which makes this one of the most useful sections on the page.',
 3),

('Growth, development and community character',
 'growth-and-development',
 'How much should Huntsville grow, and where?',
 'The Official Plan, the height and density plan, intensification versus rural character, and whether infrastructure keeps pace with approved development. Almost every candidate frames this as a balance rather than a yes or no.',
 4),

('Housing and affordability',
 'housing',
 'Can people who work here afford to live here?',
 'Purpose-built rental, attainable housing, secondary dwelling units, seniors on fixed incomes, and young people priced out of the town they grew up in. Specific levers named include reducing or eliminating development charges on qualifying rental projects.',
 5),

('Healthcare and the new hospital',
 'healthcare-and-hospital',
 'Can I see a doctor, and how will we pay for the new hospital?',
 'The local share of the new hospital — one candidate puts it at $10 million — plus doctor and nurse-practitioner recruitment. Note that most of healthcare is provincial: council controls the local share, recruitment incentives and advocacy, and the page should be clear about that line.',
 6),

('Environment, lakes and dark skies',
 'environment',
 'Who is protecting the lakes and the night sky?',
 'Shoreline development and water quality, forests and natural heritage, the weight given to environmental studies in planning decisions, and the Dark Sky outdoor lighting bylaw — a distinctly Muskoka issue with a real enforcement record.',
 7),

('Huntsville''s place at the District table',
 'district-table',
 'Is the two-tier system working for Huntsville, or costing us?',
 'Duplication between Town and District, how much planning authority sits at the District, and whether Huntsville leads or reacts. A genuine dividing line in this election. This section needs a plain-language explainer of what the District actually does — most voters have never had it laid out.',
 8),

('Local economy, jobs and downtown',
 'economy-and-downtown',
 'Will there be decent work here, and a downtown worth walking to?',
 'Business attraction and retention, downtown vitality, Brendale Square, and tourism. The underlying problem named by candidates: seasonal, part-time and low-paying work alongside an influx of outside wealth pushing up local costs.',
 9),

('Parks, trails and active transportation',
 'parks-and-trails',
 'Can you get around safely without a car, and are the parks and trails looked after?',
 'The Parks and Trails Master Plan, trail connections between neighbourhoods, cycling and pedestrian safety, and year-round accessibility of parks and public spaces.',
 10)

) as v(name, slug, voter_question, description, sort_order)
on conflict (municipality_id, slug) do update set
    name           = excluded.name,
    voter_question = excluded.voter_question,
    description    = excluded.description,
    sort_order     = excluded.sort_order;

commit;

-- ---------------------------------------------------------------------
-- VERIFY — single query so the SQL Editor actually shows it.
-- Expect 10 rows, sort_order 1 through 10, no gaps, no duplicates.
-- ---------------------------------------------------------------------
select i.sort_order            as "#",
       i.name                  as "Issue",
       i.voter_question        as "Voter question",
       case when count(*) over () = 10 then 'PASS — 10 issues loaded'
            else 'FAIL — expected 10, found ' || count(*) over () end as "Result"
from   issues i
join   municipalities m on m.id = i.municipality_id
where  m.slug = 'huntsville'
order  by i.sort_order;
