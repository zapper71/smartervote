-- =====================================================================
-- SmarterVote.ca — batch 4: the full-site sweep
--
-- WHAT WENT WRONG, PLAINLY
-- Batches 1 and 2 read landing pages and the odd sub-page. That is how
-- four of Ankenmann's issues came to say "no public statement found" when
-- his platform page plainly stated one. This pass walks every page of
-- every campaign site instead, and checks Doppler's election archive to
-- confirm nothing was missed there.
--
-- NINE NEW POSITIONS, from pages nobody had opened:
--   votebobstone.ca/statements.html        — never read. Substantial.
--   lelandmawforcouncil.ca/post/*          — three blog posts, never read.
--   michaelankenmann.ca/news/why-im-running — never read.
--
-- All nine stack alongside existing positions rather than replacing them:
-- different source_url each time, is_conflicting false throughout. The
-- candidate said more, in more places, and now the site shows that.
--
-- Run AFTER 14_ankenmann_platform.sql. Safe to re-run.
-- =====================================================================

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'positions' and column_name = 'source_extent'
    ) then
        raise exception
            'Run 11_source_extent.sql first. Nothing has been changed.';
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

-- =====================================================================
-- BOB STONE — votebobstone.ca/statements.html
--
-- A page linked from his main navigation that nobody had opened. It is
-- the most detailed writing any incumbent has published this election:
-- a specific budget proposal, and a long essay on growth that answers
-- criticisms quoted from Doppler comment threads and social media.
-- =====================================================================

('bob-stone', 'district-and-town-councillor', 'taxes-and-spending',
 'Would ask every department to model a 5 per cent cut before the next budget.',
 '["Says property taxes have risen 20.8 per cent over the past four years. His figure, and notably lower than the numbers other candidates are using — see the note at the end of this file.", "Says Council and staff have not previously been willing to look at reducing services in order to reduce the levy.", "Expects the exercise to reveal operational savings and produce a very low or zero increase in coming years.", "Attributes one bad year to global post-COVID price increases, mitigated by a low District levy that year."]',
 'I will propose in the next budget deliberations that each department bring back to Council a plan outlining how they would cut their costs and/or services to reduce their budget by 5%.',
 'https://votebobstone.ca/statements.html',
 'Bob Stone campaign website — Statements',
 '2026-09-13', 'several paragraphs'),

('bob-stone', 'district-and-town-councillor', 'housing',
 'Argues the shortage is specifically in rentals, and that supply is the lever.',
 '["Says someone with a million dollars can buy a home today, but young people starting out often cannot afford even to rent.", "Argues that increasing rental supply will bring costs down, and that developers will not build unless it is profitable.", "Points to 176 rental units planned with the Muskoka Community Land Trust on Town-owned land at Florance St. W, 40 under construction at Taite and Main St. W, and 100 approved beside the new Festing Toyota.", "Notes short-term rentals have taken units off the market and that Council has licensed them and capped the number at 250.", "Notes the District will hire about 130 people for the new Fairvern, all of whom will need housing."]',
 'In my opinion there is NOT a housing crisis, there is only a rental housing crisis.',
 'https://votebobstone.ca/statements.html',
 'Bob Stone campaign website — Statements',
 '2026-09-13', 'a page or more'),

('bob-stone', 'district-and-town-councillor', 'growth-and-development',
 'Says the Town cannot stop growth but can shape it, and explains what Council can and cannot legally refuse.',
 '["Says the developments people object to most — Forbes Hill, the Brunel Rd. building, the Hwy 60 condos — were approved years ago and would not be permitted today.", "Says the Province dictates planning rules through the Provincial Policy Statement, and that Planning Council exists to adjudicate applications falling outside existing bylaws, not to stop building.", "Points to the completed Height and Density Study, which sets out where taller buildings of four to six storeys may be appropriate and which hilltops and vistas must be protected.", "Says the Ontario Land Tribunal has almost always sided with developers on housing in recent years, which is why staff seek compromises rather than outright refusals.", "Wrote this in direct response to criticism posted on Doppler and social media, quoting the objections back before answering them."]',
 'We do have the ability to mold that change through good planning practices and protecting those things that we love about this place we call home.',
 'https://votebobstone.ca/statements.html',
 'Bob Stone campaign website — Statements',
 '2026-09-13', 'a page or more'),

-- =====================================================================
-- LELAND MAW — three blog posts
--
-- His blog is linked in the main navigation and carries more policy than
-- his priorities section does. The economy post in particular is the most
-- specific economic proposal in this election.
-- =====================================================================

('leland-maw', 'district-and-town-councillor', 'economy-and-downtown',
 'Wants a task force to recruit clean manufacturing so the economy is not built on seasonal work.',
 '["Says most local jobs are seasonal, part-time and low-paying, and that a large part of the workforce only works part of the year.", "Says an influx of outside wealth has driven up costs without that money reaching local workers.", "Cites a median Muskoka wage of $36,730 to $43,200 against a need for at least $22.20 an hour to afford basics, and says over half of residents cannot meet the cost of living. These are his figures; SmarterVote has not independently verified them.", "Argues year-round manufacturing jobs would also reduce demand on subsidised housing, because workers could afford their own homes."]',
 'We cannot just be a summer playground for the rich. We need permanent, year-round jobs, not seasonal band-aids.',
 'https://www.lelandmawforcouncil.ca/post/investing-in-our-future',
 'Leland Maw campaign website — Investing in Our Future',
 '2026-09-08', 'several paragraphs'),

('leland-maw', 'district-and-town-councillor', 'housing',
 'Protect the affordable units that already exist, and build mixed-income in the right places.',
 '["Would oppose converting or eliminating existing low-income and geared-to-income housing without workable alternatives in place first.", "Supports mixed-income developments, where market-rate and affordable units sit side by side, in appropriate areas with proper infrastructure.", "Would push for District and provincial funding, and for co-operative and non-profit housing.", "Names seniors on fixed incomes, young adults on local wages, families in unstable housing and workers commuting long distances as who he is hearing from."]',
 'Muskoka only truly works when the people who live and work here can afford to stay.',
 'https://www.lelandmawforcouncil.ca/post/keeping-muskoka-viable-for-everyone',
 'Leland Maw campaign website — Keeping Muskoka Viable for Everyone',
 '2026-09-01', 'a page or more'),

('leland-maw', 'district-and-town-councillor', 'roads-and-infrastructure',
 'Wants a repair plan that fixes the worst roads first and publishes a timeline for the rest.',
 '["Calls the state of the roads a safety issue that has been ignored too long.", "Written after the 9 September meet and greet, summarising what residents raised with him."]',
 'I am committing to push for a faster repair plan that fixes the worst spots first and gives everyone a clear timeline for when other roads will be redone.',
 'https://www.lelandmawforcouncil.ca/post/meet-greet',
 'Leland Maw campaign website — Meet & Greet',
 '2026-09-11', 'a few sentences'),

('leland-maw', 'district-and-town-councillor', 'how-council-works',
 'Regular community meetings, plain-language project updates, and input sought before decisions rather than after.',
 '["Says the strongest feedback at the 9 September meet and greet was that residents want more openness from leadership.", "Emphasises consultation happening before final decisions, not after."]',
 'I will work to set up regular community meetings, post easy-to-read updates on big projects, and make sure we ask for your input before final decisions are made, not after.',
 'https://www.lelandmawforcouncil.ca/post/meet-greet',
 'Leland Maw campaign website — Meet & Greet',
 '2026-09-11', 'a few sentences'),

('leland-maw', 'district-and-town-councillor', 'taxes-and-spending',
 'Would look hard at current spending for waste before asking residents for more.',
 '["Frames it as residents needing to see real value for money rather than as a target percentage.", "Written after hearing from residents at the 9 September meet and greet."]',
 'I will push for a close look at our current spending to find ways to cut waste and make sure your tax dollars are used wisely, without adding more stress to our community.',
 'https://www.lelandmawforcouncil.ca/post/meet-greet',
 'Leland Maw campaign website — Meet & Greet',
 '2026-09-11', 'a few sentences'),

-- =====================================================================
-- MICHAEL ANKENMANN — his campaign launch statement
--
-- Largely restates the platform, with one exception worth having: it is
-- the only place in this election where a candidate connects a tax
-- decision to a specific household.
-- =====================================================================

('michael-ankenmann', 'ward-6', 'taxes-and-spending',
 'Connects a percentage point on the tax bill to the households he sees at the debt centre.',
 '["Heads the local CAP Debt Centre, working with Huntsville residents in financial difficulty.", "Would tie tax increases to under inflation.", "Says property taxes have gone up almost 30 per cent over four years. His figure — and see the note at the end of this file about how much candidates disagree on it."]',
 'When Council debates another percentage point, I know exactly whose kitchen table that lands on.',
 'https://www.michaelankenmann.ca/news/why-im-running/',
 'Michael Ankenmann campaign website — Why I''m Running (statement, 7 August 2026)',
 '2026-08-07', 'several paragraphs')

) as v(cand_slug, race_slug, issue_slug, summary_short, summary_bullets,
       verbatim_quote, source_url, source_title, source_date, source_extent)
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------
select 'total positions' as "Check",
       count(*)::text || ' (expect 108)' as "Result"
from   positions
union all
select 'awaiting approval',
       count(*)::text || ' (expect 61)'
from   positions p where p.status = 'in_review'
union all
select 'Stone / Maw / Ankenmann counts',
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id where c.slug = 'bob-stone') || ' / ' ||
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id where c.slug = 'leland-maw') || ' / ' ||
       (select count(*)::text from positions p join candidates c on c.id = p.candidate_id where c.slug = 'michael-ankenmann')
       || ' (expect 11 / 10 / 12)'
union all
select 'every position has a quote, source and extent',
       case when not exists (
         select 1 from positions p
         where p.no_public_position = false
           and (p.verbatim_quote is null or p.source_url is null or p.source_extent is null)
       ) then 'PASS' else 'FAIL' end
union all
select 'nothing in this batch flagged as conflicting',
       case when not exists (
         select 1 from positions p where p.is_conflicting = true
       ) then 'PASS' else 'CHECK' end;

-- ---------------------------------------------------------------------
-- COVERAGE AUDIT — run this any time. It is the thing I should have been
-- looking at all along: every candidate, every issue, what is filled and
-- what is genuinely empty.
--
--   select c.name,
--          count(distinct p.issue_id)::text || ' / 12' as issues_covered,
--          count(p.id) as positions,
--          string_agg(distinct i.slug, ', ' order by i.slug) as covered
--   from   candidates c
--   left   join positions p on p.candidate_id = c.id
--   left   join issues i on i.id = p.issue_id
--   where  c.status <> 'withdrawn'
--   group  by c.name
--   order  by count(distinct p.issue_id) desc, c.name;
--
-- And the inverse — which cells will show "no public statement found":
--
--   select c.name, i.name as issue
--   from   candidates c
--   cross  join issues i
--   join   municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
--   where  c.status <> 'withdrawn'
--     and  not exists (select 1 from positions p
--                      where p.candidate_id = c.id and p.issue_id = i.id)
--   order  by c.name, i.sort_order;
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- WHAT THE FULL SWEEP FOUND THAT ISN'T A POSITION
--
-- 1. FOUR CANDIDATES, FOUR DIFFERENT TAX NUMBERS, SAME PERIOD.
--
--      Bob Stone        20.8% over the past four years
--      Michael Ankenmann  "almost 30%" over four years
--      Michael Lowe       "almost 30%" over the past term
--      Karin Terziano     Town levy up 37%, about $4.5M; payroll up 41%
--
--    These are not all measuring the same thing — a levy is not a tax
--    rate is not an average bill — but a voter reading the comparison
--    grid will see four incompatible figures and no way to reconcile
--    them. Each is already published with its own quote, source and date,
--    which is correct: we do not adjudicate. But this is the single best
--    candidate for a short explainer in the education section, and it is
--    the obvious question for the 22 September meeting.
--
-- 2. RYLIND DAVIS IS DOING OUR JOB FOR US.
--    His /ward-representation-update page explains the Huntsville-Chaffey
--    ward pairing, quoting the Town staff report. It is voter education,
--    not a position, so nothing is inserted — but the pairing is genuinely
--    confusing and belongs on our own explainer pages. Electors in Wards 1
--    and 2 now choose TWO councillors from one combined ballot, while the
--    wards themselves remain undissolved.
--
-- 3. SOCIAL MEDIA REMAINS UNREADABLE, AND THAT IS A REAL GAP.
--    Facebook and Instagram show a logged-out visitor a profile header and
--    nothing else. Nine candidates have verified links now, but I cannot
--    read a single post. For the nine candidates with neither a website
--    nor press coverage, their Facebook page may be the only place they
--    have said anything at all — and it is the one place I cannot look.
--    That is the largest remaining hole in this site, it will not close by
--    itself, and the 22 September meeting plus the October write-out are
--    the only realistic ways to fill it.
--
-- 4. STILL AT ZERO POSITIONS, unchanged:
--    Brian Ellas, Helena Renwick, Jason FitzGerald, Dione Schumacher,
--    Elizabeth Purcell, Bruce Reain, Joshua Boutotte, Bruce Cazabon,
--    Donald Blais, Innocent Legrand.
--    No website, no Doppler article, nothing readable on social. Ten of
--    twenty-eight. Their pages correctly say we have found nothing; they
--    do not yet say we have asked, because we have not.
-- ---------------------------------------------------------------------
