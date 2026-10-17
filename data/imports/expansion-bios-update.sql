-- =====================================================================
-- SmarterVote.ca — approved candidate bios for the Ontario expansion tier
--
-- Generated 2026-10-17 from expansion-review-2026-10-17-bios-v3.2.xlsx Bios tab.
-- Andreas approved these bios on 2026-10-17 ("Bios are good"); this file
-- replaces the parked 96-bio staged version.
-- APPLY ONLY AFTER migration 27 (candidates must exist). Not a numbered
-- migration — supplemental data patch. Run by Andreas in the SQL editor.
--
-- Each UPDATE keys on (slug, race_id) so it touches exactly one candidate
-- row. Where a slug is shared by more than one candidate in the same
-- municipality, the comment flags AMBIGUOUS and the race_id subquery
-- resolves it. The one honest no-bio candidate (Rick Flannigan, Muskoka
-- Lakes) is intentionally left null — no UPDATE below for him.
--
-- Idempotent: re-running is safe (UPDATEs are deterministic).
-- =====================================================================

begin;

-- Andrew Struthers (Councillor - Ward 3 (Macaulay), Bracebridge)
UPDATE candidates SET bio = 'Andrew Struthers is running for Ward 3 (Macaulay) councillor in Bracebridge. His platform pledges include keeping tax increases as close to or below inflation, full transparency on long-term budget forecasts, a full-service hospital and obstetrics unit in Bracebridge, and delivering the Memorial Arena site redevelopment on time and on budget. He also advocates for active-transportation-friendly streets and investing in prevention through the Community Safety and Well-Being Plan.' WHERE slug = 'bracebridge-andrew-struthers' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-3-macaulay');

-- Brenda Rhodes (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Brenda Rhodes is seeking re-election as Deputy Mayor and Town and District Councillor for Bracebridge, a role she has held for the past four years. Her platform emphasizes steady, thoughtful local government: responsible growth, healthy finances, real environmental protection, affordability, housing and health care that reach beyond the hospital. She commits to accessibility and communication with residents, including explaining the reasoning behind her votes.' WHERE slug = 'bracebridge-brenda-rhodes' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-district-councillor');

-- Brian Koehn (Councillor Ward 1 (Bracebridge), Bracebridge)
UPDATE candidates SET bio = 'Brian Koehn is running for Ward 1 councillor in Bracebridge, where he says he has lived for many years. His stated focus is on better roads, more parking, supporting local businesses, and improving garbage and recycling services. He says listening to residents and making sure their concerns are heard is his top priority.' WHERE slug = 'bracebridge-brian-koehn' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-1-bracebridge');

-- Christian McEachran Morin (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Christian McEachran Morin is running for District Councillor in Bracebridge. His family moved to Muskoka permanently in 2002, and he has Muskoka roots going back five generations; he is raising his family in Bracebridge. Since 2022 he has taken a more active role in municipal climate action, including attending the December 7, 2023 District Committee of the Whole as a member of the public and securing a motion to create a climate reserve fund. His priorities include a full-service hospital, environmental protection, infrastructure for a growing community, and making the District Chair an elected position.' WHERE slug = 'bracebridge-christian-mceachran-morin' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-district-councillor');

-- Cindy Waters (Councillor - Ward 4 (Draper), Bracebridge)
UPDATE candidates SET bio = 'Deep roots in Draper, though now living in the town of Bracebridge. Retired in 2024 after a healthcare career including close to 14 years at South Muskoka Memorial Hospital; gathered more than 14,000 signatures on a Care Close to Home hospital petition.' WHERE slug = 'bracebridge-cindy-waters' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-4-draper');

-- Debbie Vernon (Councillor - Ward 1 (Bracebridge), Bracebridge)
UPDATE candidates SET bio = 'Born in Bracebridge and a BMLSS graduate. Assisted people with disabilities moving from institutions to home communities; obtained real estate license in 1999. Has made her home of 34 years on the Muskoka River; family farm roots near Port Carling on Lake Rosseau dating to the late 1800s. She pledges to be accessible and responsive to residents, manage tax dollars responsibly, and work on ALC beds and affordable housing.' WHERE slug = 'bracebridge-debbie-vernon' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-1-bracebridge');

-- Don Smith (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Don Smith is seeking re-election as District Councillor for Bracebridge. Since graduating from BMLSS he has built a Muskoka career as a journalist, publisher and retailer, and he has been a Rotarian for over 40 years with involvement in numerous volunteer groups. His stated priorities include affordable housing, better health care with attention to mental health, a positive local business environment, more public waterfront access and protecting the watershed and environment.' WHERE slug = 'bracebridge-don-smith' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-district-councillor');

-- Donald Blais (School Board Trustee - MonAvenir (Simcoe-Muskoka), Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Married for 32 years, father of two. Telecommunications entrepreneur for 29 years specializing in fiber optics. Volunteered 13 years with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie. Has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' WHERE slug = 'bracebridge-donald-blais' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-school-board-trustee-monavenir-simcoe-muskoka');

-- Donna Kearney (Councillor - Ward 3 (Macaulay), Bracebridge)
UPDATE candidates SET bio = 'A pioneering Nurse Practitioner with a 30-year healthcare career in Muskoka. Secured public and political funding for the Rosseau Nursing Station, five rural Health Hubs and Hospice Muskoka-Andy''s House. Has lived in Macaulay Ward for over 30 years and is retiring from the healthcare system.' WHERE slug = 'bracebridge-donna-kearney' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-3-macaulay');

-- Laura Craig (Councillor - Ward 4 (Draper), Bracebridge)
UPDATE candidates SET bio = 'Has run the Muskoka General store+refillery in Draper Ward for the past three years, getting to know neighbours, families and local business owners. A small business owner who understands budgets and problem-solving, she pledges to advocate for improved road maintenance, fair investment in Draper Ward and stronger local healthcare services.' WHERE slug = 'bracebridge-laura-craig' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-councillor-ward-4-draper');

-- Norman Raynor (Mayor, Bracebridge)
UPDATE candidates SET bio = 'Norman Raynor is challenging for Mayor of Bracebridge. He pledges to fight for the best possible hospital for Bracebridge, including restoring obstetrical and ALC services, and to hold the line at zero tax increases by trimming budgets and supporting needs over wants. He also pledges local-contractor priority in town contract awards and regular public updates, including a paper newsletter for residents who are not online.' WHERE slug = 'bracebridge-norman-raynor' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-mayor');

-- Richard Struthers (Trustee - English Public (Trillium Lakelands District School Board), Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'For forty years was CEO of a manufacturing company, 15 of those years in Bracebridge. Wife was a teacher for 40 years; son and he included education in their university studies.' WHERE slug = 'bracebridge-richard-struthers' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-trustee-english-public-trillium-lakelands-district-school-board');

-- Rick Maloney (Mayor, Bracebridge)
UPDATE candidates SET bio = 'Incumbent Mayor of Bracebridge seeking re-election. He describes his approach as experienced, steady and responsible leadership, focused on affordability, housing, health care, infrastructure, economic opportunity, environmental stewardship and the quality of life for all residents. He strongly supports obstetrical services at the future South Muskoka hospital in Bracebridge.' WHERE slug = 'bracebridge-rick-maloney' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-mayor');

-- Sandy Inkster (Trustee - English Public (Trillium Lakelands District School Board), Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Based in Bracebridge for employment with agencies since 1989, supporting families from prenatal classes through students'' school careers. Worked in partnership with TLDSB for over 30 years on initiatives and professional development; family members are educators.' WHERE slug = 'bracebridge-sandy-inkster' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-trustee-english-public-trillium-lakelands-district-school-board');

-- Tatiana Sutherland (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, disambiguated by race
UPDATE candidates SET bio = 'Tatiana Sutherland is running for re-election as District Councillor for Bracebridge. Three generations of her family call Bracebridge home; she is raising her eight-year-old daughter there while her parents and mother-in-law are seniors in the community. She works in Muskoka''s tourism sector and serves as Chair of the Muskoka Community Land Trust. Over the past four years she has focused on protecting Muskoka''s environment, creating more attainable housing and strengthening local health care.' WHERE slug = 'bracebridge-tatiana-sutherland' AND race_id = (SELECT id FROM races WHERE slug = 'bracebridge-district-councillor');

-- Jagruti Bhatt (Mayor, Brampton)
UPDATE candidates SET bio = 'Entrepreneur and mayoral candidate campaigning on affordability (''My home. My Brampton. My sanctuary.''); runs the campaign site flowercitybrampton.ca and publishes a weekly guest column on Brampton issues. Says municipal government should protect taxpayers, respect homeowners and support businesses while remembering ''behind every tax bill is a family working hard to pay it.''' WHERE slug = 'brampton-jagruti-bhatt' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Patrick Brown (Mayor, Brampton)
UPDATE candidates SET bio = 'Mayor of Brampton since 2018, running for a third term under the theme ''Keep Building Brampton''s Future.'' His campaign centres on delivering $9.4 billion in transformational investments now underway across healthcare, transit, recreation, public safety and community infrastructure, which he attributes to years of advocacy at Queen''s Park and Parliament Hill.' WHERE slug = 'brampton-patrick-brown' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Paul Tarriwal (Mayor, Brampton)
UPDATE candidates SET bio = 'Brampton resident for 40+ years; 22 years in Brampton real estate (RECO registered); a father and, in his words, ''not a career politician.'' Says 22 years of negotiating transactions and following through on commitments shaped how he thinks government should work: set clear priorities, make responsible decisions, respect people''s money, finish what you start.' WHERE slug = 'brampton-paul-tarriwal' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Prabh Gill (Mayor, Brampton)
UPDATE candidates SET bio = 'Prabh Gill is an arbitrator, family resolution professional, human rights advocate and long-time community leader running for Mayor of Brampton under the ''Brampton First'' banner. His campaign says he has ''spent decades helping people resolve difficult problems, find common ground and move forward,'' and presents him as ''a problem solver before a politician.'' His site lays out a first-100-days plan: listen and review in days 1-30, launch priority action plans in days 31-60, and publicly report results by day 100.' WHERE slug = 'brampton-prabh-gill' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Sandeep Somal (Mayor, Brampton)
UPDATE candidates SET bio = 'Born and raised in Brampton; works in the non-profit sector and founded a hockey club for low-income and racialized youth. Says he has worked actively in the community across non-profit spaces focused on supporting youth and families, and is running to make city government more responsive, efficient and focused on families and youth.' WHERE slug = 'brampton-sandeep-somal' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Wesley Jackson (Mayor, Brampton)
UPDATE candidates SET bio = 'Grew up in Brampton''s Heart Lake community, where his family lived in social housing. A lawyer and small-business owner whose law practice helps Brampton families buy homes and plan for the future. First ran for mayor in 2018 as an independent voice for integrity and practical results. Husband, father, photographer and longtime cyclist who has raised funds for cancer research through the Ride to Conquer Cancer; holds live town halls every Tuesday.' WHERE slug = 'brampton-wesley-jackson' AND race_id = (SELECT id FROM races WHERE slug = 'brampton-mayor');

-- Allan Hazelton (Councillor - Ward 4, Georgian Bay)
UPDATE candidates SET bio = 'Allan Hazelton is the incumbent Ward 4 (Honey Harbour) Councillor for the Township of Georgian Bay, serving since 2018. He is a board member of the Georgian Bay Township Public Library and has served as a board member and chair of the Planning Committee, as well as on water quality monitoring and waterfront planning working groups. He says he has championed environmental priorities and has been conducting water quality sampling and testing for several years.' WHERE slug = 'georgian-bay-allan-hazelton' AND race_id = (SELECT id FROM races WHERE slug = 'georgian-bay-councillor-ward-4');

-- Donald Blais (School Board Trustee - MonAvenir (French Separate), Georgian Bay)
UPDATE candidates SET bio = 'Donald Blais is a telecommunications entrepreneur specializing in fiber optics with 29 years in the field, married for 32 years and a father of two. For the past 13 years he has volunteered with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie, helping young offenders make amends to their victims and the community. He says he has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' WHERE slug = 'georgian-bay-donald-blais' AND race_id = (SELECT id FROM races WHERE slug = 'georgian-bay-school-board-trustee-monavenir-french-separate');

-- Laurie Russell (District Councillor - Wards 1 and 3, Georgian Bay)
UPDATE candidates SET bio = 'Laurie Russell is running for District Councillor for Wards 1 and 3 in the Township of Georgian Bay. She has more than 20 years of senior leadership experience in international business and seven years of local community leadership, including consecutive terms as president of an elected volunteer board. She says the experience gained through community leadership could help residents across Wards 1 and 3.' WHERE slug = 'georgian-bay-laurie-russell' AND race_id = (SELECT id FROM races WHERE slug = 'georgian-bay-district-councillor-wards-1-and-3');

-- Peter Koetsier (Mayor, Georgian Bay)
UPDATE candidates SET bio = 'Peter Koetsier is the incumbent Mayor of the Township of Georgian Bay, serving for the past eight years, and also sits as a District of Muskoka councillor, where he chaired the Finance Committee. Born and raised in Waterloo, he has had a family connection to Georgian Bay for over 60 years, with his family cottaging in the Honey Harbour area since 1971. He spent 29 years as a senior executive with a Barrie-based international manufacturing company, serving as Comptroller, Vice-President Administration and Senior Vice-President Strategic Planning, and has served on the boards of the Georgian Bay Land Trust, the Georgian Bay Mnidoo Gamii Biosphere and the Honey Harbour Association.' WHERE slug = 'georgian-bay-peter-koetsier' AND race_id = (SELECT id FROM races WHERE slug = 'georgian-bay-mayor');

-- Brad Rundle (Councillor - Ward 1, Gravenhurst)
UPDATE candidates SET bio = 'Brad Rundle is running for Ward 1 councillor in Gravenhurst, where his family moved in 1972 when he was nine; he grew up, worked, bought his first house and raised his family there. His work history includes eight years as a department head, serving as manager of the Gravenhurst Opera House. He describes himself as an unapologetic idealist, with a vision of a small town where everyone has a voice, small and family businesses are top priority, and working people and those struggling receive support.' WHERE slug = 'gravenhurst-brad-rundle' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-1');

-- Carol Ann Lemoine (Councillor - Ward 3, Gravenhurst)
UPDATE candidates SET bio = 'Carol Ann Lemoine is running for Ward 3 councillor in Gravenhurst. A lifelong Morrison Lake cottager, she made the lake her year-round home two years ago, continuing a family connection spanning generations; her grandfather was among the lake''s original cottagers. She brings 25 years of experience in education as a classroom teacher, math consultant, vice-principal and principal, and has been active on professional associations, parent councils and nonprofits, including the Society of Saint Vincent de Paul and the Morrison Lake Ratepayers Association. Her priorities include protecting local lakes and rivers, reliable infrastructure, and a thriving downtown and year-round economy.' WHERE slug = 'gravenhurst-carol-ann-lemoine' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-3');

-- Christina Hunter (District Councillor, Gravenhurst)
UPDATE candidates SET bio = 'Christina Hunter is the current Ward 5 Councillor and Alternate District Councillor for Gravenhurst, and is running for District Councillor. She says she has enjoyed her first term working directly with residents, and is passionate about waste diversion strategies and housing initiatives for those in the deepest need. She is seeking the District seat because she believes there is still work to do in those areas and wants to be a voice for them at the District table.' WHERE slug = 'gravenhurst-christina-hunter' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-district-councillor');

-- David Kellam (Councillor - Ward 2, Gravenhurst)
UPDATE candidates SET bio = 'David Kellam is running for Ward 2 councillor in Gravenhurst. He has grown up and lived in Ward 2 since the age of five, full-time since 2010; he has owned his home on the water for 36 years and his daughter attended Gravenhurst High School. He says strong connection to community is his main goal: he wants to listen to residents, act on their behalf at council, and be responsive and available.' WHERE slug = 'gravenhurst-david-kellam' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-2');

-- Elizabeth Shannon (Councillor - Ward 1, Gravenhurst)
UPDATE candidates SET bio = 'Elizabeth Shannon is running for Ward 1 councillor in Gravenhurst. She brings 25 years of experience in governance, strategic planning, financial management, policy development and advocacy. Her platform pillars are responsible and collaborative leadership, a thriving year-round downtown and waterfront, environmental stewardship and waterfront protection, affordable housing, and improved accessibility including safe sidewalks and crossings. She pledges regular communication through quarterly Ward 1 forums and a monthly e-newsletter.' WHERE slug = 'gravenhurst-elizabeth-shannon' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-1');

-- Erin Gauthier (Councillor - Ward 1, Gravenhurst)
UPDATE candidates SET bio = 'Erin Gauthier is running for Ward 1 councillor in Gravenhurst, where she has called home for over ten years; her husband''s family has deep roots there, including helping build a local subdivision. She is a mother of three with 19 years of experience as a contracts administrator and five years as a front-line crisis counsellor supporting women and families affected by domestic violence. Her goals include more affordable housing for full-time residents, support for local businesses, downtown revitalization, and improved roads and infrastructure.' WHERE slug = 'gravenhurst-erin-gauthier' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-1');

-- Erin Strength (District Councillor, Gravenhurst)
UPDATE candidates SET bio = 'Erin Strength is the incumbent District Councillor, elected to council as a Ward Councillor in 2014 and as a District Councillor in 2022. She has lived full-time in Gravenhurst since she was seven and is a graduate of Gravenhurst Public and Gravenhurst High School. She spent 25 years as manager of a pharmacy and now runs her own business as a seniors assistant. She has served on the Committee of Adjustment, the Gravenhurst BIA and the Community and Planning Services Committee, and points to affordable housing advocacy, the Gravenhurst Health Hub, and four years of some of Muskoka''s lowest tax levy increases as her record.' WHERE slug = 'gravenhurst-erin-strength' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-district-councillor');

-- Gordie Merton (Councillor - Ward 1, Gravenhurst)
UPDATE candidates SET bio = 'Gordie Merton is running for Ward 1 councillor in Gravenhurst. He is a fifth-generation Gravenhurst High School graduate, a local small business owner, and an active volunteer with community groups across town and the region. His priorities are council accountability and transparency, core infrastructure including road safety, sidewalks and lake health, and balanced growth that supports local entrepreneurs while protecting Gravenhurst''s environment and natural beauty.' WHERE slug = 'gravenhurst-gordie-merton' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-1');

-- Heidi Lorenz (Mayor, Gravenhurst)
UPDATE candidates SET bio = 'Heidi Lorenz is the incumbent Mayor of Gravenhurst, seeking re-election after four years as mayor. Before that she served as a Ward Councillor and then a District Councillor, giving her sixteen years of service to Gravenhurst. She chairs the Muskoka Engineering and Public Works committee and has served on the BIA, the Library Board, the Trails Committee, Muskoka Tourism, the OPP Detachment Board, the Muskoka Indigenous Leadership Table and the Emergency Management Program Team. Her platform points to residential development, expanded transportation services, the coming Gravenhurst Health Hub and significant business investment as progress to build on.' WHERE slug = 'gravenhurst-heidi-lorenz' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-mayor');

-- Heidi Welker (Councillor - Ward 1, Gravenhurst)
UPDATE candidates SET bio = 'Heidi Welker is running for Ward 1 councillor in Gravenhurst. She brings more than 40 years of experience helping organizations grow, building partnerships and delivering results, especially in business development. Over the past four years she has served on the town''s Awards and Grants committees and as a trustee of the Gravenhurst Library board. Her platform focuses on making Gravenhurst a vibrant year-round destination, refreshing downtown appeal, community care including the Health Hub and attainable housing, and environmental protection with good governance.' WHERE slug = 'gravenhurst-heidi-welker' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-1');

-- Jaden Hollingshead (District Councillor, Gravenhurst)
UPDATE candidates SET bio = 'Jaden Hollingshead was born and raised in Muskoka and has called Gravenhurst home for more than five years, where he lives with his wife and son. He is the Executive Director of the Bracebridge Chamber of Commerce, a role he has held for three years, and previously owned a marketing agency that worked with small businesses across the region. He also sits on the board of the Muskoka Community Land Trust, which works to create permanently affordable housing in Muskoka. His priorities are housing that local workers can afford, a vibrant year-round downtown, and protecting the lakes and forests.' WHERE slug = 'gravenhurst-jaden-hollingshead' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-district-councillor');

-- Jeff Watson (Mayor, Gravenhurst)
UPDATE candidates SET bio = 'Gravenhurst resident for more than 35 years. Owned and operated both Gravenhurst Tim Hortons locations for 32 years. Served three terms on Gravenhurst Council, including as Deputy Mayor (2010-2018). Served eight years with the Gravenhurst Fire Department as firefighter, Captain and Training Officer; graduate of the Ontario Fire College. Currently serves on the Board of the South Muskoka Hospital Foundation; past boards include Gravenhurst Hydro, Chamber of Commerce and Muskoka Tourism.' WHERE slug = 'gravenhurst-jeff-watson' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-mayor');

-- Jo Morphy (Mayor, Gravenhurst)
UPDATE candidates SET bio = 'Jo Morphy is a twice-elected Gravenhurst Town Councillor and past president of the Muskoka Bay Property Owners Association, with close to a decade of service to the town. Her background is in business, and she describes an analytical, stewardship-oriented approach to municipal leadership. She is married to her husband Geoff; they live in Gravenhurst with their Golden Retriever, Indy, and she is a mother and grandmother. She says she cares deeply about the lakes and their ecosystems, believing that protecting the lakes means protecting the town.' WHERE slug = 'gravenhurst-jo-morphy' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-mayor');

-- Larry Brassard (Councillor - Ward 3, Gravenhurst)
UPDATE candidates SET bio = 'Resident of Ward 3 since 2012. Career firefighter (44 years) and police officer (20 years); served as Fire Chief in Gravenhurst from 2012 through 2021, serving on the Town''s Senior Management Team building corporate budgets. Volunteer with Team Rubicon, Samaritan''s Purse and Boots on the Ground; strong advocate for the homeless. Board experience includes the Ontario Association of Fire Chiefs, Crimestoppers and CMHA Muskoka/Parry Sound.' WHERE slug = 'gravenhurst-larry-brassard' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-3');

-- Marc Mantha (Mayor, Gravenhurst)
UPDATE candidates SET bio = 'Marc Mantha is running for Mayor of Gravenhurst. He describes a career spent helping organizations work better and reach their full potential, carried into community volunteering, listening and problem-solving. He pledges excellence in municipal service, strong tax stewardship, thoughtful planning, infrastructure investment, a bold approach to housing, economic opportunity and primary health care for all, while protecting the character and natural beauty of the town. He advocates for a minimum of 60 acute-care beds at the future South Muskoka hospital.' WHERE slug = 'gravenhurst-marc-mantha' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-mayor');

-- Penny Varney (District Councillor, Gravenhurst)
UPDATE candidates SET bio = 'Penny Varney served as Ward 1 Councillor for the past eight years and is running for District Councillor. She has lived in Gravenhurst for 45 years; she owned Penny Varney Jewellery Gallery and Gifts for 15 years and co-owned Gravenhurst Pharmacy with her husband for 20 years. She started the Gravenhurst Breakfast program at the high school and the Gravenhurst Women''s Centre, founded the Arts at the Albion Co-Op gallery, and helped bring a ladder truck to the Gravenhurst fire department. She is running at the District level because her top criteria - waste management, property taxes, environmental sustainability and the cost of housing - are largely handled there.' WHERE slug = 'gravenhurst-penny-varney' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-district-councillor');

-- Sandy Cairns (District Councillor, Gravenhurst)
UPDATE candidates SET bio = 'Sandy Cairns is the incumbent District Councillor, with more than 26 years of municipal service across multiple terms as a Gravenhurst Councillor and, more recently, as a District Councillor. She has served on the Health Services Committee and the Simcoe Muskoka District Health Unit as vice-chair, with her mission being to move the Gravenhurst Health Hub forward and protect the environment. She describes a people-centred, collaborative leadership approach and says her commitment to Gravenhurst and all of Muskoka extends well beyond her elected role.' WHERE slug = 'gravenhurst-sandy-cairns' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-district-councillor');

-- Stephen Sims (Councillor - Ward 2, Gravenhurst)
UPDATE candidates SET bio = 'Full-time Ward 2 resident for 10 years; five generations of Sims family in Gravenhurst (grandparents bought property in 1932). PhD in neuroscience (McMaster); professor of Medicine and Dentistry at Western University for 29 years. Volunteer water quality sampler for the Muskoka Lakes Association for more than 20 years; president of the Lakeshore Drive Community Association (2013-present); former MLA board member; Gravenhurst Committee of Adjustment member since 2022.' WHERE slug = 'gravenhurst-stephen-sims' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-2');

-- Tina Kilbourne (Councillor - Ward 5, Gravenhurst)
UPDATE candidates SET bio = 'Tina Kilbourne is running for Ward 5 councillor in Gravenhurst. Her roots stretch back to 1973; she is a graduate of Ryde Public School and Gravenhurst High School, a daughter of a Gravenhurst senior, and a mother to downtown small-business entrepreneurs. She brings 26 years of municipal experience in economic development, public transit, environmental stewardship and supporting vulnerable families. Her five priorities are collaborative and transparent governance, environmental stewardship and lake health, responsible growth and fiscal accountability, community health, safety and wellbeing, and a vibrant downtown and strong local economy.' WHERE slug = 'gravenhurst-tina-kilbourne' AND race_id = (SELECT id FROM races WHERE slug = 'gravenhurst-councillor-ward-5');

-- Andrea Horwath (Mayor, Hamilton)
UPDATE candidates SET bio = 'Andrea Horwath is the Mayor of Hamilton, seeking re-election on October 26, 2026. ''Hamilton has always been my home,'' her campaign says: ''It''s where I grew up, where I raised my son, and where I''ve spent my career fighting for the people who live here.'' She previously served as Leader of the Ontario New Democratic Party (2009-2022), MPP for Hamilton Centre (2004-2022) and Ward 2 city councillor (1997-2004), and cites first-term progress on housing, roads, transit, the LRT and downtown revitalization.' WHERE slug = 'hamilton-andrea-horwath' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Keanin Loomis (Mayor, Hamilton)
UPDATE candidates SET bio = 'Keanin Loomis is a husband, father of three, business leader and community builder who has called Hamilton home since 2009. He was the founding Chief Operating Officer of Innovation Factory (2010-2013) and President & CEO of the Hamilton Chamber of Commerce (2013-2022), then Vice President Member Services at the Ontario Chamber of Commerce and President & CEO of the Canadian Institute of Steel Construction. He was runner-up in the 2022 Hamilton mayoral election.' WHERE slug = 'hamilton-keanin-loomis' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Nathalie Xian Yi Yan (Mayor, Hamilton)
UPDATE candidates SET bio = 'Nathalie Xian Yi Yan is a Hamilton traditional Chinese medicine and acupuncture practitioner and a long-time repeat candidate in Hamilton municipal elections, having previously run for Ward 6 in 2010. She has been a fixture on Hamilton ballots for years, campaigning on fiscal discipline and root-cause rather than band-aid approaches to city problems.' WHERE slug = 'hamilton-nathalie-xian-yi-yan' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Rob Cooper (Mayor, Hamilton)
UPDATE candidates SET bio = 'Rob Cooper was born and raised in Hamilton and launched his career with Ernst & Young. A chartered professional accountant, he won the Ward 8 council by-election in September 2025 and is running for mayor on a platform of capping taxes and public safety.' WHERE slug = 'hamilton-rob-cooper' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Sasha Austin (Mayor, Hamilton)
UPDATE candidates SET bio = 'Sasha Austin is a lifelong Hamilton resident and an Indigenous Patient Navigator at the De Dwa Da Dehs-Nyes Indigenous Health Centre, with experience in grant writing, healthcare, outreach, public administration and social services. In her candidate-submitted profile she describes a life of frontline advocacy and fiscal watchdog work.' WHERE slug = 'hamilton-sasha-austin' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Scarlett Gillespie (Mayor, Hamilton)
UPDATE candidates SET bio = 'Scarlett Gillespie is a community organizer and activist, and the Executive Director of the Sex Workers'' Action Program (SWAP) Hamilton, where she advocates for the safety and dignity of marginalized residents. Her leadership was recognized with the 2024 YWCA Hamilton Woman of Distinction Award for her work on trans rights, housing security and social justice. She has fought for tenant protections and infrastructure maintenance at CityHousing Hamilton and advocates for climate justice and transparency in local government.' WHERE slug = 'hamilton-scarlett-gillespie' AND race_id = (SELECT id FROM races WHERE slug = 'hamilton-mayor');

-- Anna Meksavanh (Regional Councillor, Kitchener)
UPDATE candidates SET bio = 'Anna Meksavanh is a candidate for Regional Councillor in Kitchener. She is endorsed by CUPE 1883, having pledged in the union''s candidate survey to protect public services, oppose water privatization, and stand up for worker rights.' WHERE slug = 'kitchener-anna-meksavanh' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-regional-councillor');

-- Berry Vrbanovic (Mayor, Kitchener)
UPDATE candidates SET bio = 'Berry Vrbanovic has served as Mayor of Kitchener since 2014 and describes ''more than three decades of public service.'' In a September 1, 2026 campaign letter he says he worked with Council to deliver ''the lowest cumulative tax rate increase of any area municipality'' while accelerating housing and investing in roads, parks, trails and recreation. He is seeking re-election on October 26, 2026, promising to keep Kitchener affordable, build more housing, improve roads and infrastructure, and protect local jobs.' WHERE slug = 'kitchener-berry-vrbanovic' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-mayor');

-- Colleen James (Regional Councillor, Kitchener)
UPDATE candidates SET bio = 'Colleen James is the incumbent Regional Councillor for Kitchener, seeking re-election. She describes herself as a dedicated leader, advocate and community champion with a background in leadership, education and policy. She serves as Chair of Sustainability, Infrastructure, and Development at the Region of Waterloo, where she says her work focuses on resilient communities, innovation and responsible growth, rooted in collaboration, transparency and sustainability.' WHERE slug = 'kitchener-colleen-james' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-regional-councillor');

-- David Alton (Mayor, Kitchener)
UPDATE candidates SET bio = 'David Alton is a Kitchener-based homelessness and housing advocate who hosted the Right to Housing town hall (July 25, 2026, Chandler Mowat Community Centre) and the Right to Belong town hall (June 20, 2026, Victoria Hills Community Centre), which produced his mayoral platform.' WHERE slug = 'kitchener-david-alton' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-mayor');

-- George Trihenea (Mayor, Kitchener)
UPDATE candidates SET bio = 'George Trihenea is an entrepreneur and business owner with over 20 years of leadership experience who has built local businesses and created jobs. He served on Kitchener''s Downtown Action Advisory Committee, working with local organizations to strengthen the city.' WHERE slug = 'kitchener-george-trihenea' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-mayor');

-- Joe Gowing (Regional Councillor, Kitchener)
UPDATE candidates SET bio = 'Joe Gowing is the incumbent Regional Councillor for Kitchener, appointed by Regional Council in August 2025 to fill the vacancy left by the passing of Kari Williams; he was the Ontario Liberal candidate for Kitchener-Conestoga in the 2025 provincial election. His campaign frames his leadership as ''Practical leadership. Responsible spending. Real results,'' focused on affordability and the long-term well-being of Waterloo Region. He is endorsed by CUPE 1883.' WHERE slug = 'kitchener-joe-gowing' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-regional-councillor');

-- Manikantan Nair (Mayor, Kitchener)
UPDATE candidates SET bio = 'Manikantan Nair is a long-time Kitchener resident who has lived in Canada for 25 years and is running on making Kitchener ''one of the best cities in the world'' through ambitious, data-driven leadership.' WHERE slug = 'kitchener-manikantan-nair' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-mayor');

-- Matt Rodrigues (Regional Councillor, Kitchener)
UPDATE candidates SET bio = 'Matt Rodrigues is the incumbent Regional Councillor for Kitchener, seeking re-election in 2026. He joined Regional Council in 2025, appointed as the 2022 election runner-up to fill a vacancy. His campaign says he is ''running to continue serving as your Regional Councillor because we need steady leadership to achieve our full potential,'' working ''to build a responsive and affordable Kitchener.'' He is endorsed by CUPE 1883.' WHERE slug = 'kitchener-matt-rodrigues' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-regional-councillor');

-- Mohamed Askalany (Ward 9 Councillor, Kitchener)
UPDATE candidates SET bio = 'Mohamed Askalany is a candidate for Kitchener''s Ward 9 council seat. His background spans federal constituency casework, corporate strategy and high-stakes negotiations for multinational pharmaceutical firms including Pfizer and Bristol Myers Squibb, and clinical psychospiritual care research at Western University, where he is a Master of Psychotherapy and Spiritual Care candidate at Huron University College. He holds a Bachelor of Pharmaceutical Sciences from Minia University.' WHERE slug = 'kitchener-mohamed-askalany' AND race_id = (SELECT id FROM races WHERE slug = 'kitchener-ward-9-councillor');

-- Charles Cooper (Mayor, Lake of Bays)
UPDATE candidates SET bio = 'Charles Cooper is a community builder, business owner and cottager running for Mayor of Lake of Bays. His technology and business background includes governance roles as chair of the finance and audit committee of One Kids Place, chairman of the board of Peel Senior Link, president of his lakes cottagers'' association and cofounder of the Dwight food bank. He has volunteered with the Ontario Track3 program since 1997 and is appointed to the Ontario Trillium Foundation, reviewing grant applications to local charities.' WHERE slug = 'lake-of-bays-charles-cooper' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-mayor');

-- Donald Blais (School Board Trustee - French Language Separate (MonAvenir), Lake of Bays)
UPDATE candidates SET bio = 'Donald Blais is a telecommunications entrepreneur specializing in fiber optics with 29 years in the field, married for 32 years and a father of two. For the past 13 years he has volunteered with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie, helping young offenders make amends to their victims and the community. He says he has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' WHERE slug = 'lake-of-bays-donald-blais' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-school-board-trustee-french-language-separate-monavenir');

-- John Crowley (District Councillor - Franklin/Sinclair Ward, Lake of Bays)
UPDATE candidates SET bio = 'John Crowley is running for District Councillor for the Franklin/Sinclair Ward in Lake of Bays. His past careers include paramedic with Metro Toronto Ambulance, retired elementary teacher, medical logistics coordinator for an air ambulance company, and 20 years running a family farm in Grey County with a wholesale produce business. He has been active in coaching minor sports, teaching, emergency response and communicating with the public.' WHERE slug = 'lake-of-bays-john-crowley' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-district-councillor-franklin-sinclair-ward');

-- Linda Boothby (Councillor - Franklin Ward, Lake of Bays)
UPDATE candidates SET bio = 'Linda Boothby (née Clark) grew up in Dorset and is running for Franklin Ward Councillor in Lake of Bays. She spent ten years as Tax Collector for the Township of Algonquin Highlands, founded the Lake of Bays Garden Centre 25 years ago and took over the Dwight Farmers'' Market five years ago, growing it to about 65 local vendors. She has raised her children, built her business and volunteered on local committees, churches, schools and community initiatives in Lake of Bays.' WHERE slug = 'lake-of-bays-linda-boothby' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-councillor-franklin-ward');

-- Matt Young (Mayor, Lake of Bays)
UPDATE candidates SET bio = 'Matt Young was raised in Lake of Bays and now serves as a Station Chief in the Township''s fire department. He operates three local businesses — SPY Communications, Algonquin Fiber and MP Planning & Associates — and has chosen to raise his family in the township. He is running for Mayor on responsible development and bringing residents and council together.' WHERE slug = 'lake-of-bays-matt-young' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-mayor');

-- Michael Mahovlich (Councillor - Mclean Ward, Lake of Bays)
UPDATE candidates SET bio = 'Michael Mahovlich is a long-time cottager on Lake Rosseau who now calls Baysville home, running for McLean Ward Councillor in Lake of Bays. He is a small business owner who cites his experience with government bureaucracy, and he wants to support small businesses and environmentally sustainable growth. He is an active curler at the Lake of Bays Curling and Bocce club and volunteers at community events including Baysville''s Christmas Eve luminaries and the annual Surf & Turf.' WHERE slug = 'lake-of-bays-michael-mahovlich' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-councillor-mclean-ward');

-- Mike Jefford (Councillor - Ridout Ward, Lake of Bays)
UPDATE candidates SET bio = 'Mike Jefford has lived in Lake of Bays for 7 years and Muskoka for 17, and is running for Ridout Ward Councillor. He has run a landscape construction business for two decades along with an adventure tourism business, and in winter builds, maintains and helps promote two outdoor ice rinks in Bracebridge. He wants to support local entrepreneurs, protect shorelines and keep municipal government efficient.' WHERE slug = 'lake-of-bays-mike-jefford' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-councillor-ridout-ward');

-- Rick Brooks (District Councillor - Franklin/Sinclair Ward, Lake of Bays)
UPDATE candidates SET bio = 'Rick Brooks is running for District Councillor for the Franklin/Sinclair Ward in Lake of Bays. He says he has committed 40 years to community service and has received the Ontario Volunteer Service Award and the Queen''s Diamond Jubilee, with recognition from organizations including Doors Open, Heritage Port Hope, the Oshawa Food Drive and Kiwanis International. He pledges to stay approachable, keep an active voice for residents and encourage balanced development.' WHERE slug = 'lake-of-bays-rick-brooks' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-district-councillor-franklin-sinclair-ward');

-- Tim Withey (Mayor, Lake of Bays)
UPDATE candidates SET bio = 'Tim Withey is a lifelong Muskoka resident, founder and owner of Withey Insurance Brokers Ltd. in Huntsville, running for Mayor of Lake of Bays. He holds a BA in Environmental Studies and has served two terms on Huntsville Council, including as Chair of Community Services and Corporate Services. He has volunteered as a director with Huntsville District Memorial Hospital, Muskoka Algonquin Healthcare, the Chamber of Commerce and Crimestoppers, is President of the Algonquin Park Residents Association, and is a parent of three and grandparent of four.' WHERE slug = 'lake-of-bays-tim-withey' AND race_id = (SELECT id FROM races WHERE slug = 'lake-of-bays-mayor');

-- Bronagh Joyce Morgan (Mayor, London)
UPDATE candidates SET bio = 'Bronagh Joyce Morgan is a London lawyer since 2000 who has spent her career translating complicated law into plain language — her day job is teaching plain-language communication to municipalities across Canada. She worked 17 years as a casual employee of the City of London itself and has served on hospital-system board committees and not-for-profit boards. She is also a working artist whose murals are part of London''s streets and a small-business owner; she is running for one term only, on reforming how City Hall works (bylaws, contracts, meetings, budgets) so the city can fund housing, downtown revival and safety.' WHERE slug = 'london-bronagh-joyce-morgan' AND race_id = (SELECT id FROM races WHERE slug = 'london-mayor');

-- Josh Morgan (Mayor, London)
UPDATE candidates SET bio = 'Josh Morgan is seeking re-election as London''s mayor. His campaign says the last four years brought ''real progress'' on housing, revitalized parks and community spaces, office-to-residential conversions and micro-modular shelters, and that the next four years are about ''finishing what we started and being bold enough to do more.'' He was first elected mayor in 2022 with 65.7% of the vote after two terms as Ward 7 councillor (2014-2022).' WHERE slug = 'london-josh-morgan' AND race_id = (SELECT id FROM races WHERE slug = 'london-mayor');

-- Kirsten Krose (Mayor, London)
UPDATE candidates SET bio = 'Kirsten Krose is a London community leader running for Mayor in 2026. ''London is home,'' she says - ''where I''ve raised my family, pitched in with local organizations,'' including BGC, Homes for Heroes and Reforest London. She describes herself as ''not a career politician'' but ''a neighbour who decided to step up,'' bringing years of public service and public-affairs experience, including 20 years as a public servant, political staffer and consultant (SWON Public Affairs; formerly a communications assistant in Stephen Harper''s PMO). Her campaign focuses on reliable services, shorter commutes, safer neighbourhoods and respect for every tax dollar.' WHERE slug = 'london-kirsten-krose' AND race_id = (SELECT id FROM races WHERE slug = 'london-mayor');

-- Susan Stevenson (Mayor, London)
UPDATE candidates SET bio = 'Susan Stevenson has represented Ward 4 on London city council since 2022. Before municipal politics she was a professional accountant and sales/leadership coach. Married for 36 years, she and her husband have called London home for over 40 years, raised their children here, and built and sold a business in downtown London. On council she served on the Planning and Environment Committee, the Audit Committee (vice-chair), the London Police Service Board and the Middlesex-London Paramedic Service Authority Board.' WHERE slug = 'london-susan-stevenson' AND race_id = (SELECT id FROM races WHERE slug = 'london-mayor');

-- Amanda Yeung Collucci (Regional Councillor, Markham)
UPDATE candidates SET bio = 'Amanda Yeung Collucci is a three-term Markham councillor (Ward 6) running for Regional Councillor under the theme ''Our Home. Our Future.'', with the endorsement of departing Deputy Mayor Michael Chan.' WHERE slug = 'markham-amanda-yeung-collucci' AND race_id = (SELECT id FROM races WHERE slug = 'markham-regional-councillor');

-- Frank Scarpitti (Mayor, Markham)
UPDATE candidates SET bio = 'Frank Scarpitti has been Mayor of Markham since 2006, first elected to the office that year after serving as Markham Regional Councillor (elected 1985). He joined the 2026 race on the final day of nominations and is seeking another term.' WHERE slug = 'markham-frank-scarpitti' AND race_id = (SELECT id FROM races WHERE slug = 'markham-mayor');

-- Martin Ross (Mayor, Markham)
UPDATE candidates SET bio = 'Martin Ross is a first-time Markham mayoral candidate running as @martinross4mayor (creator account, 1,126 followers, linking to his campaign site). A single dad and Unionville neighbour, he coaches hockey and founded the Toronto Professional Hockey School; his campaign grew out of a four-year court fight with Markham City Hall over the backyard rink he built for his kids.' WHERE slug = 'markham-martin-ross' AND race_id = (SELECT id FROM races WHERE slug = 'markham-mayor');

-- Stephen Edgell (Mayor, Markham)
UPDATE candidates SET bio = 'Stephen Edgell is a Markham mayoral candidate who responds to the Markham Cycles questionnaire as a person who gets around by bicycle. No campaign site with a fuller bio was found; he also addressed the City''s Official Plan through a deputation.' WHERE slug = 'markham-stephen-edgell' AND race_id = (SELECT id FROM races WHERE slug = 'markham-mayor');

-- Alvin Tedjo (Mayor, Mississauga)
UPDATE candidates SET bio = 'Ward 2 Mississauga city councillor (2022-present) running for mayor on affordability and community safety. His family immigrated to Mississauga when he was four; he and his wife Rebecca are raising their family here. As councillor he says he delivered free transit for children, eased homebuilding, expanded green spaces, dog parks and trails, expanded shelter options, supported food banks, legalized street hockey and voted to lower taxes twice. Sits on city/regional committees including Budget, Planning and Development, Environmental Action and Conservation authorities.' WHERE slug = 'mississauga-alvin-tedjo' AND race_id = (SELECT id FROM races WHERE slug = 'mississauga-mayor');

-- Bonnie Crombie (Mayor, Mississauga)
UPDATE candidates SET bio = 'Business leader and experienced public servant; served as Mayor of Mississauga 2014-2024, winning three consecutive city-wide mandates (64%, 77%, 79%). Previously Ward 5 city/regional councillor (2011-2014) and MP for Mississauga-Streetsville (2008-2011); led the Ontario Liberal Party 2023-2026, regaining official party status. Earlier career in senior marketing/public-affairs roles (McDonald''s, Disney, Insurance Bureau of Canada); holds a U of T Honours BA and a Schulich MBA; mother of three and a new grandmother, living in Mississauga nearly three decades.' WHERE slug = 'mississauga-bonnie-crombie' AND race_id = (SELECT id FROM races WHERE slug = 'mississauga-mayor');

-- Carolyn Parrish (Mayor, Mississauga)
UPDATE candidates SET bio = 'Incumbent Mayor of Mississauga, running for re-election on a ''Proven. Leadership.'' record: championed the full-size Avro Arrow replica in Malton''s Paul Coffey Park, backed the School Streets pilot giving kids a car-free street at school pickup, and is pushing Peel service downloads and a fairer Peel police funding split. Daughter of Toronto police Constable Edward Janozeski (37 years of service).' WHERE slug = 'mississauga-carolyn-parrish' AND race_id = (SELECT id FROM races WHERE slug = 'mississauga-mayor');

-- Dipika Damerla (Mayor, Mississauga)
UPDATE candidates SET bio = 'Mississauga City Councillor for Ward 7 (Cooksville) since 2018, running for mayor a second time. As a councillor she pushed for Mobile Crisis Rapid Response Teams on Peel streets, brought motions calling for an independent value-for-money audit of Peel Regional Police, and advocates a Four-Day Pothole Guarantee, clean-parks enforcement and the One Mississauga Dashboard. Holds an MBA in finance (Rotman) and previously worked in corporate banking and ran a small business.' WHERE slug = 'mississauga-dipika-damerla' AND race_id = (SELECT id FROM races WHERE slug = 'mississauga-mayor');

-- Mike Matulewicz (Mayor, Mississauga)
UPDATE candidates SET bio = 'Retired Toronto Police Service detective with 34 years in community-based policing, corporate budget management and police-governance leadership. Says he will donate the mayor''s portion of the salary to Mississauga charities each year (estimated $500K over four years). Running a grassroots, no-donation ''Community first'' campaign focused on crime, affordability, job loss and poverty.' WHERE slug = 'mississauga-mike-matulewicz' AND race_id = (SELECT id FROM races WHERE slug = 'mississauga-mayor');

-- Bradley Mayer-Harman (Councillor, Mono)
UPDATE candidates SET bio = 'Mono resident, husband and father of two living in south Mono''s Purple Hill community. REALTOR since 2010, leads The Mayer-Harman Team; former President of the Brampton Real Estate Board and Provincial Director of the Ontario Real Estate Association. Community volunteer (Purple Hill community rink, Optimist Club, Habitat for Humanity). First ran for Mono Council in 2022, coming within 71 votes of election.' WHERE slug = 'mono-bradley-mayer-harman' AND race_id = (SELECT id FROM races WHERE slug = 'mono-councillor');

-- Christine Sinclair (Councillor, Mono)
UPDATE candidates SET bio = 'Deep roots in Mono; community worker and working mother of three. She and her husband are building their own house.' WHERE slug = 'mono-christine-sinclair' AND race_id = (SELECT id FROM races WHERE slug = 'mono-councillor');

-- John Creelman (Mayor, Mono)
UPDATE candidates SET bio = 'John Creelman is the incumbent Mayor of the Town of Mono, seeking re-election. He previously served as Deputy Mayor, winning that office with 70.4% of the vote, and his campaign centres on fiscal responsibility, roads, planning reform, and opposition to strong-mayor powers.' WHERE slug = 'mono-john-creelman' AND race_id = (SELECT id FROM races WHERE slug = 'mono-mayor');

-- Laura Campbell (Deputy Mayor, Mono)
UPDATE candidates SET bio = 'Small business owner with 15 years of experience, running for Deputy Mayor of the Town of Mono.' WHERE slug = 'mono-laura-campbell' AND race_id = (SELECT id FROM races WHERE slug = 'mono-deputy-mayor');

-- Melinda Davie (Mayor, Mono)
UPDATE candidates SET bio = 'Five years of experience serving Mono on Council. Background as a physician and professional misconduct adjudicator. Campaign slogan: ''Practical Leadership. Sound Decisions. Mono First.''' WHERE slug = 'mono-melinda-davie' AND race_id = (SELECT id FROM races WHERE slug = 'mono-mayor');

-- Allen Edwards (Township Councillor - Ward B/Ward 2, Muskoka Lakes)
UPDATE candidates SET bio = 'Allen Edwards was acclaimed as Muskoka Lakes'' Ward B District Councillor in 2022 and serves on the current council. He answered the Save South Muskoka Hospital Committee''s 2026 candidate questionnaire on the hospital redevelopment, saying Bracebridge and Huntsville both need equal care. His specific 2026 office could not be confirmed.' WHERE slug = 'muskoka-lakes-allen-edwards' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-township-councillor-ward-b-ward-2');

-- Barb Bridgeman (District and Township Councillor - Ward C/Ward 3, Muskoka Lakes)
UPDATE candidates SET bio = 'Barb Bridgeman served on Muskoka Lakes Council from 2018 to 2022, chairing the Planning Committee, and is running again for District Councillor for Ward C. Her family has been part of the Muskoka community since 1965, she has been a member of the Muskoka Lakes Association since 1965, and she has been a full-time resident since 2018. She says preserving Muskoka''s natural beauty and protecting the environment is her top priority.' WHERE slug = 'muskoka-lakes-barb-bridgeman' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-district-and-township-councillor-ward-c-ward-3');

-- Donald Blais (School Board Trustee - MonAvenir Simcoe-Muskoka (French Separate), Muskoka Lakes)
UPDATE candidates SET bio = 'Donald Blais is a telecommunications entrepreneur specializing in fiber optics with 29 years in the field, married for 32 years and a father of two. For the past 13 years he has volunteered with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie, helping young offenders make amends to their victims and the community. He says he has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' WHERE slug = 'muskoka-lakes-donald-blais' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-school-board-trustee-monavenir-simcoe-muskoka-french-separate');

-- Guy Burry (District and Township Councillor - Ward C/Ward 3, Muskoka Lakes)
UPDATE candidates SET bio = 'Guy Burry is the incumbent District and Township Councillor for Ward C in Muskoka Lakes, first acclaimed in 2022, and is seeking re-election. He has a 40-year finance and investment career, including as Chief Information Officer at SEI Financial and director and partner at Connor, Clark & Lunn Private Capital, and chairs the York University pension fund investment committee. In Muskoka since 1987 and full-time since 2019, he has served as vice chair of Muskoka Algonquin Healthcare and on the boards of the Muskoka Lakes Museum and the Muskoka Parry Sound Community Foundation.' WHERE slug = 'muskoka-lakes-guy-burry' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-district-and-township-councillor-ward-c-ward-3');

-- Jeff Bird (Township Councillor - Ward A/Ward 1, Muskoka Lakes)
UPDATE candidates SET bio = 'Jeff Bird is running for Township Councillor for Ward A/Ward 1 in Muskoka Lakes. He is a professional accountant and auditor with CPA, CGA and CIA designations, a BA in Economics and an ICD.D, who says he wants to bring financial accountability and good governance to the township''s budget. A resident of Torrance who has been coming to Muskoka since before he was born, he is married with two daughters and two grandchildren.' WHERE slug = 'muskoka-lakes-jeff-bird' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-township-councillor-ward-a-ward-1');

-- Mitchell Shea (Township Councillor - Ward B/Ward 2, Muskoka Lakes)
UPDATE candidates SET bio = 'Mitchell Shea is a farmer and roofer running for Ward B Councillor in the Township of Muskoka Lakes. He describes himself as a sixth-generation Muskoka resident whose family has lived on the same ground in Watt Township since the 1860s, and his son was born last year. His platform centers on year-round jobs, infrastructure and cell coverage, local food, clean water and council accountability.' WHERE slug = 'muskoka-lakes-mitchell-shea' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-township-councillor-ward-b-ward-2');

-- Pam Jeffery (Township Councillor - Ward C/Ward 3, Muskoka Lakes)
UPDATE candidates SET bio = 'Pam Jeffery (Pamela Jeffery) is a Ward C candidate for Muskoka Lakes Township Council and a fifth-generation Minett, whose great-great grandparents Charles and Fanny Minett built Clevelands House. She holds an HBA and MBA from the Ivey Business School and had a 40-plus-year career in public service, beginning at Queen''s Park in the Industry Minister''s office, followed by 20 years in government relations helping executives navigate Queen''s Park and Parliament Hill. She also served as Ontario Communications Advisor to Prime Minister Martin during the 2004 election.' WHERE slug = 'muskoka-lakes-pam-jeffery' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-township-councillor-ward-c-ward-3');

-- Rick Flannigan (Township Councillor - Ward A/Ward 1, Muskoka Lakes): NO BIO — intentionally skipped, left null

-- Rob Bosomworth (Township Councillor - Ward C/Ward 3, Muskoka Lakes)
UPDATE candidates SET bio = 'Rob Bosomworth is seeking re-election as Ward C Councillor in the Township of Muskoka Lakes, after eight years of township service — four on the Committee of Adjustment and four as Ward C Councillor, including as chair of the Planning Committee. He brings professional experience in finance and management and a background in municipal planning and bylaws. He says protecting the lakes, forests and communities of Muskoka and keeping municipal finances under control are his focus.' WHERE slug = 'muskoka-lakes-rob-bosomworth' AND race_id = (SELECT id FROM races WHERE slug = 'muskoka-lakes-township-councillor-ward-c-ward-3');

-- Alex Lawson (Mayor, Ottawa)
UPDATE candidates SET bio = 'Alex Lawson, 38, grew up in Heron Gate and now lives in Dunrobin with his wife and three daughters. After school he went into framing houses; eighteen years later he runs Capital Framing, a construction management company that builds more than 140 homes a year and employs over 17 people. His campaign slogan is ''A city that works for the people who live here.''' WHERE slug = 'ottawa-alex-lawson' AND race_id = (SELECT id FROM races WHERE slug = 'ottawa-mayor');

-- Jeff Leiper (Mayor, Ottawa)
UPDATE candidates SET bio = 'Jeff Leiper is running for Mayor of Ottawa on a platform of building ''a city that works'': a transit system you can count on, a city you can afford to live in, neighbourhoods where people feel safe, and a City Hall that is open and honest about what it is doing. He has served as Kitchissippi Ward councillor since 2014 and chairs the planning and housing committee.' WHERE slug = 'ottawa-jeff-leiper' AND race_id = (SELECT id FROM races WHERE slug = 'ottawa-mayor');

-- Mark Sutcliffe (Mayor, Ottawa)
UPDATE candidates SET bio = 'Mark Sutcliffe was elected Mayor of Ottawa in 2022 after, in his campaign''s words, ''a long campaign with 13 other candidates'' and ''a strong mandate to bring change to City Hall.'' He is running for re-election in 2026 on a platform of keeping taxes low, building 10,000 affordable homes this decade, and a $95 monthly transit pass.' WHERE slug = 'ottawa-mark-sutcliffe' AND race_id = (SELECT id FROM races WHERE slug = 'ottawa-mayor');

-- Neil Saravanamuttoo (Mayor, Ottawa)
UPDATE candidates SET bio = 'Neil Saravanamuttoo is an economist and first-time candidate raised in Ottawa''s west end. He studied economics at Carleton University and the London School of Economics, spent nearly two decades at Canada''s Department of Finance, and served as chief economist at the G20-backed Global Infrastructure Hub. He co-founded the non-profit CitySHAPES and was a champion leader against the $418.8M Lansdowne 2.0 project. He and his wife Kimberley have two daughters.' WHERE slug = 'ottawa-neil-saravanamuttoo' AND race_id = (SELECT id FROM races WHERE slug = 'ottawa-mayor');

-- Suraj Harish (Mayor, Ottawa)
UPDATE candidates SET bio = 'Suraj Harish, P.Eng., is a civil engineer and former City of Ottawa senior project manager with more than three decades of experience delivering roadway, transitway, watermain, stormwater and community infrastructure projects across Ottawa. He previously worked for the former Regional Municipality of Ottawa-Carleton. His campaign slogan is ''A former city employee is back to serve the community.''' WHERE slug = 'ottawa-suraj-harish' AND race_id = (SELECT id FROM races WHERE slug = 'ottawa-mayor');

-- Adam Smith (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'Adam Smith is running for Councillor of Ward 19 (Beaches-East York). He says Beaches-East York is his home for life, where he is raising his son, and he promises to represent ward residents'' interests to the city, developers and businesses — ''not the other way around'' — and to be personally available and accessible to residents.' WHERE slug = 'toronto-adam-smith' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Ahmed Kamal (Councillor - Ward 12 (Toronto-St. Paul's), Toronto)
UPDATE candidates SET bio = 'Ahmed Kamal is a candidate for Toronto City Council in Ward 12. He says he was raised in Ward 12 and is running to fix the ward''s infrastructure, build reliable transit, and ensure City Hall works for the community.' WHERE slug = 'toronto-ahmed-kamal' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-12-toronto-st-paul-s');

-- Amy Rosen (Mayor, Toronto)
UPDATE candidates SET bio = 'Amy Rosen is a Toronto mayoral candidate (rosenformayor.ca). In her own written statement she says she volunteered at a food bank for over a year, making hot lunches for about 100 people on Fridays, and saw the lineup double then triple within months. She proposes a universal school food program, income supports matching the real cost of living, and much more affordable housing.' WHERE slug = 'toronto-amy-rosen' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Austin Vieira (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'Austin Vieira is a candidate for Toronto City Council in Ward 19 (Beaches-East York), running a community-first campaign on ‘practical, local solutions that make daily life easier for the families who already call this neighborhood home.’ His platform covers affordable housing, childcare, transit and bike safety, parks and ravines, small business, and public safety.' WHERE slug = 'toronto-austin-vieira' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Brad Bradford (Mayor, Toronto)
UPDATE candidates SET bio = 'An urban planner, City Councillor, husband, and dad of two, Brad has spent his career on the work of how cities actually get built and how City Hall actually works.' WHERE slug = 'toronto-brad-bradford' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Braeden Chow (Mayor, Toronto)
UPDATE candidates SET bio = 'Braeden Chow is a candidate for Mayor of Toronto whose campaign, branded ‘Braeden Chow for a new era of Toronto,’ centres on building ‘the foundation for the next generation’ and youth opportunity. His site offers no detailed platform or biographical background.' WHERE slug = 'toronto-braeden-chow' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Chris Alexander (Mayor, Toronto)
UPDATE candidates SET bio = 'Chris Alexander is a former federal immigration minister running for mayor of Toronto as a centre-right challenger to incumbent Olivia Chow, polling a distant third at 7–10% in recent surveys. He is matching Brad Bradford''s call for an immediate property tax freeze, promising to route existing city revenues into core infrastructure, public safety and basic services, and has pledged 10,000 affordable and rent-geared-to-income homes a year with a 30-day approval window.' WHERE slug = 'toronto-chris-alexander' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Darrell Brown (Mayor, Toronto)
UPDATE candidates SET bio = 'Darrell Brown is a Toronto mayoral candidate. In his own written campaign statement he frames record food-bank visits as a policy failure driven by incomes not keeping pace with rent, groceries and transit, and pledges to press the province to raise social assistance rates to reflect Toronto''s real cost of living. He took part in a grassroots mayoral debate at Fairview Library on Oct 6, 2026.' WHERE slug = 'toronto-darrell-brown' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- David Cottrell (Councillor - Ward 12 (Toronto-St. Paul's), Toronto)
UPDATE candidates SET bio = 'David Cottrell is a Ward 12 (Toronto-St. Paul''s) council candidate running on ''independent leadership'' and practical solutions. His stated priorities include safer complete communities, better transit and mobility, more affordable housing, and transparent representation; he also backs rent control on all rental units, vacancy control and an end to Above-Guideline rent increases.' WHERE slug = 'toronto-david-cottrell' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-12-toronto-st-paul-s');

-- Denis Tsang (Councillor - Ward 15 (Don Valley West), Toronto)
UPDATE candidates SET bio = 'Denis Tsang has lived in Leaside for a decade and is running for council in Ward 15 (Don Valley West), his first run for public office. He is a dietitian who works as a primary care provider and is the board chair of the College of Dietitians of Ontario. He says the ward ''deserves a councillor who will show up consistently, listen widely, and turn community input into action at City Hall,'' and would prioritize measurably more reliable bus service and less stop-and-go traffic on the ward''s main corridors.' WHERE slug = 'toronto-denis-tsang' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-15-don-valley-west');

-- Denise Walcott (Councillor - Ward 14 (Toronto-Danforth), Toronto)
UPDATE candidates SET bio = 'Denise Walcott is a Ward 14 (Toronto-Danforth) council candidate. She grew up in Toronto-Danforth, where her parents ran a local business for more than 30 years, and she is a business owner, a marketing manager and a member of two condominium boards, serving as president of one. She promises accountability through 48-hour email responses, quarterly town halls, in-person office hours and monthly public progress updates.' WHERE slug = 'toronto-denise-walcott' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-14-toronto-danforth');

-- Edward Gong (Mayor, Toronto)
UPDATE candidates SET bio = 'Edward Gong, also known as Xiao Hua Gong, is a Chinese-Canadian businessman running for Toronto mayor. He finished 11th in the 2023 Toronto mayoral by-election with just under 3,000 votes, then ran in the 2024 Mississauga mayoral by-election and as an independent in Don Valley North in the 2025 federal election.' WHERE slug = 'toronto-edward-gong' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Georgios Kalkounis (Mayor, Toronto)
UPDATE candidates SET bio = 'Georgios Kalkounis is a Toronto mayoral candidate who describes himself as a business consultant and mechanical engineer with several decades of experience in engineering, project management, procurement and public-service management. In his own words, he has lived in Toronto for 57 years, spent about three decades in the Ontario public service, and was inspired to run partly by his 12-year-old grandson''s questions about who makes long-term spending decisions.' WHERE slug = 'toronto-georgios-kalkounis' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Jack Weenen (Mayor, Toronto)
UPDATE candidates SET bio = 'Jack Weenen is a Toronto mayoral candidate who also ran in the 2023 Toronto mayoral by-election. In his own questionnaire answers he calls for giving communities more agency over what their neighbourhoods look like, exempting core homeowners from any congestion charge, and restoring the TTC''s mid-century station aesthetics.' WHERE slug = 'toronto-jack-weenen' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- James Dann (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'James Dann is a Ward 19 (Beaches-East York) council candidate who spent 25 years at the City of Toronto managing parks, waterfront and public infrastructure, including the beaches, the islands, the ferries and flood defences. A third-generation resident of the ward, he has led projects including the Leuty Lifeguard Station restoration, the Kew Gardens Bandshell, boardwalk resurfacing and the Martin Goodman Trail, and he directed the 2017 and 2019 high-water crisis responses that cut flood risk on the Islands by 75%.' WHERE slug = 'toronto-james-dann' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Jason Stevens (Councillor - Ward 14 (Toronto-Danforth), Toronto)
UPDATE candidates SET bio = 'Jason Stevens is a Ward 14 (Toronto-Danforth) council candidate who says he has been elected eight times to national and local roles. He has run for Toronto council before, including in Ward 19 Trinity–Spadina in 2010 and in the 2024 Ward 15 Don Valley West byelection, where he finished 12th with 70 votes. In his own questionnaire answers he says ''housing is a right'' and that he showed up with Mayor Chow and former councillor Fletcher for the No Jets campaign.' WHERE slug = 'toronto-jason-stevens' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-14-toronto-danforth');

-- Jennie Worden (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'Jennie Worden is a Ward 19 (Beaches-East York) council candidate who has lived in the ward for over 15 years and works as a non-profit management professional. She describes herself as a champion for safer streets, tenants'' rights, more affordable housing and investment in social services and public programs. Her platform includes a streetcar revitalization plan for the 506 Carlton, 501 Queen and 503 Kingston, tenant protections against renoviction, and building more public housing through the Toronto builds framework with non-profit and co-operative providers.' WHERE slug = 'toronto-jennie-worden' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Jenny Kalimbet (Councillor - Ward 12 (Toronto-St. Paul's), Toronto)
UPDATE candidates SET bio = 'Jenny Kalimbet is a Ward 12 (Toronto-St. Paul''s) council candidate with a background in community organizing, small business advocacy and civic engagement. Endorsed by A Better City Toronto, her platform centres on safe neighbourhoods and public spaces, responsive city services and keeping taxes low. She supports funding more police, paramedics and mental-health crisis response services.' WHERE slug = 'toronto-jenny-kalimbet' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-12-toronto-st-paul-s');

-- Joshua Thompson (Mayor, Toronto)
UPDATE candidates SET bio = 'Joshua Thompson is a Toronto mayoral candidate. In his own written statement he says ''Toronto is a rich city that still has a line outside the food bank. That is not a vibe. That is a failure,'' pledges to treat violent crime as ''the first job of a city,'' and promises fiscal discipline across every agency, board and council. His stated priorities include building actual housing units and cutting taxes.' WHERE slug = 'toronto-joshua-thompson' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Karina Lemke (Councillor - Ward 11 (University-Rosedale), Toronto)
UPDATE candidates SET bio = 'Karina Lemke is a University of Toronto graduate, entrepreneur and former television personality running for council in Ward 11 (University-Rosedale). She built a wedding and event planning business for more than a decade, previously owned a flower shop on Markham Street, and was one of the original featured planners on the international series Rich Bride Poor Bride before creating and starring in HGTV Canada''s Petal Pushers. She lives near Spadina Road and Dupont with her family.' WHERE slug = 'toronto-karina-lemke' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-11-university-rosedale');

-- Keenan Courtis (Councillor - Ward 11 (University-Rosedale), Toronto)
UPDATE candidates SET bio = 'Keenan Courtis is a Ward 11 (University-Rosedale) council candidate with a professional track record navigating complex global IT systems, cybersecurity strategy and multimillion-dollar contracts across four continents for a Fortune 500 financial corporation. He describes himself as a community member, City Biker, TTC user and runner, and says Ward 11 needs representation that makes parks, streets and transit safe for all users. His platform calls for expanding Bike Share and bike lanes, improving the TTC, reclaiming sidewalks for pedestrians, and meticulously parsing city spending and contracting practices.' WHERE slug = 'toronto-keenan-courtis' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-11-university-rosedale');

-- Laura Dean (Mayor, Toronto)
UPDATE candidates SET bio = 'Laura Dean is a Toronto mayoral candidate (lauradeanformayor.ca). In her own written campaign statement she roots food insecurity in precarious employment, stagnant wages and inadequate social assistance, and proposes scaling up urban agriculture, community gardens, greenhouses and community-run markets. She took part in a grassroots mayoral debate at Fairview Library on Oct 6, 2026.' WHERE slug = 'toronto-laura-dean' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Logan Choy (Mayor, Toronto)
UPDATE candidates SET bio = 'Logan Choy is a Toronto mayoral candidate. He told the Toronto Business Journal that ''Torontonians are tired of a three-way debate that reads like an elite policy echo chamber,'' arguing that real people are being priced out of their neighbourhoods while the frontrunners trade barbs over debt restructuring. His own questionnaire answers name liberty and freedom, public communication about Toronto, and alternative dispute resolution as themes.' WHERE slug = 'toronto-logan-choy' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Michael Lamoureux (Mayor, Toronto)
UPDATE candidates SET bio = 'Michael Lamoureux is a Toronto mayoral candidate running on “Building a better future” with six priorities: transit, housing, traffic, customer service, homelessness and city finances. His platform calls for building more subways, making the TTC free, reducing housing costs by cutting demand, guaranteeing two lanes of car traffic on all arterial roads at all times, and cutting city spending by as much as 15%. He would fund a free TTC through higher parking fees and a flat per-household TTC service fee, and replace tent encampments with serviced camper-trailer parks.' WHERE slug = 'toronto-michael-lamoureux' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Mina Nadimi (Councillor - Ward 12 (Toronto-St. Paul's), Toronto)
UPDATE candidates SET bio = 'Mina Nadimi is a Ward 12 (Toronto-St. Paul''s) council candidate who answered Build Canada''s 2026 Toronto election questionnaire. In her answers she supports permitting substantially more housing as-of-right in every ward, with more apartments and multiplexes in nearly every neighbourhood, and says the city''s primary role should be to build, acquire and own significantly more housing. She also backs road pricing with revenue dedicated to transportation, expanding the protected cycling network, and would prioritize state-of-good-repair work for the next available transit funding.' WHERE slug = 'toronto-mina-nadimi' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-12-toronto-st-paul-s');

-- Mohamad Kaaki (Mayor, Toronto)
UPDATE candidates SET bio = 'Mohamad Kaaki is a Toronto mayoral candidate. In his own written statement he says ''fighting poverty starts with real solutions: affordable housing for newcomers, free training, and faster pathways into jobs that match their skills,'' adding that engineers, doctors, nurses and other professionals deserve a fair path to work and contribute. He also backed the No Demovictions tenant group''s six housing priorities.' WHERE slug = 'toronto-mohamad-kaaki' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Mohammad Shabani (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'Mohammad Shabani is a Ward 19 (Beaches-East York) council candidate involved in community outreach with the Taylor-Massey Resident Wellness Council. His platform proposes a ''Vienna Model'' in which the city acts as the developer of affordable housing on public land, alongside walkable ''15-minute'' neighbourhoods. He also proposes a ''Don Valley Crosstown'' transit line and rush-hour downtown driving fees to fund transit.' WHERE slug = 'toronto-mohammad-shabani' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Nate Erskine-Smith (Councillor - Ward 19 (Beaches-East York), Toronto)
UPDATE candidates SET bio = 'Nate Erskine-Smith is running to represent Ward 19 Beaches-East York as City Councillor; he previously served a decade as the area''s Liberal MP, including a stint as federal Minister of Housing, and says he trusts Mayor Chow''s leadership and wants to collaborate with her at City Hall.' WHERE slug = 'toronto-nate-erskine-smith' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-19-beaches-east-york');

-- Odessa Paloma Parker (Mayor, Toronto)
UPDATE candidates SET bio = 'Odessa Paloma Parker is a Toronto mayoral candidate. Her campaign is built on a ‘FRESH’ framework: Fiscal Rehabilitation & Growth, Recreation As A Priority, Environmental Action & Future-proofing The City, Safe & Healthy Communities, and Housing For All. She has hosted ‘Building Brand Toronto’ panel discussions on how the city and Torontonians can support the local cultural sector, including a visual arts panel with local artists.' WHERE slug = 'toronto-odessa-paloma-parker' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Olivia Chow (Mayor, Toronto)
UPDATE candidates SET bio = 'Olivia Chow is the incumbent Mayor of Toronto, previously serving as a school trustee, city councillor and Member of Parliament.' WHERE slug = 'toronto-olivia-chow' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Robert Shusterman (Mayor, Toronto)
UPDATE candidates SET bio = 'Robert Shusterman is a Toronto realtor with Royal LePage Terrequity Realty running for mayor. He also ran in the 2023 Toronto mayoral by-election. In his own questionnaire answers he calls for more housing for people with mental illness, more police officers to address slow 911 response times, tolls during heavy congestion, and more subway lines.' WHERE slug = 'toronto-robert-shusterman' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Roberto Curto (Mayor, Toronto)
UPDATE candidates SET bio = 'Roberto Curto is a Toronto mayoral candidate who describes himself as a planner. In his own questionnaire answers he says he is ''weary of identical built forms everywhere,'' supports missing-middle and gentle density that preserves neighbourhood character, and wants new public-safety investment directed to civilian crisis services rather than across-the-board police expansion.' WHERE slug = 'toronto-roberto-curto' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-mayor');

-- Sheena Sharp (Councillor - Ward 15 (Don Valley West), Toronto)
UPDATE candidates SET bio = 'Sheena Sharp is an environmental activist running for council in Ward 15 (Don Valley West). Her platform centres on Toronto''s climate targets — net-zero by 2040, including electrifying the city''s buildings within 15 years — alongside housing, ranked-ballot voting reform, and making sure police spending goes to things experts know reduce crime.' WHERE slug = 'toronto-sheena-sharp' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-15-don-valley-west');

-- Susan Chapelle (Councillor - Ward 14 (Toronto-Danforth), Toronto)
UPDATE candidates SET bio = 'Susan Chapelle, eMBA, RMT, is a former municipal councillor running for council in Ward 14 (Toronto-Danforth). On her campaign site she says she built partnerships between local government and public health, worked to bring a health lens to the Official Community Plan, and is bringing experience in government, healthcare, research, technology, small business and community leadership back to the ward.' WHERE slug = 'toronto-susan-chapelle' AND race_id = (SELECT id FROM races WHERE slug = 'toronto-councillor-ward-14-toronto-danforth');

-- Alex Nascimben (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Alex Nascimben is a master electrician and community volunteer who has lived in Vaughan for more than 30 years. His volunteer work includes the Shining Through Centre for Children with Autism, Waves of Change for Autism, Hospice Vaughan, Strides for Seniors, and the Vaughan Food Bank.' WHERE slug = 'vaughan-alex-nascimben' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Alireza Siadatan (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Dr. Alireza Siadatan holds a PhD in Electrical Engineering and is a licensed Professional Engineer in Ontario and the U.S. He has more than 20 years of engineering, leadership, research and university teaching experience, including at the University of Toronto, York University''s Lassonde School of Engineering, and Lakehead University.' WHERE slug = 'vaughan-alireza-siadatan' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Deven Sandhu (Ward 4 Councillor (Concord/Thornhill), Vaughan)
UPDATE candidates SET bio = 'Deven Sandhu holds a PhD and an MBA and is a 2022 recipient of the Order of Vaughan. He brings 25+ years of community, executive and governance leadership, including as Chair of the Vaughan Public Library Board and service on Vaughan''s Governance Committee, provincial health tribunals, and the Ontario Science Centre Board. He has lived in his Ward 4 community for over fifteen years.' WHERE slug = 'vaughan-deven-sandhu' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-ward-4-councillor-concord-thornhill');

-- Fitz Roy Gordon (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Fitz-Roy Gordon has lived in Vaughan for over 22 years. He is a former teacher, administrator and football player, a husband and father, and comes from an immigrant family of skilled workers, electricians, builders and construction workers.' WHERE slug = 'vaughan-fitz-roy-gordon' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Linda D Jackson (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Linda Jackson is Vaughan''s Deputy Mayor and a long-serving member of Vaughan and York Region Councils, seeking re-election as one of four Local and Regional Councillors elected at large. Her campaign site centres on smart, responsible growth: building infrastructure ahead of development, offering housing choice, and making transparent planning decisions that protect Vaughan''s quality of life.' WHERE slug = 'vaughan-linda-d-jackson' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Mandy Rai (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Mandy Rai was raised in Vaughan and holds a Bachelor of Laws from The City Law School (now City St George''s, University of London) and a Master of Laws from Osgoode Hall Law School. She has experience in law, compliance, community engagement and volunteer service, including with Girl Guides of Canada.' WHERE slug = 'vaughan-mandy-rai' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Mario G Racco (Local and Regional Councillor (four elected at large), Vaughan)
UPDATE candidates SET bio = 'Mario Racco is the incumbent Local and Regional Councillor for Vaughan, seeking re-election. He describes over forty years of public service combining an accounting and legal background, and previously served as the Liberal MPP for Thornhill (2003–2007).' WHERE slug = 'vaughan-mario-g-racco' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-local-and-regional-councillor-four-elected-at-large');

-- Shelly-Ann Starlette Cerrelli (Mayor, Vaughan)
UPDATE candidates SET bio = 'Shelly-Ann Cerrelli is an entrepreneur, business and wealth strategist, founder and investor with more than two decades of business experience spanning real estate, technology and telecommunications. A Jamaican immigrant, wife, mother of five and grandmother, she is running to bring transparency, accountability and resident-focused leadership to City Hall.' WHERE slug = 'vaughan-shelly-ann-starlette-cerrelli' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-mayor');

-- Steven Del Duca (Mayor, Vaughan)
UPDATE candidates SET bio = 'Steven Del Duca has served as Mayor of Vaughan since October 2022 and is seeking re-election. He previously served as Ontario''s Minister of Transportation and Minister of Economic Development and Growth, as MPP for Vaughan from 2012 to 2018, and as leader of a major Ontario political party from 2020 to 2022. He and his family call Vaughan home.' WHERE slug = 'vaughan-steven-del-duca' AND race_id = (SELECT id FROM races WHERE slug = 'vaughan-mayor');

-- Dorothy MCCABE (Mayor, Waterloo)
UPDATE candidates SET bio = 'Dorothy McCabe was elected Mayor of Waterloo in 2022 and has spent more than two decades bringing governments, businesses, institutions and communities together to solve difficult problems. Since becoming Mayor she has focused on decisions shaping Waterloo for years to come, from housing and healthcare to economic growth, neighbourhoods and public spaces.' WHERE slug = 'waterloo-dorothy-mccabe' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-mayor');

-- Jamie Hari (Mayor, Waterloo)
UPDATE candidates SET bio = 'Jamie Hari is running for Mayor of Waterloo. A Waterloo resident of 20+ years (partner of 22 years; son attending Wilfrid Laurier), he works as a Director of Product Management and describes himself as a ''Cybersecurity Evangelist'' and public speaker who ''founded the Marvel Database.'' Politically he identifies as a socialist, ran as an independent in the 2025 federal election, and endorses Mike Morrice for Green Party leader. His site says: ''This election isn''t about me, but you still need to know who you''re voting for.''' WHERE slug = 'waterloo-jamie-hari' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-mayor');

-- Jerry JIANG (Mayor, Waterloo)
UPDATE candidates SET bio = 'Jerry Jiang founded Akatos, a Waterloo startup community and hacker house for young builders. His stated role is to help people clarify what they are making, remove blockers, connect them with opportunities, and let them build.' WHERE slug = 'waterloo-jerry-jiang' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-mayor');

-- Jeyas BALASKANTHAN (Mayor, Waterloo)
UPDATE candidates SET bio = 'Jeyas Balaskanthan moved to Waterloo in 1997 to attend Wilfrid Laurier University, held leadership positions at Laurier and the University of Waterloo from 2001 to 2022, and has been Executive Director of the Uptown Waterloo Business Improvement Area since 2022.' WHERE slug = 'waterloo-jeyas-balaskanthan' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-mayor');

-- Jim Erb (Regional councillor, Waterloo)
UPDATE candidates SET bio = 'Jim Erb is the incumbent Regional Councillor for Waterloo, seeking re-election. A lifelong Waterloo Region resident, he was first elected to Regional Council in 2018 and previously served eight years on Waterloo City Council. He is a small business owner and community volunteer.' WHERE slug = 'waterloo-jim-erb' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-regional-councillor');

-- Lindsay Manary (Regional councillor, Waterloo)
UPDATE candidates SET bio = 'Lindsay Manary is a candidate for Regional Councillor in Waterloo. She is endorsed by CUPE 1883, having pledged in the union''s candidate survey to protect public services, oppose water privatization, and stand up for worker rights.' WHERE slug = 'waterloo-lindsay-manary' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-regional-councillor');

-- Shannon WEBER (Mayor, Waterloo)
UPDATE candidates SET bio = 'Shannon Weber is running for Mayor of Waterloo, having come within 331 votes of winning in 2022. She brings 30+ years in municipal, non-profit, higher education and financial services sectors, including Executive Director and Chief of Staff roles, plus an MBA from Laurier and HBA Economics from Waterloo. She served on Waterloo''s Economic Development Advisory, Neighbourhood Strategy and Town & Gown committees and volunteered with the Waterloo Ravens, House of Friendship and Junior Achievement; she is raising her family in Waterloo.' WHERE slug = 'waterloo-shannon-weber' AND race_id = (SELECT id FROM races WHERE slug = 'waterloo-mayor');

-- Kristopher Wilkinson (Mayor, Wilmot)
UPDATE candidates SET bio = 'Kris Wilkinson is the incumbent Ward 2 councillor for Wilmot Township, running for Mayor after one term on council. His campaign centres on tying tax increases to inflation, managing growth, a long-term capital plan, and greater transparency and communication with residents.' WHERE slug = 'wilmot-kristopher-wilkinson' AND race_id = (SELECT id FROM races WHERE slug = 'wilmot-mayor');

-- Natasha Salonen (Mayor, Wilmot)
UPDATE candidates SET bio = 'Born and raised in Wilmot, where she lives with her family. Incumbent Mayor of the Township of Wilmot, seeking re-election for the 2026-2030 term, citing four years rebuilding the Township''s financial and organizational foundations.' WHERE slug = 'wilmot-natasha-salonen' AND race_id = (SELECT id FROM races WHERE slug = 'wilmot-mayor');

-- Stephanie Goertz (Mayor, Wilmot)
UPDATE candidates SET bio = 'Founder and President of the Board of Grassroots Response to the Ukrainian Crisis (2022-present), a Wilmot-based not-for-profit that housed 1,900+ people; small business owner; 2024 Wilmot Citizen of the Year; 2025 winner of the Sybil Frenette Visionary Housing Creator Award.' WHERE slug = 'wilmot-stephanie-goertz' AND race_id = (SELECT id FROM races WHERE slug = 'wilmot-mayor');

-- Acton Ken (Ward 5 Councillor, Windsor)
UPDATE candidates SET bio = 'Acton Ken is a third-generation Ward 5 resident whose career has spanned education, architecture, the labour movement, community building and housing; he lives on the same street he grew up on. He is running on a housing-crisis platform: well-designed, safe, energy-efficient homes at varying prices, with in-fill development planned so it does not displace long-term working-class residents.' WHERE slug = 'windsor-acton-ken' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-5');

-- Danyluk Benjamin (Mayor, Windsor)
UPDATE candidates SET bio = 'Danyluk Benjamin is running for Mayor of Windsor. He has proposed moving homeless residents out of downtown and repurposing abandoned schools as service hubs for people experiencing homelessness.' WHERE slug = 'windsor-danyluk-benjamin' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- DILKENS, Drew (Mayor, Windsor)
UPDATE candidates SET bio = 'Drew Dilkens is the incumbent Mayor of Windsor, first elected in 2014 and seeking a fourth term on October 26. His campaign record centres on economic growth, large infrastructure investment and relatively restrained property-tax increases, with this term''s platform emphasizing a 2,500-job target, more homes and downtown renewal.' WHERE slug = 'windsor-dilkens-drew' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Fathers Frazier (Ward 2 Councillor, Windsor)
UPDATE candidates SET bio = 'Fathers Frazier is an affordable housing consultant with master''s degrees in Public Policy and Political Science, and over a decade in community development, affordable housing and social policy. A West Windsor resident for over 15 years, he is running for Ward 2 on addressing interconnected affordability, housing, transit, parks and safety challenges.' WHERE slug = 'windsor-fathers-frazier' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-2');

-- FRANCIS, Fred (Mayor, Windsor)
UPDATE candidates SET bio = 'Fred Francis is a three-term Ward 1 councillor — and the younger brother of former mayor Eddie Francis — now running for Mayor of Windsor. Born in Windsor in 1980 to Lebanese-immigrant parents, he holds a Western University BA in history and political science, a University of Windsor MA in history and a BEd. Before municipal politics he was Director of Business Development for one of the region''s largest automotive retailer groups and now serves as Executive Director of the Multicultural Council of Windsor and Essex County; he lives in South Windsor with his wife and daughter.' WHERE slug = 'windsor-francis-fred' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Dylon Graves (Mayor, Windsor)
UPDATE candidates SET bio = 'Dylon Graves is running for Mayor of Windsor on a housing-first homelessness platform. His campaign site argues Windsor''s abandoned spaces should be converted into large-scale temporary housing that could later become regular rentals, presenting housing as the first step in a chain toward recovery and workforce reintegration.' WHERE slug = 'windsor-graves-dylon' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Tara Grayer (Mayor, Windsor)
UPDATE candidates SET bio = 'Grayer Tara is running for Mayor of Windsor on a platform centred on three homelessness goals: identifying individual needs, removing housing obstacles, and ensuring funding reaches recipients.' WHERE slug = 'windsor-grayer-tara' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Guttmann Geoffrey D (Ward 1 Councillor, Windsor)
UPDATE candidates SET bio = 'Guttmann Geoffrey D is a retired professor of medical and dental anatomy and physiology who helped establish three medical schools and one dental school in Canada, the U.S. and the U.K. A Windsor resident for over 20 years, married with two adult children, he is running for Ward 1 on performance standards for new housing to ensure safe, energy-efficient, affordable homes.' WHERE slug = 'windsor-guttmann-geoffrey-d' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-1');

-- Kolasky Nick (Mayor, Windsor)
UPDATE candidates SET bio = 'Kolasky Nick is a retired businessman running for Mayor of Windsor; he ran a manufacturing company for 23 years and studied Commerce at the University of Toronto. A 16-year downtown-core resident whose passions are travel and photography, he says homelessness has been his priority across three campaigns (including a provincial Green run), favouring permanent small-homes housing over overnight shelters.' WHERE slug = 'windsor-kolasky-nick' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Marier Denis (Ward 6 Councillor, Windsor)
UPDATE candidates SET bio = 'Marier Denis has nearly thirty years of background in naturopathic healthcare, teaching, international relief work and public-interest governance. He returned permanently to Windsor in 2020 and settled in Riverside in 2024 to care for his parents; he is running for Ward 6 on expanding affordable and supportive housing, measuring success by whether people obtain and retain stable housing.' WHERE slug = 'windsor-marier-denis' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-6');

-- Morencie Tristan Ty (Mayor, Windsor)
UPDATE candidates SET bio = 'Morencie Tristan Ty is running for Mayor of Windsor. He has said he would restore a 1950s-style housing market affordable to middle-class families.' WHERE slug = 'windsor-morencie-tristan-ty' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Munim Hiral (Ward 6 Councillor, Windsor)
UPDATE candidates SET bio = 'Munim Hiral is a self-described serial entrepreneur and mother who studied Electronics Engineering in India and moved to Canada two decades ago, leading ventures in several provinces before settling in East Riverside (Ward 6). She is running on safe neighbourhoods — high-visibility crosswalks, speed bumps and foot patrols — plus more downtown events and housing.' WHERE slug = 'windsor-munim-hiral' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-6');

-- Kat Pasquach (Mayor, Windsor)
UPDATE candidates SET bio = 'Kat Pasquach is running for Mayor of Windsor on a platform of a 0% property tax increase in her first year, making Windsor the easiest Ontario city to start and grow a business, treating housing as a human right, and bringing back the Tunnel Bus.' WHERE slug = 'windsor-pasquach-kat' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Potvin Shane (Ward 5 Councillor, Windsor)
UPDATE candidates SET bio = 'Potvin Shane is an entrepreneur, Creative Director of design studio Spotvin, and owner of the CO:Workshare co-working space on Drouillard Road. As President of the Ford City BIA for over nine years, he points to crime reduction and business growth on Drouillard Road as a model for downtown revitalization; he is running for Ward 5 on density, arts and culture investment, and Vision Zero road safety.' WHERE slug = 'windsor-potvin-shane' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-5');

-- Saka Khassan (Ward 6 Councillor, Windsor)
UPDATE candidates SET bio = 'Saka Khassan was born in Baghdad and immigrated to Canada in 1994; he is a father of three with 25+ years in public service, international relations and community leadership. He served at the Embassy of Iraq in Canada (2004–2014), founded the Integrative Canadian Group Organization in 2014, and is President and Publisher of The Ambassador Canadian Newspaper; he is running for Ward 6 on safe streets, responsible spending and keeping tax increases below inflation.' WHERE slug = 'windsor-saka-khassan' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-6');

-- Soluade Victoria (Ward 7 Councillor, Windsor)
UPDATE candidates SET bio = 'Soluade Victoria came to Canada from Nigeria in 2006 and made Windsor her home; she is a business owner, immigration consultant and part-time Political Science student at the University of Windsor. She serves with OPUS and on the board of the Black Council of Windsor-Essex; running for Ward 7, her first priority is more affordable, accessible places for young people to belong.' WHERE slug = 'windsor-soluade-victoria' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-7');

-- Spiliadis Spiro S (Ward 3 Councillor, Windsor)
UPDATE candidates SET bio = 'Spiliadis Spiro S is a management consultant with over 25 years of experience helping businesses turn ideas into results. He is running for Ward 3 promising a systems-thinking approach to council, arguing that housing, homelessness, mental health and public safety are interconnected and need collaborative, measurable solutions.' WHERE slug = 'windsor-spiliadis-spiro-s' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-3');

-- Patrick Sutherland (Mayor, Windsor)
UPDATE candidates SET bio = 'Patrick Sutherland is running for Mayor of Windsor under the theme ''Freedom from Hatred.'' His platform includes introducing the Helsinki Housing First model, never using Strong Mayor powers, a 10% small-business commercial tax cut, riverfront attractions (Ferris wheel, aquarium, museums) and uploading the E.C. Row Expressway to the province.' WHERE slug = 'windsor-sutherland-patrick' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Vaupotic Louis (Mayor, Windsor)
UPDATE candidates SET bio = 'Vaupotic Louis is a Windsor dentist (Hon. BSc, DDS) running for Mayor of Windsor; he is a father of four. His signature proposal is a multimodal international transportation hub — a gondola, vertiport and ferry system linking Windsor and Detroit — which he argues would revitalize downtown and the whole city.' WHERE slug = 'windsor-vaupotic-louis' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-mayor');

-- Zaid Rasha (Ward 4 Councillor, Windsor)
UPDATE candidates SET bio = 'Zaid Rasha is a mother, educator, small-business owner and community organizer who has called Ward 4 home for 26 years; she holds multiple postsecondary qualifications and is completing a Master''s in Educational Leadership. She is running on a Housing First approach to homelessness, safer streets, and monthly community meetings to strengthen council accountability.' WHERE slug = 'windsor-zaid-rasha' AND race_id = (SELECT id FROM races WHERE slug = 'windsor-councillor-ward-4');

commit;

-- verify: expect 172
SELECT count(*) AS expansion_bios_applied
FROM candidates c JOIN races r ON r.id = c.race_id
WHERE c.bio IS NOT NULL AND r.municipality_id IN
      (SELECT id FROM municipalities WHERE slug <> 'british-columbia' AND slug <> 'huntsville');