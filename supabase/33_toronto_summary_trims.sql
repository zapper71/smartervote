-- =====================================================================
-- SmarterVote.ca — Toronto summary_short trims (migration 33,
-- Andreas's request, 2026-10-17).
--
-- The Phase 3 Wave A Toronto import staged 363 positions; 196 carried
-- a summary_short over the ~140 characters the site displays (import
-- warnings only — every row staged fine). This rewrites those 196
-- summaries in place to <=140 characters: first sentence / main point
-- kept, detail remains in summary_bullets, quotes untouched.
--
-- Each UPDATE is guarded by the row's CURRENT summary text (the exact
-- original from the import file), so it touches only the staged import
-- rows and is idempotent — re-running changes nothing.
-- =====================================================================

begin;

update positions p
set summary_short = 'Chris Alexander chose ''Yes''; Toronto should permit more missing-middle housing right across the city.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Yes''; toronto should permit more missing-middle housing right across the city, while giving neighbourhoods a stronger role in shaping clear local rules on form, streetscape and public realm.';

update positions p
set summary_short = 'Chris Alexander chose ''No''; Toronto should focus first on fixing the transportation system we already pay for.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''No''; toronto should focus first on fixing the transportation system we already pay for: better TTC service, smarter signal timing, faster construction and improved traffic flow.';

update positions p
set summary_short = 'Chris Alexander chose ''Lighting, maintenance, sanitation and active use of streets and parks''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Lighting, maintenance, sanitation and active use of streets and parks''; public safety requires prevention as well as enforcement.';

update positions p
set summary_short = 'Chris Alexander chose ''Remain approximately constant after inflation''; Police should have the resources to tackle serious crime and hate.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Remain approximately constant after inflation''; police should have the resources to tackle serious crime and hate, but new spending should focus on specialized capabilities, accountability and civilian crisis response not across-the-board expans...';

update positions p
set summary_short = 'Chris Alexander chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Reduce approval times, development charges and other city-imposed costs''; toronto needs all three: more housing, faster and cheaper approvals, and public delivery at scale.';

update positions p
set summary_short = 'Chris Alexander chose ''Build, acquire and own significantly more housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Build, acquire and own significantly more housing''; toronto should build and acquire substantially more affordable and supportive housing directly, while partnering with non-profits, co-ops and land trusts.';

update positions p
set summary_short = 'Chris Alexander chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Grow approximately with inflation and population''; i will freeze residential property taxes in 2027 and keep increases below inflation in 2028.';

update positions p
set summary_short = 'Chris Alexander chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Reduce internal administration, staffing or contract costs''; when there is a structural gap, the first step should be to reduce internal and operating costs before asking residents for more.';

update positions p
set summary_short = 'Chris Alexander chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''; fix what we already own before allowing maintenance backlogs to compound.';

update positions p
set summary_short = 'Chris Alexander chose ''Overriding council on zoning and approvals to get homes built''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Overriding council on zoning and approvals to get homes built''; strong-mayor powers should be used carefully and transparently where they can break unnecessary gridlock.';

update positions p
set summary_short = 'Chris Alexander chose ''Align with provincial priorities where doing so secures funding or approvals''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-chris-alexander'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Chris Alexander chose ''Align with provincial priorities where doing so secures funding or approvals''; toronto should work constructively with Queen''s Park to secure funding, approvals and better outcomes.';

update positions p
set summary_short = 'Brad Bradford chose ''Introduce a levy or other recurring source reserved for maintenance''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-brad-bradford'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Brad Bradford chose ''Introduce a levy or other recurring source reserved for maintenance''; toronto should look at all fiscal and financing levers within its control to build and maintain infrastructure, without defaulting to the easy solution of increasing taxes.';

update positions p
set summary_short = 'Darrell Brown chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Mental-health response, addiction treatment and youth intervention''; enforcement manages crises after they happen; crisis and prevention services stop them from happening.';

update positions p
set summary_short = 'Darrell Brown chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''; public safety funding should follow function, not headcount.';

update positions p
set summary_short = 'Darrell Brown chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Build or finance substantially more affordable and supportive housing''; zoning permissions and faster approvals won''t produce deeply affordable or supportive housing on their own.';

update positions p
set summary_short = 'Darrell Brown chose ''Build, acquire and own significantly more housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Build, acquire and own significantly more housing''; direct public ownership guarantees permanence for supportive housing: critical to solving homelessness.';

update positions p
set summary_short = 'Darrell Brown chose ''Grow approximately with inflation and population''; Property tax should track cost and growth.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Grow approximately with inflation and population''; property tax should track cost and growth, not become the default lever for new priorities.';

update positions p
set summary_short = 'Darrell Brown chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Reduce internal administration, staffing or contract costs''; before asking residents for more or cutting services, prove the administrative and procurement discipline I''ve called for elsewhere is actually being applied.';

update positions p
set summary_short = 'Darrell Brown chose ''Introduce a levy or other recurring source reserved for maintenance''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Introduce a levy or other recurring source reserved for maintenance''; sOGR and expansion competing for the same pool is exactly the structural funding gap I''ve flagged before.';

update positions p
set summary_short = 'Darrell Brown chose ''Appointing and removing senior staff, restructuring departments''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Appointing and removing senior staff, restructuring departments''; strong mayor powers shouldn''t override Council''s collective judgment on housing or budget.';

update positions p
set summary_short = 'Darrell Brown chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-darrell-brown'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Darrell Brown chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''; the province''s TTC operating contribution sits near 9%, much of it one-off.';

update positions p
set summary_short = 'Braeden Chow chose ''No''; Support building substantially more housing across Toronto.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''No''; support building substantially more housing across Toronto, but I wouldn''t say every ward needs the exact same level or type of development.';

update positions p
set summary_short = 'Braeden Chow chose ''No''; I don''t support charging residents for congestion when so much of it is caused by construction, lane closures.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''No''; i don''t support charging residents for congestion when so much of it is caused by construction, lane closures, poor coordination and inadequate infrastructure.';

update positions p
set summary_short = 'Braeden Chow chose ''Lighting, maintenance, sanitation and active use of streets and parks''; I''d choose public-space management.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Lighting, maintenance, sanitation and active use of streets and parks''; i''d choose public-space management, but safety can''t be reduced to visibility alone.';

update positions p
set summary_short = 'Braeden Chow chose ''Increase above inflation to expand police staffing or services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Increase above inflation to expand police staffing or services''; increase above inflation, but not simply to hire more officers.';

update positions p
set summary_short = 'Braeden Chow chose ''Build or finance substantially more affordable and supportive housing''; We need more affordable and supportive housing.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Build or finance substantially more affordable and supportive housing''; we need more affordable and supportive housing, but I don''t support simply opening the door for anyone to build anything anywhere.';

update positions p
set summary_short = 'Braeden Chow chose ''Build, acquire and own significantly more housing''; Toronto should take more responsibility itself.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Build, acquire and own significantly more housing''; toronto should take more responsibility itself: build, acquire, and own more affordable/supportive housing, rather than mainly relying on private developers or outside partners to solve the problem.';

update positions p
set summary_short = 'Braeden Chow chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; i''d lean grow more slowly than inflation.';

update positions p
set summary_short = 'Braeden Chow chose ''Redirect money from new facilities and projects toward existing assets''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-braeden-chow'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Braeden Chow chose ''Redirect money from new facilities and projects toward existing assets''; before raising another levy or selling off public assets, the City should make sure it can properly maintain what it already owns.';

update positions p
set summary_short = 'Logan Choy chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-logan-choy'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Logan Choy chose ''Build or finance substantially more affordable and supportive housing''; build for public delivery and finance more affordable portive the futur of kids';

update positions p
set summary_short = 'Logan Choy chose ''Supply land, funding and incentives to non-profit and private providers''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-logan-choy'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Logan Choy chose ''Supply land, funding and incentives to non-profit and private providers''; direct builder, funder and supportive housing, working with non-profits, the private sector and other governments.';

update positions p
set summary_short = 'Roberto Curto chose ''Yes''; Every neighbourhood needs to be accommodating more housing.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Yes''; every neighbourhood needs to be accommodating more housing, particularly missing middle and gentle density approaches.';

update positions p
set summary_short = 'Roberto Curto chose ''Remain approximately constant after inflation''; Keep police properly funded and keeping pace with inflation.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Remain approximately constant after inflation''; keep police properly funded and keeping pace with inflation, while putting new investments into civilian crisis services.';

update positions p
set summary_short = 'Roberto Curto chose ''Vehicles, stations, signals and other state-of-good-repair work''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Vehicles, stations, signals and other state-of-good-repair work''; a reliable transit system starts with taking care of what we already have.';

update positions p
set summary_short = 'Roberto Curto chose ''Transit, walking and cycling''; Our streets should prioritize moving people efficiently.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Transit, walking and cycling''; our streets should prioritize moving people efficiently, while protecting essential and accessibility needs.';

update positions p
set summary_short = 'Roberto Curto chose ''Supply land, funding and incentives to non-profit and private providers''; Toronto should use its land.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Supply land, funding and incentives to non-profit and private providers''; toronto should use its land, funding and municipal tools to dramatically expand affordable and supportive housing through strong partnerships with non-profits, co-ops and other housing providers, w...';

update positions p
set summary_short = 'Roberto Curto chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Grow approximately with inflation and population''; but we need to stop treating property taxes as the answer to everything.';

update positions p
set summary_short = 'Roberto Curto chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Reduce internal administration, staffing or contract costs''; look for administrative inefficiencies and poor value contracts first, without weakening frontline services or the city''s in house capacity.';

update positions p
set summary_short = 'Roberto Curto chose ''Redirect money from new facilities and projects toward existing assets''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Redirect money from new facilities and projects toward existing assets''; before asking residents for more, we should prioritize maintaining what we already have.';

update positions p
set summary_short = 'Roberto Curto chose ''Overriding council on zoning and approvals to get homes built''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Overriding council on zoning and approvals to get homes built''; i am cautious about strong-mayor powers and would rather build support at Council.';

update positions p
set summary_short = 'Roberto Curto chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-roberto-curto'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Roberto Curto chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''; work with Queen''s Park when it benefits Toronto, absolutely, but don''t be afraid to stand up for our city.';

update positions p
set summary_short = 'Toronto already permits up to 4 residential units as-of-right in Neighbourhoods while six-plexes are legal in select wards.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Yes''; toronto already permits up to 4 residential units as-of-right in Neighbourhoods while six-plexes are legal in select wards.';

update positions p
set summary_short = 'Laura Dean chose ''Yes''; the road pricing question is not worth much time because the provincial government will never allow road tolls.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Yes''; the road pricing question is not worth spending much time on because this provincial government will never allow Toronto to implement road tolls.';

update positions p
set summary_short = 'Laura Dean chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Mental-health response, addiction treatment and youth intervention''; mental health and addiction issues are in plain view in Toronto''s public spaces, making us feel uncomfortable and sometimes unsafe.';

update positions p
set summary_short = 'Laura Dean chose ''Remain approximately constant after inflation''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Remain approximately constant after inflation''; tPS should focus its resources on reducing the number of guns on the street and addressing violent crime.';

update positions p
set summary_short = 'Laura Dean chose ''More frequent and reliable service on existing routes''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''More frequent and reliable service on existing routes''; many people choose to drive because they are not confident the TTC will get them to where they are going on time.';

update positions p
set summary_short = 'Laura Dean chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Build or finance substantially more affordable and supportive housing''; reducing DCs and updating zoning permissions are important for new housing but will not solve the affordable housing crisis.';

update positions p
set summary_short = 'Laura Dean chose ''Supply land, funding and incentives to non-profit and private providers''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Supply land, funding and incentives to non-profit and private providers''; non-profit and private providers have a better track record of delivering projects than the City.';

update positions p
set summary_short = 'Laura Dean chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; taxes were raised last term and should remain stable over the next council term.';

update positions p
set summary_short = 'Laura Dean chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Reduce internal administration, staffing or contract costs''; changes with the least impact on Torontonian''s day-to-day experiences must be prioritized.';

update positions p
set summary_short = 'Laura Dean chose ''Introduce a levy or other recurring source reserved for maintenance''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Introduce a levy or other recurring source reserved for maintenance''; the money Toronto will save by no longer having financial and operational responsibility for the DVP and Gardiner should be reserved for addressing Toronto''s infrastructure backlog.';

update positions p
set summary_short = 'Laura Dean chose ''Overriding council on zoning and approvals to get homes built''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Overriding council on zoning and approvals to get homes built''; strong Mayor powers should be used where Council stands in the way of crucial housing getting built.';

update positions p
set summary_short = 'Laura Dean chose ''Align with provincial priorities where doing so secures funding or approvals''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-laura-dean'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Laura Dean chose ''Align with provincial priorities where doing so secures funding or approvals''; toronto has little legal authority to prevent provincial interference.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''No''; Toronto should improve transit and reduce congestion through smarter urban planning.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''No''; toronto should improve transit and reduce congestion through smarter urban planning and better transportation infrastructure, rather than adding new financial burdens on residents.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Mental-health response, addiction treatment and youth intervention''; public safety requires prevention as well as enforcement.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Remain approximately constant after inflation''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Remain approximately constant after inflation''; toronto should maintain strong and effective policing while improving efficiency, accountability and community safety.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''More frequent and reliable service on existing routes''; Toronto should first make existing transit more frequent.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''More frequent and reliable service on existing routes''; toronto should first make existing transit more frequent, reliable and efficient.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Transit, walking and cycling''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Transit, walking and cycling''; when street space is limited, priority should go to moving the greatest number of people safely and efficiently.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Reduce approval times, development charges and other city-imposed costs''; toronto should accelerate housing approvals and reduce unnecessary costs.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; toronto should streamline approvals, reduce construction barriers and enable more mid-rise and affordable housing, while partnering with non-profit and private-sector builders to deliver homes faster.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Grow approximately with inflation and population''; property-tax revenues should grow responsibly with inflation and population, while the City improves efficiency, controls unnecessary spending and protects essential services.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Reduce internal administration, staffing or contract costs''; toronto should address budget gaps first by improving efficiency, reducing unnecessary administrative and contract costs, and eliminating waste.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Redirect money from new facilities and projects toward existing assets''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Redirect money from new facilities and projects toward existing assets''; toronto should prioritize repairing and maintaining existing infrastructure before funding new expansion.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Overriding council on zoning and approvals to get homes built''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Overriding council on zoning and approvals to get homes built''; strong mayor powers should be used carefully and transparently, mainly to accelerate housing approvals and responsible development.';

update positions p
set summary_short = 'Mohamad Kaaki chose ''Align with provincial priorities where doing so secures funding or approvals''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohamad-kaaki'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Mohamad Kaaki chose ''Align with provincial priorities where doing so secures funding or approvals''; toronto should work constructively with the Province to secure funding and faster approvals for housing, transit and infrastructure, while firmly advocating for Toronto''s priorities and long-term n...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Yes''; Citywide intensification can improve supply and reduce approval complexity.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Yes''; citywide intensification can improve supply and reduce approval complexity, if supported by engineering-based assessments of infrastructure capacity, safety, market impacts, and neighbourhood cohes...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Yes''; where indoor space meets safety, accessibility and household needs, use coordinated services.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Yes''; when an indoor space meets safety, accessibility, and household needs, transitioning supports coordinated services, reduces risk, and aligns with integrated public-safety and health-system standards.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''No''; Road planning must follow engineering-based demand analysis, evidence-driven capital planning.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''No''; road planning must follow engineering-based demand analysis, evidence-driven capital planning, lifecycle maintenance, and streamlined processes.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Police, bylaw enforcement and a more visible official presence''; strengthen public safety, crisis prevention, public space management, neighbourhood cohesion, and community stability through coordinated prevention, enforcement, and integrated recovery-focused su...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Remain approximately constant after inflation''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Remain approximately constant after inflation''; increase police presence and response reliability by reducing administrative burden and directing resources to frontline operations, supported by clear service accountability and streamlined proces...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''More frequent and reliable service on existing routes''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''More frequent and reliable service on existing routes''; transit funding must focus on reliability and measurable mobility performance through streamlined operations, engineering-driven capital planning, and disciplined lifecycle maintenance.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Deliveries, trades, emergency vehicles and accessibility''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Deliveries, trades, emergency vehicles and accessibility''; prioritize congestion reduction by removing unnecessary restrictions, simplifying transit-roadway interfaces, improving system efficiency through integrated operations, and planning future street c...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Reduce approval times, development charges and other city-imposed costs''; use engineering-based planning to align housing with demand and lifecycle costs.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; strengthen affordability through streamlined regulatory pathways, reduced inter-agency duplication, and predictable approval timelines.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; residential property tax should be REDUCED, with the shortfall offset through efficiency gains, integrated financial planning, transparent competitive procurement, engineering-based evaluation, few...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Reduce internal administration, staffing or contract costs''; when facing a structural budget gap, Toronto should first reduce or redesign lower-priority services, cut internal administration, staffing, and contract costs, maximize revenue from its own assets...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''; the infrastructure repair backlog is an operational defect caused by inadequate planning and preventive maintenance.';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Setting spending and tax levels without assembling a majority''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Setting spending and tax levels without assembling a majority''; strong-mayor authority should enforce simplification across ~120 agencies, intergovernmental coordination to eliminate redundant programs and protect taxpayers'' wallet, and decisions anchored in af...';

update positions p
set summary_short = 'Georgios Kalkounis chose ''Align with provincial priorities where doing so secures funding or approvals''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-georgios-kalkounis'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Georgios Kalkounis chose ''Align with provincial priorities where doing so secures funding or approvals''; taxpayers fund all governments, so partnership and coordination is essential to eliminate redundancy, protect the single wallet, align operations under unified priorities and long-term planning, an...';

update positions p
set summary_short = 'Michael Lamoureux chose ''No''; he opposes congestion charges but would raise parking lot fees and taxes to fund TTC improvements.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-michael-lamoureux'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Michael Lamoureux chose ''No''; no to congestion charges (too much administration cost and hassle), but I would agree to raising parking lot fees and taxes to fund TTC improvements and expansion.';

update positions p
set summary_short = 'Michael Lamoureux chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-michael-lamoureux'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Michael Lamoureux chose ''Police, bylaw enforcement and a more visible official presence''; we can do all of them, they are not mutually exclusive.';

update positions p
set summary_short = 'Michael Lamoureux: his real answer is none of the above — he favours reduced approval times only for 6-storey projects on arterial roads.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-michael-lamoureux'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Michael Lamoureux chose ''Reduce approval times, development charges and other city-imposed costs''; my real answer is none of the above, but we should reduce approval times for 6 storey projects on arterial roads which are the only types of projects I favour.';

update positions p
set summary_short = 'Michael Lamoureux chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-michael-lamoureux'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Michael Lamoureux chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; six storey buildings on arterial roads only.';

update positions p
set summary_short = 'Michael Lamoureux chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-michael-lamoureux'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Michael Lamoureux chose ''Publicly press for greater authority, revenue and a different fiscal arrangement''; we have to do all three, depending on the nature of the spend.';

update positions p
set summary_short = 'Amy Rosen chose ''Yes''; We need more affordable and supportive housing.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-amy-rosen'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Amy Rosen chose ''Yes''; we need more affordable and supportive housing, and we need to make it faster and easier to build through smart zoning reforms and targeted incentives.';

update positions p
set summary_short = 'Amy Rosen chose ''Yes''; Many people living on our streets are also struggling with mental illness, addiction.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-amy-rosen'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Amy Rosen chose ''Yes''; many people living on our streets are also struggling with mental illness, addiction, trauma, or other challenges that require treatment and support.';

update positions p
set summary_short = 'Amy Rosen chose ''No''; she would create a dedicated traffic coordination office to tackle congestion.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-amy-rosen'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Amy Rosen chose ''No''; i will create a dedicated traffic coordination office to tackle congestion and bring common sense back to city planning.';

update positions p
set summary_short = 'Robert Shusterman chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Police, bylaw enforcement and a more visible official presence''; we need more police officers response times for 911 are still too slow and we need to get higher more officers and get them to the emergency situations more quicker';

update positions p
set summary_short = 'Robert Shusterman chose ''Increase above inflation to expand police staffing or services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Increase above inflation to expand police staffing or services''; again we need more police officers that are not enough we have 3 million people we need more officers';

update positions p
set summary_short = 'Robert Shusterman chose ''Transit, walking and cycling''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Transit, walking and cycling''; transit walking and cycling need to be a priority in the city especially walking and cycling as it is a great exercise we need to promote exercise';

update positions p
set summary_short = 'Robert Shusterman chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Build or finance substantially more affordable and supportive housing''; housing is too expensive in the city for many people.';

update positions p
set summary_short = 'Robert Shusterman chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; you should be able to build freely with no restrictions.';

update positions p
set summary_short = 'Robert Shusterman chose ''Grow faster than inflation to improve or expand services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Grow faster than inflation to improve or expand services''; we need to improve services in the city we can''t take shortcuts with regard to this';

update positions p
set summary_short = 'Robert Shusterman chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Reduce internal administration, staffing or contract costs''; by reducing administrative costs that are not necessary we can help alleviate this problem';

update positions p
set summary_short = 'Robert Shusterman chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Sell, consolidate or close facilities the city cannot sustainably maintain''; it is a waste to have facilities in the city that cannot be maintained we need to eliminate them';

update positions p
set summary_short = 'Robert Shusterman chose ''The powers should sit unused regardless of who holds them''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''The powers should sit unused regardless of who holds them''; a mayor should not have the right to override anything decisions are made as a group not as one';

update positions p
set summary_short = 'Robert Shusterman chose ''Align with provincial priorities where doing so secures funding or approvals''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-robert-shusterman'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Robert Shusterman chose ''Align with provincial priorities where doing so secures funding or approvals''; to aline ourselves with the provincial government We need to have common goals especially when it comes time to deal with mentally ill people';

update positions p
set summary_short = 'Joshua Thompson chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Police, bylaw enforcement and a more visible official presence''; violent crime first — more presence on the street, not another prevention slideshow.';

update positions p
set summary_short = 'Joshua Thompson chose ''Increase above inflation to expand police staffing or services''; crime is the first job.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Increase above inflation to expand police staffing or services''; crime is the first job, and you do not cut the people who do it.';

update positions p
set summary_short = 'Joshua Thompson chose ''Vehicles, stations, signals and other state-of-good-repair work''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Vehicles, stations, signals and other state-of-good-repair work''; fix the TTC we already have before buying another ribbon-cutting.';

update positions p
set summary_short = 'Joshua Thompson chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Reduce approval times, development charges and other city-imposed costs''; axe the charges that kill supply, then the units get built.';

update positions p
set summary_short = 'Joshua Thompson chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; city Hall''s job is get out of the way and let units go up — not become the landlord of Toronto.';

update positions p
set summary_short = 'Joshua Thompson chose ''Reduce internal administration, staffing or contract costs''; Cut waste first.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Reduce internal administration, staffing or contract costs''; cut waste first; do not raise taxes to paper over City Hall''s overhead.';

update positions p
set summary_short = 'Joshua Thompson chose ''Redirect money from new facilities and projects toward existing assets''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Redirect money from new facilities and projects toward existing assets''; maintain what we own before another expansion press conference.';

update positions p
set summary_short = 'Joshua Thompson chose ''Plan budgets and services on the assumption that substantial new provincial support will not arrive''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-joshua-thompson'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Joshua Thompson chose ''Plan budgets and services on the assumption that substantial new provincial support will not arrive''; run the city''s books like the cavalry is not coming.';

update positions p
set summary_short = 'Homeowners and residential occupants with vehicles registered to their addresses within the core should be exempt from congestion charges.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Yes''; homeowners and residential occupants with vehicles registered to their adresses within the core should be exempt from congestion charges.';

update positions p
set summary_short = 'Jack Weenen chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Police, bylaw enforcement and a more visible official presence''; despite the hyper focus on the drug addicted-homeless stereotype of street safety, we forget that they do not account for the majority of the crime.';

update positions p
set summary_short = 'Jack Weenen chose ''Vehicles, stations, signals and other state-of-good-repair work''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Vehicles, stations, signals and other state-of-good-repair work''; the vitrolite colour tiles and the retro mid century look that define so many of our stations, and the brutalist concrete shapes of the arcades falling to the platforms deserve restoration.';

update positions p
set summary_short = 'Jack Weenen chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Reduce approval times, development charges and other city-imposed costs''; we can''t allow indiscriminate building because there is a housing problem.';

update positions p
set summary_short = 'Jack Weenen chose ''Focus primarily on permitting enough housing and reducing barriers to construction''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Focus primarily on permitting enough housing and reducing barriers to construction''; there''s a very serious need to reestablish the dwindling middle class in Canada, this starts at home in Toronto by empowering residents to move away from long term rental and into home ownership.';

update positions p
set summary_short = 'Jack Weenen chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; our most recent property tax hike was such that we need a cool down over the next council term.';

update positions p
set summary_short = 'Jack Weenen chose ''Introduce a levy or other recurring source reserved for maintenance''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Introduce a levy or other recurring source reserved for maintenance''; charge the developers for the increased strain they''ve put on our systems.';

update positions p
set summary_short = 'Jack Weenen chose ''The powers should sit unused regardless of who holds them''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''The powers should sit unused regardless of who holds them''; as it related to the previous question, this is a controversial political tool that can be easily abused, however it would seem the need for it is dependent on how other levels of government are in...';

update positions p
set summary_short = 'Jack Weenen chose ''Plan budgets and services on the assumption that substantial new provincial support will not arrive''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jack-weenen'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/mayor'
  and p.summary_short = 'Jack Weenen chose ''Plan budgets and services on the assumption that substantial new provincial support will not arrive''; years ago the provincial government amalgamated the city reducing our agency and access to our politicians.';

update positions p
set summary_short = 'Susan Chapelle chose ''Yes''; where appropriate indoor space is available, public parks should return to public use.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-susan-chapelle'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Susan Chapelle chose ''Yes''; if appropriate indoor space is genuinely available and meets a person''s accessibility, safety and household needs, public parks should return to public use.';

update positions p
set summary_short = 'Toronto should improve transit and transportation alternatives before adding another charge to getting around the city.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-susan-chapelle'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Susan Chapelle chose ''No''; toronto should improve transit and transportation alternatives before adding another charge to getting around the city.';

update positions p
set summary_short = 'Susan Chapelle chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-susan-chapelle'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Susan Chapelle chose ''Mental-health response, addiction treatment and youth intervention''; without support workers, every crisis becomes a police call.';

update positions p
set summary_short = 'Susan Chapelle chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-susan-chapelle'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Susan Chapelle chose ''Reduce approval times, development charges and other city-imposed costs''; cut months of process and fees that do not buy a pipe or a park.';

update positions p
set summary_short = 'Susan Chapelle chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-susan-chapelle'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Susan Chapelle chose ''Reduce internal administration, staffing or contract costs''; before cutting frontline services or raising household taxes, City Hall must modernize from within.';

update positions p
set summary_short = 'Jason Stevens chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jason-stevens'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Jason Stevens chose ''Mental-health response, addiction treatment and youth intervention''; helsinki actually saved money by supporting housing';

update positions p
set summary_short = 'Denise Walcott chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denise-walcott'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Denise Walcott chose ''Mental-health response, addiction treatment and youth intervention''; public safety requires prevention as well as enforcement.';

update positions p
set summary_short = 'Denise Walcott chose ''Remain approximately constant after inflation''; Police need the resources to respond effectively.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denise-walcott'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Denise Walcott chose ''Remain approximately constant after inflation''; police need the resources to respond effectively, but increased spending should be tied to demonstrated needs and results.';

update positions p
set summary_short = 'Denise Walcott chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denise-walcott'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Denise Walcott chose ''Build or finance substantially more affordable and supportive housing''; toronto''s greatest need is housing people can actually afford.';

update positions p
set summary_short = 'Denise Walcott chose ''Reduce or redesign lower-priority services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denise-walcott'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Denise Walcott chose ''Reduce or redesign lower-priority services''; residential tax increases should not be the first or only solution and should remain reasonable.';

update positions p
set summary_short = 'Denise Walcott chose ''The powers should sit unused regardless of who holds them''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denise-walcott'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/14'
  and p.summary_short = 'Denise Walcott chose ''The powers should sit unused regardless of who holds them''; major decisions should be made through transparent debate and a democratic Council process.';

update positions p
set summary_short = 'Sheena Sharp chose ''New rapid-transit lines and extensions''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-sheena-sharp'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Sheena Sharp chose ''New rapid-transit lines and extensions''; with recent investments, Line 5 and the Ontario line, we are not significantly expanding service areas.';

update positions p
set summary_short = 'Sheena Sharp chose ''Permit substantially more housing as-of-right''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-sheena-sharp'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Sheena Sharp chose ''Permit substantially more housing as-of-right''; permission actually reduced approval times in planning, where the problem lies.';

update positions p
set summary_short = 'Sheena Sharp chose ''Grow faster than inflation to improve or expand services''; Actually, they should cover expenses.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-sheena-sharp'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Sheena Sharp chose ''Grow faster than inflation to improve or expand services''; actually, they should cover expenses, whatever the increase/decrease.';

update positions p
set summary_short = 'Denis Tsang chose ''Lighting, maintenance, sanitation and active use of streets and parks''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Lighting, maintenance, sanitation and active use of streets and parks''; toronto should give the greatest additional investment to public-space management.';

update positions p
set summary_short = 'Denis Tsang chose ''Remain approximately constant after inflation''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Remain approximately constant after inflation''; the Toronto Police Service budget should remain approximately constant after inflation.';

update positions p
set summary_short = 'Denis Tsang chose ''Vehicles, stations, signals and other state-of-good-repair work''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Vehicles, stations, signals and other state-of-good-repair work''; toronto should give the greatest share of new transit funding to maintenance and state-of-good-repair work.';

update positions p
set summary_short = 'Denis Tsang chose ''Reduce approval times, development charges and other city-imposed costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Reduce approval times, development charges and other city-imposed costs''; toronto should put the greatest emphasis on reducing approval times and city-imposed costs, because that is the fastest way to unlock more housing this term.';

update positions p
set summary_short = 'Denis Tsang chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Grow approximately with inflation and population''; residential property-tax revenues should generally grow approximately with inflation and population.';

update positions p
set summary_short = 'Denis Tsang chose ''Appointing and removing senior staff, restructuring departments''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-denis-tsang'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/15'
  and p.summary_short = 'Denis Tsang chose ''Appointing and removing senior staff, restructuring departments''; strong mayor powers should be used mainly for administration.';

update positions p
set summary_short = 'Mohammad Shabani chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''Mental-health response, addiction treatment and youth intervention''; my platform combines safety with public health under a dedicated "Public Health and Safety" strategy.';

update positions p
set summary_short = 'Mohammad Shabani chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''; my platform combines safety with public health, focusing on preventative social care and housing rather than expanding traditional policing.';

update positions p
set summary_short = 'Mohammad Shabani chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''Build or finance substantially more affordable and supportive housing''; based on my platform, I would place the greatest emphasis on public delivery.';

update positions p
set summary_short = 'Mohammad Shabani chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; i heavily resist relying on higher consumer taxes.';

update positions p
set summary_short = 'Mohammad Shabani chose ''Raise taxes, fees or other revenue''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''Raise taxes, fees or other revenue''; rather than cutting public services, my platform relies on generating aggressive alternative revenue streams.';

update positions p
set summary_short = 'Mohammad Shabani chose ''The powers should sit unused regardless of who holds them''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mohammad-shabani'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Mohammad Shabani chose ''The powers should sit unused regardless of who holds them''; my platform centers heavily on democratic modernization and local accountability.';

update positions p
set summary_short = 'Adam Smith chose ''No''; Toronto must balance new density with the infrastructure needed to support it.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''No''; toronto needs to carefully balance any addition of density with the underlying infrastructure necessary to support it, and to take into consideration the viability of growth policies weighed agains...';

update positions p
set summary_short = 'Adam Smith chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''Mental-health response, addiction treatment and youth intervention''; there is no improving public safety without improving poverty, mental health, and addiction.';

update positions p
set summary_short = 'Adam Smith chose ''More frequent and reliable service on existing routes''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''More frequent and reliable service on existing routes''; we need better accountability and oversight of drivers to have more reliable routes.';

update positions p
set summary_short = 'Adam Smith: we don''t need more units — the supply myth was a self-serving lie told by developers.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''Build or finance substantially more affordable and supportive housing''; we don''t need more units, the supply myth was a self-serving lie told by developers to justify more building.';

update positions p
set summary_short = 'Adam Smith chose ''Raise taxes, fees or other revenue''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''Raise taxes, fees or other revenue''; specifically we should be going to the feds and the province and telling them that as the economic engine and tax revenue cash cow of the nation they had best start stepping up to give us the fundi...';

update positions p
set summary_short = 'Adam Smith chose ''The powers should sit unused regardless of who holds them''; These powers should never have existed.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-adam-smith'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Adam Smith chose ''The powers should sit unused regardless of who holds them''; these powers should never have existed, the mayor is not a king/queen.';

update positions p
set summary_short = 'Austin Vieira chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''Mental-health response, addiction treatment and youth intervention''; investing in mental-health response, addiction treatment, and youth intervention addresses root causes of distress with care rather than criminalization.';

update positions p
set summary_short = 'Austin Vieira chose ''Remain approximately constant after inflation''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''Remain approximately constant after inflation''; keeping the police budget stable after inflation maintains essential services while preventing unnecessary cost escalations.';

update positions p
set summary_short = 'Austin Vieira chose ''More frequent and reliable service on existing routes''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''More frequent and reliable service on existing routes''; prioritizing frequent, reliable service on existing routes directly supports daily commuters and essential workers.';

update positions p
set summary_short = 'Austin Vieira chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''Build or finance substantially more affordable and supportive housing''; publicly building and financing deeply affordable and supportive housing tackles Toronto''s crisis at its root.';

update positions p
set summary_short = 'Austin Vieira chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''Grow approximately with inflation and population''; aligning tax revenues with inflation and population growth protects vital services like transit, childcare, and parks without placing an unfair burden on families facing high living costs.';

update positions p
set summary_short = 'Austin Vieira chose ''Raise taxes, fees or other revenue''; Closing budget gaps requires raising revenue equitably.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''Raise taxes, fees or other revenue''; closing budget gaps requires raising revenue equitably, making private developers and wealthy speculators pay their fair share.';

update positions p
set summary_short = 'Austin Vieira chose ''The powers should sit unused regardless of who holds them''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-austin-vieira'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Austin Vieira chose ''The powers should sit unused regardless of who holds them''; strong mayor powers fundamentally undermine local democracy and bypass the collective voice of elected representatives.';

update positions p
set summary_short = 'Jennie Worden chose ''Yes''; road pricing best reduces traffic and raises revenue as part of an overall transportation strategy.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jennie-worden'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Jennie Worden chose ''Yes''; road pricing (tolls or congestion charging) works best to reduce traffic and raise revenue when it forms part of an overall transportation strategy, rather than as a simple user-fee or tax.';

update positions p
set summary_short = 'Jennie Worden chose ''Lighting, maintenance, sanitation and active use of streets and parks''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jennie-worden'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Jennie Worden chose ''Lighting, maintenance, sanitation and active use of streets and parks''; the intervention that will most improve public safety is housing.';

update positions p
set summary_short = 'Jennie Worden chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jennie-worden'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Jennie Worden chose ''Decrease after inflation, with some responsibilities and funding transferred to civilian services''; toronto cannot keep adding money to the police budget without interrogating what we are asking police to do and whether the police service is the best service provider for these tasks.';

update positions p
set summary_short = 'Jennie Worden chose ''More frequent and reliable service on existing routes''; she would prioritize service.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jennie-worden'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Jennie Worden chose ''More frequent and reliable service on existing routes''; in a world where we had just one pot of transit-funding money, I''d prioritize service, with state-of-good-repair protected as an essential investment and other levels of government funding their sh...';

update positions p
set summary_short = 'Jennie Worden chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jennie-worden'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/19'
  and p.summary_short = 'Jennie Worden chose ''Grow approximately with inflation and population''; toronto needs predictable revenue growth to maintain services and address our infrastructure backlog.';

update positions p
set summary_short = 'Karina Lemke chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-karina-lemke'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/11'
  and p.summary_short = 'Karina Lemke chose ''Police, bylaw enforcement and a more visible official presence''; this answer does not minimize the major flaw in crisis and mental health support, same for the failure of public space management.';

update positions p
set summary_short = 'Karina Lemke chose ''More frequent and reliable service on existing routes''; The TTC needs to be held accountable for its failures.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-karina-lemke'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/11'
  and p.summary_short = 'Karina Lemke chose ''More frequent and reliable service on existing routes''; the TTC needs to be held accountable for its failures, and should not make it the responsibility of everyone else.';

update positions p
set summary_short = 'Karina Lemke chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-karina-lemke'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/11'
  and p.summary_short = 'Karina Lemke chose ''Reduce internal administration, staffing or contract costs''; if we agree there are too many layers of approval - there are too many people in those layers.';

update positions p
set summary_short = 'David Cottrell chose ''No''; more housing is great, but infrastructure often can''t support comfortable living where houses multiply.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''No''; more housing is great, but in areas where there are more houses that usually means the infrastructure won''t allow people to comfortably live in.';

update positions p
set summary_short = 'David Cottrell chose ''Yes''; encampments often turn previously accessible public locations into hazardous zones.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''Yes''; encampments often create previously accessible locations to the public in to hazardous zones that are no longer maintained.';

update positions p
set summary_short = 'David Cottrell chose ''Mental-health response, addiction treatment and youth intervention''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''Mental-health response, addiction treatment and youth intervention''; i believe that prevention is always more effecting that reactionary responses.';

update positions p
set summary_short = 'David Cottrell: we have the living space — the problem isn''t quantity, it''s cost.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''Build or finance substantially more affordable and supportive housing''; we have the living space, the problem isn''t quantity, its cost.';

update positions p
set summary_short = 'David Cottrell chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''Grow more slowly than inflation, requiring service restraint or alternative revenues''; residential property owners are getting squeezed out of home ownership, raising property tax for many who are on fixed income or aren''t receiving raises even close to what the city is taking from t...';

update positions p
set summary_short = 'David Cottrell chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-david-cottrell'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'David Cottrell chose ''Reduce internal administration, staffing or contract costs''; we often have contracts for services that can be done by city staff, so long as good project management is in place.';

update positions p
set summary_short = 'Jenny Kalimbet chose ''No''; Toronto should first reduce congestion by completing infrastructure projects on time.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''No''; before introducing new tolls or congestion charges, Toronto should reduce congestion by completing infrastructure projects on time, moving bike lanes off major arterial roads where appropriate, and...';

update positions p
set summary_short = 'Jenny Kalimbet chose ''Police, bylaw enforcement and a more visible official presence''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''Police, bylaw enforcement and a more visible official presence''; toronto needs a visible and effective police and bylaw presence to deter crime, respond to disorder and keep our public spaces safe.';

update positions p
set summary_short = 'Jenny Kalimbet chose ''Increase above inflation to expand police staffing or services''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''Increase above inflation to expand police staffing or services''; as Toronto grows, our police service must have the staffing and resources needed to respond effectively, address violent and hate-motivated crime, improve community presence and keep our neighbourh...';

update positions p
set summary_short = 'Toronto residents need more frequent, reliable and safe transit on the routes they already use.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''More frequent and reliable service on existing routes''; toronto residents need more frequent, reliable and safe transit on the routes they already use every day.';

update positions p
set summary_short = 'Jenny Kalimbet chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''Build or finance substantially more affordable and supportive housing''; we need housing that people can actually afford, while providing appropriate supports for those experiencing homelessness so they can move into stable, permanent homes.';

update positions p
set summary_short = 'Jenny Kalimbet chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''Grow approximately with inflation and population''; property-tax revenues should generally grow with inflation and population, not through excessive tax increases.';

update positions p
set summary_short = 'Toronto should reduce unnecessary administrative, staffing and contract costs before asking residents to pay more.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-jenny-kalimbet'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Jenny Kalimbet chose ''Reduce internal administration, staffing or contract costs''; toronto should first reduce unnecessary administrative, staffing and contract costs before asking residents to pay more.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Yes''; I support more housing as-of-right across Toronto.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Yes''; i support more housing as-of-right across Toronto, including gentle density in areas dominated by detached and semi-detached homes.';

update positions p
set summary_short = 'When a safe, accessible indoor option genuinely meets a person''s needs, the City should require the encampment to be vacated.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Yes''; when a safe, accessible indoor option genuinely meets a person''s needs, the City should require the encampment to be vacated.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Remain approximately constant after inflation''; Toronto needs effective policing.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Remain approximately constant after inflation''; toronto needs effective policing, but every public dollar must deliver results.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Build or finance substantially more affordable and supportive housing''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Build or finance substantially more affordable and supportive housing''; toronto needs to build more housing that ordinary residents can actually afford.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Grow approximately with inflation and population''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Grow approximately with inflation and population''; property taxes should generally keep pace with inflation and population growth to maintain essential services without placing an excessive burden on residents.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Reduce internal administration, staffing or contract costs''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Reduce internal administration, staffing or contract costs''; toronto should first look for efficiencies within its own operations, including administration, staffing and contracts.';

update positions p
set summary_short = 'Ahmed Kamal chose ''Overriding council on zoning and approvals to get homes built''.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-ahmed-kamal'
  and i.slug = 'government'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Ahmed Kamal chose ''Overriding council on zoning and approvals to get homes built''; strong mayor powers should be used sparingly but decisively when they can help address Toronto''s housing shortage.';

update positions p
set summary_short = 'Mina Nadimi chose ''Yes''; she says housing needs depend on the ward map and could change with population growth.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-mina-nadimi'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.buildcanada.com/toronto/vote/2026/wards/12'
  and p.summary_short = 'Mina Nadimi chose ''Yes''; yes, I think that''s all depends on map of the current ward which i am assuming things could change due to population growth .';

update positions p
set summary_short = 'Olivia Chow answered yes to advancing Toronto''s Single Use Strategy with new policies to cut single-use trash at big events.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-olivia-chow'
  and i.slug = 'environment'
  and coalesce(p.source_url, '') = 'https://election.torontoenvironment.org/mayoral_candidate_survey_results_2026'
  and p.summary_short = 'Olivia Chow answered yes to advancing Toronto''s Single Use Strategy with new policies to cut single-use trash at big events and support reusables in restaurants.';

update positions p
set summary_short = 'Olivia Chow answered yes to pausing approvals of new large AI data centres until the City adopts an impact-assessment framework.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-olivia-chow'
  and i.slug = 'environment'
  and coalesce(p.source_url, '') = 'https://election.torontoenvironment.org/mayoral_candidate_survey_results_2026'
  and p.summary_short = 'Olivia Chow answered yes to pausing approvals of new large AI data centres until the City adopts a framework for assessing their impacts and ensuring local benefits.';

update positions p
set summary_short = 'Olivia Chow pledged 15,000 new youth jobs.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-olivia-chow'
  and i.slug = 'economy'
  and coalesce(p.source_url, '') = 'https://www.europesays.com/canada/250502/'
  and p.summary_short = 'Olivia Chow pledged 15,000 new youth jobs, 20 per cent local hiring on the Scarborough East LRT, and $28 million for youth violence prevention, mentorship and employment programs.';

update positions p
set summary_short = 'Olivia Chow pledged shovels in the ground on 10,000 new rental homes in 2027.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-olivia-chow'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.rentalhousingbusiness.ca/olivia-chow-makes-pitch-for-10000-new-rental-homes-voices-concern-over-potential-ballot-confusion/'
  and p.summary_short = 'Olivia Chow pledged shovels in the ground on 10,000 new rental homes in 2027 as part of a plan to build 65,000 homes by 2030, with at least 20 per cent affordable.';

update positions p
set summary_short = 'Brad Bradford says families and small businesses are asked to pay more for a city that delivers less.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-brad-bradford'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://bradford26.ca/'
  and p.summary_short = 'Brad Bradford says families and small businesses are asked to pay more for a city that delivers less, citing climbing property taxes and rising user fees.';

update positions p
set summary_short = 'Brad Bradford says Toronto''s parks have become tent cities unsafe for children and pets.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-brad-bradford'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://bradford26.ca/'
  and p.summary_short = 'Brad Bradford says Toronto''s parks have become tent cities unsafe for children and pets, calling cleanliness the most visible proof of whether a city works.';

update positions p
set summary_short = 'Brad Bradford promised to freeze property taxes for his first year and conduct a line-by-line budget review.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-brad-bradford'
  and i.slug = 'taxes-and-spending'
  and coalesce(p.source_url, '') = 'https://www.europesays.com/canada/221366/'
  and p.summary_short = 'Brad Bradford promised to freeze property taxes for his first year and conduct a line-by-line budget review to fund 1,000 more police officers and TTC platform edge doors.';

update positions p
set summary_short = 'Brad Bradford pledged to make the Eglinton East LRT his top transit priority with construction by 2030.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-brad-bradford'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.europesays.com/canada/250502/'
  and p.summary_short = 'Brad Bradford pledged to make the Eglinton East LRT his top transit priority with construction by 2030, remove 12 km of red bus lanes in Scarborough, and guarantee 15-minute service on key bus routes.';

update positions p
set summary_short = 'Nate Erskine-Smith''s housing plan: gentle density in neighbourhoods, midrise on avenues, greater density at transit hubs.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith''s housing plan: gentle density in neighbourhoods, midrise on avenues, greater density at transit hubs with every ward doing its part, plus a public land bank and expanded rapid housing.';

update positions p
set summary_short = 'Nate Erskine-Smith says the city should deliver the 10 FastTrackTO recommendations to speed up streetcar service.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'transit'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith says the city should deliver the 10 FastTrackTO recommendations to speed up streetcar service and prioritize faster, more reliable subways.';

update positions p
set summary_short = 'Nate Erskine-Smith says east-end Gardiner congestion should be fixed by fast-tracking the Cherry Street rebuild.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'roads-and-infrastructure'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith says east-end Gardiner congestion should be fixed by fast-tracking the planned Cherry Street rebuild with transparent timelines.';

update positions p
set summary_short = 'Nate Erskine-Smith says the city should phase out the Portlands gas plant through a massive expansion of renewables.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'environment'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith says the city should phase out the Portlands gas plant through a massive expansion of renewables, especially rooftop solar.';

update positions p
set summary_short = 'Nate Erskine-Smith says public safety is part of transit service quality and Chow''s TTC security staff should be assessed and bolstered.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'emergency-services'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith says public safety is part of transit service quality and that Chow''s increased TTC security staff and outreach workers should be assessed and bolstered.';

update positions p
set summary_short = 'Nate Erskine-Smith calls for an ambitious expansion of rapid housing to deliver dignity for those in need.', updated_at = now()
from candidates c, issues i
where p.candidate_id = c.id and p.issue_id = i.id
  and c.slug = 'toronto-nate-erskine-smith'
  and i.slug = 'housing'
  and coalesce(p.source_url, '') = 'https://www.uncommons.ca/p/ward-19-campaign-dispatch-2-rebuilding'
  and p.summary_short = 'Nate Erskine-Smith calls for an ambitious expansion of rapid housing to deliver dignity for those in need while keeping public spaces welcoming.';

commit;

-- ---------------------------------------------------------------------
-- VERIFY — expect 0: no Toronto position still over 140 characters.
-- ---------------------------------------------------------------------
select count(*) as toronto_summaries_over_140
from positions p
join candidates c on c.id = p.candidate_id
where c.slug like 'toronto-%'
  and char_length(coalesce(p.summary_short, '')) > 140;
