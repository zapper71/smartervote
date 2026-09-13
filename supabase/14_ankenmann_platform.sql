-- =====================================================================
-- SmarterVote.ca — Michael Ankenmann, batch 3
--
-- WHY THIS EXISTS: WE WERE PUBLISHING SOMETHING UNTRUE ABOUT HIM
--
-- Ankenmann has three positions on the site. All three came from the four
-- short "Principles for Town Council" blocks on his home page, because
-- that is as far as I read when extracting batch 1. He has a separate
-- /platform page which is one of the most detailed in this election, and
-- it says things about four issues where his cells currently read:
--
--     "No public statement found as of 13 September 2026."
--
-- That sentence is a claim, and for healthcare, housing, economy and the
-- environment it was false. Worse, it was false in the direction that
-- makes a candidate look emptier than he is — the precise failure the
-- fairness section of the methodology page promises to avoid. A blank on
-- this site is supposed to mean we looked and found nothing. Here we
-- simply had not finished looking.
--
-- This is a correction, not an addition. It is going in before launch.
--
-- ---------------------------------------------------------------------
-- EIGHT NEW ROWS. THREE OF THEM STACK.
--
-- Five fill genuine blanks: healthcare, housing, economy, environment,
-- parks.
--
-- Three more — taxes, how council works, growth — sit alongside the
-- home-page positions he already has. Not conflicts, and is_conflicting
-- is false on all of them: the home page carries the summary, /platform
-- carries the working-out. Both are his, both are dated, and the reader
-- sees both stacked. Given that the whole point of the last few days was
-- to stop the grid flattening a worked-out plan into a passing mention,
-- hiding his detailed version would be an odd thing to do.
--
-- He goes from 3 positions on 3 issues to 11 on 8.
--
-- STILL GENUINELY BLANK for him, and correctly so: roads, the District
-- table, emergency services, transit. His platform says nothing specific
-- about any of them.
--
-- Run AFTER 11_source_extent.sql. Safe to re-run.
-- =====================================================================

-- PREFLIGHT. These rows carry a source_extent, so the column must exist.
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'positions' and column_name = 'source_extent'
    ) then
        raise exception
            'Run 11_source_extent.sql first. These positions record how much he published, and that column does not exist yet. Nothing has been changed.';
    end if;
end $$;

begin;

with m as (select id from municipalities where slug = 'huntsville')
insert into positions (candidate_id, issue_id, summary_short, summary_bullets,
                       verbatim_quote, source_url, source_title, source_type,
                       source_date, source_extent, status, model_confidence)
select
    (select c.id from candidates c join races r on r.id = c.race_id
      where r.municipality_id = m.id and r.slug = v.race_slug and c.slug = v.cand_slug),
    (select i.id from issues i where i.municipality_id = m.id and i.slug = v.issue_slug),
    v.summary_short, v.summary_bullets::jsonb, v.verbatim_quote,
    v.source_url, v.source_title, 'candidate_website', v.source_date::date,
    v.source_extent, 'in_review', 0.90
from m, (values

-- ---- The five that were wrongly blank --------------------------------

('michael-ankenmann', 'ward-6', 'healthcare-and-hospital',
 'Wants Council to be a vocal advocate for the new hospital and for recruiting family doctors.',
 '["Frames healthcare as something Council should be planning for rather than reacting to.", "Specifies a sustainable hospital, and encouraging more family doctors into town.", "Files this under service standards rather than treating it as a spending commitment."]',
 'Council should be an active, vocal partner in advancing a sustainable future hospital for our community, and in encouraging more family doctors into our town.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a few sentences'),

('michael-ankenmann', 'ward-6', 'housing',
 'More housing through secondary suites and infill, with a simpler approval process — and explicitly not through government-funded projects.',
 '["Names young families, seniors downsizing and local workers as who the housing is for.", "Wants a simpler approval path for what he calls gentle, sensible additions.", "Draws a clear line against publicly funded housing development, which distinguishes him from several other candidates on this issue."]',
 'We need more housing options for young families, seniors looking to downsize, and workers who keep our local economy running. This should be done in a way that respects the scale and character of existing neighbourhoods, with a simpler approval process for gentle, sensible additions like secondary suites and infill housing, and not with expensive and experimental government-funded projects.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a few sentences'),

('michael-ankenmann', 'ward-6', 'economy-and-downtown',
 'Back local business and tourism, but without Town subsidies.',
 '["Says good ideas should stand on their own rather than depend on Town money to survive.", "Separately, says the Town should not use tax dollars to compete with local businesses."]',
 'I''ll champion Huntsville''s local businesses and tourism sector, expecting good ideas to stand on their own, not depend on Town subsidies to survive.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a few sentences'),

('michael-ankenmann', 'ward-6', 'environment',
 'Steward the waterfront, wetlands and forests, and treat dumping and littering as real problems.',
 '["Names pollution, dumping and littering specifically rather than speaking only in general terms.", "Says the natural beauty of Huntsville is core to the town''s character and never an afterthought.", "Places environmental protection inside his section on preserving Huntsville''s character rather than as a standalone plank."]',
 'Our waterfront, wetlands, and forests are the natural resources that define this region. I''ll push to steward them responsibly and take local pollution, dumping, and littering seriously.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a few sentences'),

('michael-ankenmann', 'ward-6', 'parks-and-trails',
 'Parks and public spaces should be well maintained, clean and safe.',
 '["Stated briefly, as one line within his section on preserving Huntsville''s character."]',
 'Our parks and public spaces should be well-maintained, clean, and safe for families to enjoy.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'one sentence'),

-- ---- Three that stack with his existing home-page positions ----------

('michael-ankenmann', 'ward-6', 'taxes-and-spending',
 'A public review of spending and governance within 100 days, and tax growth tied to inflation.',
 '["Says property taxes have risen close to 30 per cent over the last term without a matching improvement in services. This is his figure; SmarterVote has not independently verified it.", "Would tie property tax growth to inflation rather than to new spending.", "Wants the Town to ask whether it should be providing a new service at all before adding staff or budget lines.", "Argues a growing assessment base should reduce each household''s share rather than fund more spending."]',
 'Within my first 100 days, I''ll push for a full, public review of Town spending and governance so residents can clearly see where every dollar goes, and where we can do better.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a page or more'),

('michael-ankenmann', 'ward-6', 'how-council-works',
 'A test for every new initiative: is it a core municipal responsibility that delivers real value?',
 '["Would apply the same test to existing budget lines, not only new ones, so programs are not renewed simply because they are already funded.", "Says that where provincial law does not require a service, Council should weigh carefully whether the Town should provide it at all.", "Names The Table Soup Kitchen, the Corner Lighthouse, the Salvation Army, the St. Vincent de Paul Society, the Rotary Club and local churches as doing more than government programs could, and says Council''s job is to get out of their way.", "Wants published turnaround times for permits and applications, and a plain-language fast track for simple ones."]',
 'Every new initiative Council considers should be measured against one question: does this meet a core municipal responsibility and provide real value to residents?',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'a page or more'),

('michael-ankenmann', 'ward-6', 'growth-and-development',
 'Growth should reinforce the historic, walkable character of the town rather than erase it.',
 '["Links the walkable downtown to both why people live here and why visitors come.", "Wants the planning and building process simplified and clarified up front, with a fast track for decks, secondary suites and minor renovations.", "Says residents should not have the goalposts moved halfway through an application."]',
 'Our historic downtown and quaint, walkable character are part of what makes people want to live here, and what draws the visitors our local businesses depend on. Growth should reinforce that character, never erase it.',
 'https://www.michaelankenmann.ca/platform/',
 'Michael Ankenmann campaign website — Platform & Principles',
 '2026-09-13', 'several paragraphs')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_date, source_extent)
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'Ankenmann total positions' as "Check",
       count(*)::text || ' (expect 11)' as "Result"
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'michael-ankenmann'
union all
select 'Ankenmann issues covered',
       count(distinct p.issue_id)::text || ' of 12 (expect 8)'
from   positions p join candidates c on c.id = p.candidate_id
where  c.slug = 'michael-ankenmann'
union all
select 'the five formerly-blank issues are filled',
       count(*)::text || ' of 5'
from   positions p
join   candidates c on c.id = p.candidate_id
join   issues i on i.id = p.issue_id
where  c.slug = 'michael-ankenmann'
  and  i.slug in ('healthcare-and-hospital','housing','economy-and-downtown',
                  'environment','parks-and-trails')
union all
select 'none of the stacked rows is flagged as a conflict',
       case when not exists (
         select 1 from positions p join candidates c on c.id = p.candidate_id
         where c.slug = 'michael-ankenmann' and p.is_conflicting = true
       ) then 'PASS' else 'FAIL — check before approving' end
union all
select 'every new row has a quote, a source and an extent',
       case when not exists (
         select 1 from positions p join candidates c on c.id = p.candidate_id
         where c.slug = 'michael-ankenmann'
           and (p.verbatim_quote is null or p.source_url is null
                or p.source_extent is null)
       ) then 'PASS' else 'FAIL' end
union all
select 'awaiting approval in /admin now',
       count(*)::text || ' (was 44, expect 52)'
from   positions p where p.status = 'in_review';

-- ---------------------------------------------------------------------
-- WHAT I DID NOT DO
--
-- I did not touch his three existing published positions. They are
-- accurate quotes from his home page and they stay exactly as they are,
-- with their own source and date. The new rows sit alongside them.
--
-- I did not invent coverage on roads, the District table, emergency
-- services or transit. His platform genuinely says nothing specific about
-- those, so those four cells keep saying so.
--
-- ---------------------------------------------------------------------
-- THE PROCESS PROBLEM THIS EXPOSES
--
-- The cause was not carelessness about Ankenmann specifically. It was
-- that batch 1 read whatever each candidate put on their home page and
-- stopped there. Three candidates keep their real platform on a sub-page:
--
--   caswellformayor.ca/mypriorities     — read now, during the extent pass
--   michaelankenmann.ca/platform        — read now, this file
--   kirstyforbrunel.ca/priorities       — read now, during the extent pass
--
-- Caswell's and Koop's batch-1 positions were, by luck, already sourced
-- from those sub-pages. Ankenmann's were not, and he is the one who ended
-- up under-represented on his own site.
--
-- Before the 22 September all-candidates meeting, every candidate page
-- should be walked in full rather than skimmed from the landing page —
-- including the ones already covered. Doing that for eight candidates is
-- an hour of reading and it is the difference between "we looked" and "we
-- glanced".
--
-- ALSO STILL OPEN, from the same pass:
-- Dan Caswell's priorities page names a $10 million local hospital share
-- and proposes a dedicated Huntsville Community Hospital Fund built from
-- efficiency savings and from ending District duplication. Our published
-- healthcare position for him predates that detail. Worth re-reading his
-- card during review to check the summary still matches what he now says.
-- ---------------------------------------------------------------------
