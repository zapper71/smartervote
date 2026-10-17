-- =====================================================================
-- SmarterVote.ca — candidate bios, REVIEW-STAGED (not a numbered migration)
--
-- These 96 bios are still in Andreas's review spreadsheet. Do NOT add this
-- file to RUN_ORDER.md and do NOT run it until he approves each bio.
-- When approved, run the UPDATEs below, then delete this file's remaining
-- rows or the whole file.
--
-- Each UPDATE matches by candidate slug. Slugs flagged AMBIGUOUS below are
-- shared by more than one candidate in the same municipality (same name in
-- different races) — resolve those by hand before running.
-- =====================================================================

begin;

-- Rick Maloney (Mayor, Bracebridge)
update candidates set bio = 'Incumbent Mayor of Bracebridge seeking re-election. Serves on the Town of Bracebridge council and is running for another term as mayor.' where slug = 'bracebridge-rick-maloney';

-- Christian McEachran Morin (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Family moved to Muskoka permanently in 2002; he has taken a more active role since 2022 in protecting Muskoka for future generations. Rooted in Muskoka going back five generations, raising his family in Bracebridge. Attended the Dec 7, 2023 District Committee of the Whole as a member of the public and secured a motion to create a climate reserve fund.' where slug = 'bracebridge-christian-mceachran-morin';

-- Brenda Rhodes (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Has served the past four years as Deputy Mayor and Town and District Councillor for Bracebridge.' where slug = 'bracebridge-brenda-rhodes';

-- Don Smith (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Since graduating from BMLSS has built a Muskoka career as a journalist, publisher and retailer. Rotarian for over 40 years and volunteer with numerous groups. Previously elected as councillor.' where slug = 'bracebridge-don-smith';

-- Tatiana Sutherland (District Councillor, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Bracebridge is home to three generations of her family; she is raising her eight-year-old daughter there while her parents and mother-in-law are seniors in the community. Works in Muskoka''s tourism sector and serves as Chair of the Muskoka Community Land Trust.' where slug = 'bracebridge-tatiana-sutherland';

-- Debbie Vernon (Councillor - Ward 1 (Bracebridge), Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Born in Bracebridge and a BMLSS graduate. Assisted people with disabilities moving from institutions to home communities; obtained real estate license in 1999. Has made her home of 34 years on the Muskoka River; family farm roots near Port Carling on Lake Rosseau dating to the late 1800s.' where slug = 'bracebridge-debbie-vernon';

-- Donna Kearney (Councillor - Ward 3 (Macaulay), Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'A pioneering Nurse Practitioner with a 30-year healthcare career in Muskoka. Secured public and political funding for the Rosseau Nursing Station, five rural Health Hubs and Hospice Muskoka-Andy''s House. Has lived in Macaulay Ward for over 30 years and is retiring from the healthcare system.' where slug = 'bracebridge-donna-kearney';

-- Laura Craig (Councillor - Ward 4 (Draper), Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Has run the Muskoka General store+refillery in Draper Ward for the past three years, getting to know neighbours, families and local business owners.' where slug = 'bracebridge-laura-craig';

-- Cindy Waters (Councillor - Ward 4 (Draper), Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Deep roots in Draper, though now living in the town of Bracebridge. Retired in 2024 after a healthcare career including close to 14 years at South Muskoka Memorial Hospital; gathered more than 14,000 signatures on a Care Close to Home hospital petition.' where slug = 'bracebridge-cindy-waters';

-- Sandy Inkster (School Board Trustee - TLDSB, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Based in Bracebridge for employment with agencies since 1989, supporting families from prenatal classes through students'' school careers. Worked in partnership with TLDSB for over 30 years on initiatives and professional development; family members are educators.' where slug = 'bracebridge-sandy-inkster';

-- Richard Struthers (School Board Trustee - TLDSB, Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'For forty years was CEO of a manufacturing company, 15 of those years in Bracebridge. Wife was a teacher for 40 years; son and he included education in their university studies.' where slug = 'bracebridge-richard-struthers';

-- Donald Blais (School Board Trustee - MonAvenir (Simcoe-Muskoka), Bracebridge) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Married for 32 years, father of two. Telecommunications entrepreneur for 29 years specializing in fiber optics. Volunteered 13 years with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie. Has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' where slug = 'bracebridge-donald-blais';

-- Patrick Brown (Mayor, Brampton)
update candidates set bio = 'Mayor of Brampton since 2018, running for a third term under the theme ''Keep Building Brampton''s Future.'' His campaign centres on delivering $9.4 billion in transformational investments now underway across healthcare, transit, recreation, public safety and community infrastructure, which he attributes to years of advocacy at Queen''s Park and Parliament Hill.' where slug = 'brampton-patrick-brown';

-- Paul Tarriwal (Mayor, Brampton)
update candidates set bio = 'Brampton resident for 40+ years; 22 years in Brampton real estate (RECO registered); a father and, in his words, ''not a career politician.'' Says 22 years of negotiating transactions and following through on commitments shaped how he thinks government should work: set clear priorities, make responsible decisions, respect people''s money, finish what you start.' where slug = 'brampton-paul-tarriwal';

-- Sandeep Somal (Mayor, Brampton)
update candidates set bio = 'Born and raised in Brampton; works in the non-profit sector and founded a hockey club for low-income and racialized youth. Says he has worked actively in the community across non-profit spaces focused on supporting youth and families, and is running to make city government more responsive, efficient and focused on families and youth.' where slug = 'brampton-sandeep-somal';

-- Wesley Jackson (Mayor, Brampton)
update candidates set bio = 'Grew up in Brampton''s Heart Lake community, where his family lived in social housing. A lawyer and small-business owner whose law practice helps Brampton families buy homes and plan for the future. First ran for mayor in 2018 as an independent voice for integrity and practical results. Husband, father, photographer and longtime cyclist who has raised funds for cancer research through the Ride to Conquer Cancer; holds live town halls every Tuesday.' where slug = 'brampton-wesley-jackson';

-- Prabh Gill (Mayor, Brampton)
update candidates set bio = 'Arbitrator and certified divorce and separation coach; volunteers with International Mediation Beyond Borders (a UN-affiliated peacebuilding organization); former community ambassador with Peel Regional Police. Father of two from a middle-class family who describes himself as ''a problem solver before a politician.''' where slug = 'brampton-prabh-gill';

-- Jagruti Bhatt (Mayor, Brampton)
update candidates set bio = 'Entrepreneur and mayoral candidate campaigning on affordability (''My home. My Brampton. My sanctuary.''); runs the campaign site flowercitybrampton.ca and publishes a weekly guest column on Brampton issues. Says municipal government should protect taxpayers, respect homeowners and support businesses while remembering ''behind every tax bill is a family working hard to pay it.''' where slug = 'brampton-jagruti-bhatt';

-- Peter Koetsier (Mayor, Georgian Bay)
update candidates set bio = 'Mayor of the Township of Georgian Bay for eight years; previously a District Councillor for eight years including five as Chair of the Finance Committee. Spent 29 years with an international manufacturing company based in Barrie (Comptroller, VP Administration, Senior VP Strategic Planning). Board service: Georgian Bay Association, Georgian Bay Land Trust (treasurer), Georgian Bay Mnidoo Gamii Biosphere (treasurer), Honey Harbour Association (president), Simcoe Muskoka Health Unit. Georgian Bay cottager since 1971.' where slug = 'georgian-bay-peter-koetsier';

-- Laurie Russell (District Councillor - Wards 1 and 3, Georgian Bay) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'More than 20 years of senior international business leadership plus seven years of elected volunteer community leadership, including consecutive terms as president. Experience in budgeting, governance, infrastructure planning and evidence-based decision-making.' where slug = 'georgian-bay-laurie-russell';

-- Steven Predko (Councillor - Ward 1, Georgian Bay) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Connected to Georgian Bay since the 1970s as a camper on Beausoleil Island; family purchased property on Go Home Lake in 2009. Director of the Go Home Lake Cottage Owners'' Association since 2011 (memberships, website, communications, social media, advertising, merchandise). 30-year career as a senior technology executive and consultant across financial services, government and broadcasting. Runs Trailhead Designs, a craft business making custom laser-cut maps.' where slug = 'georgian-bay-steven-predko';

-- Allan Hazelton (Councillor - Ward 4, Georgian Bay) -- AMBIGUOUS SLUG, resolve by hand
update candidates set bio = 'Councillor for Ward 4 since 2018. Board member of the Georgian Bay Township Public Library; board member and chair of the Planning Committee; member of the GBA Coastal Protection Advisory Committee, the GBA Floating Cottage Advisory Group and the Township Water Quality Monitoring Working Group. Has done water quality sampling and testing for several years.' where slug = 'georgian-bay-allan-hazelton';

-- Donald Blais (School Board Trustee - MonAvenir (French Separate), Georgian Bay)
update candidates set bio = 'Married for 32 years, father of two. Telecommunications entrepreneur for 29 years specializing in fiber optics. Volunteered 13 years with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie. Has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' where slug = 'georgian-bay-donald-blais';

-- Jeff Watson (Mayor, Gravenhurst)
update candidates set bio = 'Gravenhurst resident for more than 35 years. Owned and operated both Gravenhurst Tim Hortons locations for 32 years. Served three terms on Gravenhurst Council, including as Deputy Mayor (2010-2018). Served eight years with the Gravenhurst Fire Department as firefighter, Captain and Training Officer; graduate of the Ontario Fire College. Currently serves on the Board of the South Muskoka Hospital Foundation; past boards include Gravenhurst Hydro, Chamber of Commerce and Muskoka Tourism.' where slug = 'gravenhurst-jeff-watson';

-- Larry Brassard (Councillor - Ward 3, Gravenhurst)
update candidates set bio = 'Resident of Ward 3 since 2012. Career firefighter (44 years) and police officer (20 years); served as Fire Chief in Gravenhurst from 2012 through 2021, serving on the Town''s Senior Management Team building corporate budgets. Volunteer with Team Rubicon, Samaritan''s Purse and Boots on the Ground; strong advocate for the homeless. Board experience includes the Ontario Association of Fire Chiefs, Crimestoppers and CMHA Muskoka/Parry Sound.' where slug = 'gravenhurst-larry-brassard';

-- Stephen Sims (Councillor - Ward 2, Gravenhurst)
update candidates set bio = 'Full-time Ward 2 resident for 10 years; five generations of Sims family in Gravenhurst (grandparents bought property in 1932). PhD in neuroscience (McMaster); professor of Medicine and Dentistry at Western University for 29 years. Volunteer water quality sampler for the Muskoka Lakes Association for more than 20 years; president of the Lakeshore Drive Community Association (2013-present); former MLA board member; Gravenhurst Committee of Adjustment member since 2022.' where slug = 'gravenhurst-stephen-sims';

-- Sasha Austin (Mayor, Hamilton)
update candidates set bio = 'Sasha Austin is a lifelong Hamilton resident and an Indigenous Patient Navigator at the De Dwa Da Dehs-Nyes Indigenous Health Centre, with experience in grant writing, healthcare, outreach, public administration and social services. In her candidate-submitted profile she describes a life of frontline advocacy and fiscal watchdog work.' where slug = 'hamilton-sasha-austin';

-- Rob Cooper (Mayor, Hamilton)
update candidates set bio = 'Rob Cooper was born and raised in Hamilton and launched his career with Ernst & Young. A chartered professional accountant, he won the Ward 8 council by-election in September 2025 and is running for mayor on a platform of capping taxes and public safety.' where slug = 'hamilton-rob-cooper';

-- Scarlett Gillespie (Mayor, Hamilton)
update candidates set bio = 'Scarlett Gillespie is a community organizer and activist, and the Executive Director of the Sex Workers'' Action Program (SWAP) Hamilton, where she advocates for the safety and dignity of marginalized residents. Her leadership was recognized with the 2024 YWCA Hamilton Woman of Distinction Award for her work on trans rights, housing security and social justice. She has fought for tenant protections and infrastructure maintenance at CityHousing Hamilton and advocates for climate justice and transparency in local government.' where slug = 'hamilton-scarlett-gillespie';

-- Andrea Horwath (Mayor, Hamilton)
update candidates set bio = 'Andrea Horwath is the Mayor of Hamilton (2022-present), previously Leader of the Ontario New Democratic Party (2009-2022), MPP for Hamilton Centre (2004-2022), and Ward 2 city councillor (1997-2004). She narrowly won the 2022 mayoral race over Keanin Loomis.' where slug = 'hamilton-andrea-horwath';

-- Keanin Loomis (Mayor, Hamilton)
update candidates set bio = 'Keanin Loomis is a husband, father of three, business leader and community builder who has called Hamilton home since 2009. He was the founding Chief Operating Officer of Innovation Factory (2010-2013) and President & CEO of the Hamilton Chamber of Commerce (2013-2022), then Vice President Member Services at the Ontario Chamber of Commerce and President & CEO of the Canadian Institute of Steel Construction. He was runner-up in the 2022 Hamilton mayoral election.' where slug = 'hamilton-keanin-loomis';

-- Nathalie Xian Yi Yan (Mayor, Hamilton)
update candidates set bio = 'Nathalie Xian Yi Yan is a traditional Chinese medicine practitioner and perennial candidate in Hamilton municipal elections.' where slug = 'hamilton-nathalie-xian-yi-yan';

-- Berry Vrbanovic (Mayor, Kitchener)
update candidates set bio = 'Berry Vrbanovic has served as Mayor of Kitchener since 2014. His 2026 State of the City theme is ''Made in Kitchener'', reflecting an approach of developing solutions locally and working across sectors to deliver results for residents.' where slug = 'kitchener-berry-vrbanovic';

-- George Trihenea (Mayor, Kitchener)
update candidates set bio = 'George Trihenea is an entrepreneur and business owner with over 20 years of leadership experience who has built local businesses and created jobs. He served on Kitchener''s Downtown Action Advisory Committee, working with local organizations to strengthen the city.' where slug = 'kitchener-george-trihenea';

-- David Alton (Mayor, Kitchener)
update candidates set bio = 'David Alton is a Kitchener-based homelessness and housing advocate who hosted the Right to Housing town hall (July 25, 2026, Chandler Mowat Community Centre) and the Right to Belong town hall (June 20, 2026, Victoria Hills Community Centre), which produced his mayoral platform.' where slug = 'kitchener-david-alton';

-- Manikantan Nair (Mayor, Kitchener)
update candidates set bio = 'Manikantan Nair is a long-time Kitchener resident who has lived in Canada for 25 years and is running on making Kitchener ''one of the best cities in the world'' through ambitious, data-driven leadership.' where slug = 'kitchener-manikantan-nair';

-- Charles Cooper (Mayor, Lake of Bays)
update candidates set bio = 'Community builder, business owner, avid volunteer and cottager. Technology and business background. Has chaired the finance and audit committee (One Kids Place), chaired the Board of Peel Senior Link, been president of his lakes cottagers association and co-founded the Dwight food bank. Sat on the City of Mississauga environmental sub-committee. Volunteer with Ontario Track3 since 1997, introducing the program locally in 2022 for disabled children to enjoy alpine skiing. Appointed to the Ontario Trillium Foundation reviewing local charity grants.' where slug = 'lake-of-bays-charles-cooper';

-- Tim Withey (Mayor, Lake of Bays)
update candidates set bio = 'Called Huntsville home for over 38 years, lived in Baysville for the past year, recently purchased a home in Hillside, Lake of Bays. Founder and owner of Withey Insurance Brokers Ltd. in Huntsville. Holds a BA in Environmental Studies. Served two terms on Huntsville Council, including as Chair of Community Services and Corporate Services, and on District Council''s Health Services Committee. Director with Huntsville District Memorial Hospital, Fairvern Nursing Home, Muskoka Algonquin Healthcare (Vice Chair), Algonquin Grace Hospice, Chamber of Commerce and Crimestoppers. President of the Algonquin Park Residents Association.' where slug = 'lake-of-bays-tim-withey';

-- Matt Young (Mayor, Lake of Bays)
update candidates set bio = 'Raised in Lake of Bays. Has served 20 years with the Lake of Bays Fire Department, currently as Station Chief. Operates three local businesses: SPY Communications, Algonquin Fiber, and MP Planning and Associates.' where slug = 'lake-of-bays-matt-young';

-- John Crowley (District Councillor - Franklin/Sinclair Ward, Lake of Bays)
update candidates set bio = 'Retired paramedic with Metro Toronto Ambulance, retired elementary teacher, and medical logistics coordinator with an air ambulance company. Ran a family farm in Grey County for 20 years with a wholesale produce business. Active in minor sports coaching, teaching and emergency response.' where slug = 'lake-of-bays-john-crowley';

-- Rick Brooks (District Councillor - Franklin/Sinclair Ward, Lake of Bays)
update candidates set bio = '40 years of community service recognized with the Ontario Volunteer Service Award and the Queen''s Diamond Jubilee, plus recognition from organizations including Doors Open, Heritage Port Hope, the Lung Association, Epilepsy Durham, the Salvation Army and Kiwanis International.' where slug = 'lake-of-bays-rick-brooks';

-- Linda Boothby (Councillor - Franklin Ward, Lake of Bays)
update candidates set bio = 'Grew up in Dorset. Began her career as a Tax Collector for the Township of Algonquin Highlands, spending ten years in municipal government with understanding of taxation, zoning bylaws and council procedures. Founded Lake of Bays Garden Centre 25 years ago; took over the Dwight Farmers'' Market five years ago, growing it to about 65 local vendors.' where slug = 'lake-of-bays-linda-boothby';

-- Michael Mahovlich (Councillor - Mclean Ward, Lake of Bays)
update candidates set bio = 'Long-time cottager on Lake Rosseau who now calls Baysville home. Small business owner. Active curler at the Lake of Bays Curling and Bocce club; volunteers at the annual Baysville Surf and Turf charity event.' where slug = 'lake-of-bays-michael-mahovlich';

-- Donald Blais (School Board Trustee - French Language Separate (MonAvenir), Lake of Bays)
update candidates set bio = 'Married for 32 years, father of two. Telecommunications entrepreneur for 29 years specializing in fiber optics. Volunteered 13 years with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie. Has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' where slug = 'lake-of-bays-donald-blais';

-- Josh Morgan (Mayor, London)
update candidates set bio = 'Josh Morgan is seeking re-election as London''s mayor. His campaign says the last four years brought ''real progress'' on housing, revitalized parks and community spaces, office-to-residential conversions and micro-modular shelters, and that the next four years are about ''finishing what we started and being bold enough to do more.'' He was first elected mayor in 2022 with 65.7% of the vote after two terms as Ward 7 councillor (2014-2022).' where slug = 'london-josh-morgan';

-- Susan Stevenson (Mayor, London)
update candidates set bio = 'Susan Stevenson has represented Ward 4 on London city council since 2022. Before municipal politics she was a professional accountant and sales/leadership coach. Married for 36 years, she and her husband have called London home for over 40 years, raised their children here, and built and sold a business in downtown London. On council she served on the Planning and Environment Committee, the Audit Committee (vice-chair), the London Police Service Board and the Middlesex-London Paramedic Service Authority Board.' where slug = 'london-susan-stevenson';

-- Kirsten Krose (Mayor, London)
update candidates set bio = 'Kirsten Krose is a former Stephen Harper staffer (communications assistant in the Prime Minister''s Office) and part of London''s local business community; she owns SWON Public Affairs. Born and raised in London, she brings 20 years as a public servant, political staffer and public affairs consultant, including lobbying, and has worked with BGC, Homes for Heroes and Reforest London.' where slug = 'london-kirsten-krose';

-- Bronagh Morgan (Mayor, London)
update candidates set bio = 'Bronagh Joyce Morgan is a Londoner, lawyer and legal writer, plain-language educator, working artist, small-business owner, and community volunteer. A lawyer since 2000, she works with Wordsmith Communications, a Canadian plain-language firm, teaching municipalities across the country how to communicate with residents clearly. She is the artist behind ''All the Things by Bronagh'' and has spent 25 years in London, including 17 as a casual City of London employee. She is running for one term only, by choice.' where slug = 'london-bronagh-joyce-morgan';

-- Stephen Edgell (Mayor, Markham)
update candidates set bio = 'Stephen Edgell is a Markham mayoral candidate who responds to the Markham Cycles questionnaire as a person who gets around by bicycle. No campaign site with a fuller bio was found; he also addressed the City''s Official Plan through a deputation.' where slug = 'markham-stephen-edgell';

-- Frank Scarpitti (Mayor, Markham)
update candidates set bio = 'Frank Scarpitti has been Mayor of Markham since 2006, first elected to the office that year after serving as Markham Regional Councillor (elected 1985). He joined the 2026 race on the final day of nominations and is seeking another term.' where slug = 'markham-frank-scarpitti';

-- Amanda Yeung Collucci (Regional Councillor, Markham)
update candidates set bio = 'Amanda Yeung Collucci is a three-term Markham councillor (Ward 6) running for Regional Councillor under the theme ''Our Home. Our Future.'', with the endorsement of departing Deputy Mayor Michael Chan.' where slug = 'markham-amanda-yeung-collucci';

-- Bonnie Crombie (Mayor, Mississauga)
update candidates set bio = 'Business leader and experienced public servant; served as Mayor of Mississauga 2014-2024, winning three consecutive city-wide mandates (64%, 77%, 79%). Previously Ward 5 city/regional councillor (2011-2014) and MP for Mississauga-Streetsville (2008-2011); led the Ontario Liberal Party 2023-2026, regaining official party status. Earlier career in senior marketing/public-affairs roles (McDonald''s, Disney, Insurance Bureau of Canada); holds a U of T Honours BA and a Schulich MBA; mother of three and a new grandmother, living in Mississauga nearly three decades.' where slug = 'mississauga-bonnie-crombie';

-- Carolyn Parrish (Mayor, Mississauga)
update candidates set bio = 'Incumbent Mayor of Mississauga, running for re-election on a ''Proven. Leadership.'' record: championed the full-size Avro Arrow replica in Malton''s Paul Coffey Park, backed the School Streets pilot giving kids a car-free street at school pickup, and is pushing Peel service downloads and a fairer Peel police funding split. Daughter of Toronto police Constable Edward Janozeski (37 years of service).' where slug = 'mississauga-carolyn-parrish';

-- Dipika Damerla (Mayor, Mississauga)
update candidates set bio = 'Mississauga City Councillor for Ward 7 (Cooksville) since 2018, running for mayor a second time. As a councillor she pushed for Mobile Crisis Rapid Response Teams on Peel streets, brought motions calling for an independent value-for-money audit of Peel Regional Police, and advocates a Four-Day Pothole Guarantee, clean-parks enforcement and the One Mississauga Dashboard. Holds an MBA in finance (Rotman) and previously worked in corporate banking and ran a small business.' where slug = 'mississauga-dipika-damerla';

-- Alvin Tedjo (Mayor, Mississauga)
update candidates set bio = 'Ward 2 Mississauga city councillor (2022-present) running for mayor on affordability and community safety. His family immigrated to Mississauga when he was four; he and his wife Rebecca are raising their family here. As councillor he says he delivered free transit for children, eased homebuilding, expanded green spaces, dog parks and trails, expanded shelter options, supported food banks, legalized street hockey and voted to lower taxes twice. Sits on city/regional committees including Budget, Planning and Development, Environmental Action and Conservation authorities.' where slug = 'mississauga-alvin-tedjo';

-- Mike Matulewicz (Mayor, Mississauga)
update candidates set bio = 'Retired Toronto Police Service detective with 34 years in community-based policing, corporate budget management and police-governance leadership. Says he will donate the mayor''s portion of the salary to Mississauga charities each year (estimated $500K over four years). Running a grassroots, no-donation ''Community first'' campaign focused on crime, affordability, job loss and poverty.' where slug = 'mississauga-mike-matulewicz';

-- Melinda Davie (Mayor, Mono)
update candidates set bio = 'Five years of experience serving Mono on Council. Background as a physician and professional misconduct adjudicator. Campaign slogan: ''Practical Leadership. Sound Decisions. Mono First.''' where slug = 'mono-melinda-davie';

-- Laura Campbell (Deputy Mayor, Mono)
update candidates set bio = 'Small business owner with 15 years of experience, running for Deputy Mayor of the Town of Mono.' where slug = 'mono-laura-campbell';

-- Bradley Mayer-Harman (Councillor, Mono)
update candidates set bio = 'Mono resident, husband and father of two living in south Mono''s Purple Hill community. REALTOR since 2010, leads The Mayer-Harman Team; former President of the Brampton Real Estate Board and Provincial Director of the Ontario Real Estate Association. Community volunteer (Purple Hill community rink, Optimist Club, Habitat for Humanity). First ran for Mono Council in 2022, coming within 71 votes of election.' where slug = 'mono-bradley-mayer-harman';

-- Christine Sinclair (Councillor, Mono)
update candidates set bio = 'Deep roots in Mono; community worker and working mother of three. She and her husband are building their own house.' where slug = 'mono-christine-sinclair';

-- Mitchell Shea (Township Councillor - Ward B/Ward 2, Muskoka Lakes)
update candidates set bio = 'Farmer and roofer; sixth-generation Muskoka resident with family in Watt Township since the 1860s among the first free-grant settlers. His son was born last year.' where slug = 'muskoka-lakes-mitchell-shea';

-- Guy Burry (District and Township Councillor - Ward C/Ward 3, Muskoka Lakes)
update candidates set bio = 'District and Township Councillor for Ward C since 2022 (acclaimed). In Muskoka since 1987, full-time since 2019; lives on Lake Joseph with spouse Liz Lundell. Community roles: Muskoka Algonquin Healthcare (Vice Chair), Muskoka Lakes Museum (Director and Treasurer), Muskoka Parry Sound Community Foundation (Director and Treasurer), Muskoka Lakes Association water quality monitoring. 40+ year career in finance, investment, IT and governance, including CIO roles and chairing the FCM Green Municipal Fund investment committee.' where slug = 'muskoka-lakes-guy-burry';

-- Rob Bosomworth (Township Councillor - Ward C/Ward 3, Muskoka Lakes)
update candidates set bio = 'Seeking a second term as Ward C Councillor after eight years of service, including four years as Chair of the Planning Committee and earlier service on the Committee of Adjustment. Brings professional experience in finance and management and a strong understanding of municipal planning and bylaws.' where slug = 'muskoka-lakes-rob-bosomworth';

-- Pam Jeffery (Township Councillor - Ward C/Ward 3, Muskoka Lakes)
update candidates set bio = 'Fifth-generation Minett; her great-great grandparents Charles and Fanny Minett built Clevelands House. 40+ year career in public service, community building and advocacy: began at Queen''s Park in the Industry Minister''s office, 20 years in government relations, Ontario Communications Advisor to Prime Minister Martin (2004 election). Created the Women''s Executive Network and served as CEO; has served on 13 volunteer boards including CAMH and Trent University.' where slug = 'muskoka-lakes-pam-jeffery';

-- Donald Blais (School Board Trustee - MonAvenir Simcoe-Muskoka (French Separate), Muskoka Lakes)
update candidates set bio = 'Married for 32 years, father of two. Telecommunications entrepreneur for 29 years specializing in fiber optics. Volunteered 13 years with the Youth Justice Committee of York, Scarborough and Sault Ste. Marie. Has served 12 years as a school trustee in Simcoe Muskoka and Mississauga.' where slug = 'muskoka-lakes-donald-blais';

-- Mark Sutcliffe (Mayor, Ottawa)
update candidates set bio = 'Mark Sutcliffe was elected Mayor of Ottawa in 2022 after, in his campaign''s words, ''a long campaign with 13 other candidates'' and ''a strong mandate to bring change to City Hall.'' He is running for re-election in 2026 on a platform of keeping taxes low, building 10,000 affordable homes this decade, and a $95 monthly transit pass.' where slug = 'ottawa-mark-sutcliffe';

-- Jeff Leiper (Mayor, Ottawa)
update candidates set bio = 'Jeff Leiper is running for Mayor of Ottawa on a platform of building ''a city that works'': a transit system you can count on, a city you can afford to live in, neighbourhoods where people feel safe, and a City Hall that is open and honest about what it is doing. He has served as Kitchissippi Ward councillor since 2014 and chairs the planning and housing committee.' where slug = 'ottawa-jeff-leiper';

-- Alex Lawson (Mayor, Ottawa)
update candidates set bio = 'Alex Lawson, 38, grew up in Heron Gate and now lives in Dunrobin with his wife and three daughters. After school he went into framing houses; eighteen years later he runs Capital Framing, a construction management company that builds more than 140 homes a year and employs over 17 people. His campaign slogan is ''A city that works for the people who live here.''' where slug = 'ottawa-alex-lawson';

-- Neil Saravanamuttoo (Mayor, Ottawa)
update candidates set bio = 'Neil Saravanamuttoo is an economist and first-time candidate raised in Ottawa''s west end. He studied economics at Carleton University and the London School of Economics, spent nearly two decades at Canada''s Department of Finance, and served as chief economist at the G20-backed Global Infrastructure Hub. He co-founded the non-profit CitySHAPES and was a champion leader against the $418.8M Lansdowne 2.0 project. He and his wife Kimberley have two daughters.' where slug = 'ottawa-neil-saravanamuttoo';

-- Suraj Harish (Mayor, Ottawa)
update candidates set bio = 'Suraj Harish, P.Eng., is a civil engineer and former City of Ottawa senior project manager with more than three decades of experience delivering roadway, transitway, watermain, stormwater and community infrastructure projects across Ottawa. He previously worked for the former Regional Municipality of Ottawa-Carleton. His campaign slogan is ''A former city employee is back to serve the community.''' where slug = 'ottawa-suraj-harish';

-- Brad Bradford (Mayor, Toronto)
update candidates set bio = 'An urban planner, City Councillor, husband, and dad of two, Brad has spent his career on the work of how cities actually get built and how City Hall actually works.' where slug = 'toronto-brad-bradford';

-- Olivia Chow (Mayor, Toronto)
update candidates set bio = 'Olivia Chow is the incumbent Mayor of Toronto, previously serving as a school trustee, city councillor and Member of Parliament.' where slug = 'toronto-olivia-chow';

-- Nate Erskine-Smith (Councillor - Ward 19 (Beaches-East York), Toronto)
update candidates set bio = 'Nate Erskine-Smith is running to represent Ward 19 Beaches-East York as City Councillor; he previously served a decade as the area''s Liberal MP, including a stint as federal Minister of Housing, and says he trusts Mayor Chow''s leadership and wants to collaborate with her at City Hall.' where slug = 'toronto-nate-erskine-smith';

-- Steven Del Duca (Mayor, Vaughan)
update candidates set bio = 'Steven Del Duca is a 40-year Vaughan resident and has served as Mayor of Vaughan since 2022; before that he was an MPP in Vaughan from 2012 to 2018 and led the Ontario Liberal Party. His campaign describes him as committed to affordability, fighting traffic gridlock and championing community safety.' where slug = 'vaughan-steven-del-duca';

-- Shelly-Ann Starlette Cerrelli (Mayor, Vaughan)
update candidates set bio = 'Shelly-Ann Cerrelli is an entrepreneur, business and wealth strategist, founder and investor with more than two decades of business experience spanning real estate, technology and telecommunications. A Jamaican immigrant, wife, mother of five and grandmother, she is running to bring transparency, accountability and resident-focused leadership to City Hall.' where slug = 'vaughan-shelly-ann-starlette-cerrelli';

-- Dorothy MCCABE (Mayor, Waterloo)
update candidates set bio = 'Dorothy McCabe was elected Mayor of Waterloo in 2022 and has spent more than two decades bringing governments, businesses, institutions and communities together to solve difficult problems. Since becoming Mayor she has focused on decisions shaping Waterloo for years to come, from housing and healthcare to economic growth, neighbourhoods and public spaces.' where slug = 'waterloo-dorothy-mccabe';

-- Jerry JIANG (Mayor, Waterloo)
update candidates set bio = 'Jerry Jiang founded Akatos, a Waterloo startup community and hacker house for young builders. His stated role is to help people clarify what they are making, remove blockers, connect them with opportunities, and let them build.' where slug = 'waterloo-jerry-jiang';

-- Jeyas BALASKANTHAN (Mayor, Waterloo)
update candidates set bio = 'Jeyas Balaskanthan moved to Waterloo in 1997 to attend Wilfrid Laurier University, held leadership positions at Laurier and the University of Waterloo from 2001 to 2022, and has been Executive Director of the Uptown Waterloo Business Improvement Area since 2022.' where slug = 'waterloo-jeyas-balaskanthan';

-- Natasha Salonen (Mayor, Wilmot)
update candidates set bio = 'Born and raised in Wilmot, where she lives with her family. Incumbent Mayor of the Township of Wilmot, seeking re-election for the 2026-2030 term, citing four years rebuilding the Township''s financial and organizational foundations.' where slug = 'wilmot-natasha-salonen';

-- Stephanie Goertz (Mayor, Wilmot)
update candidates set bio = 'Founder and President of the Board of Grassroots Response to the Ukrainian Crisis (2022-present), a Wilmot-based not-for-profit that housed 1,900+ people; small business owner; 2024 Wilmot Citizen of the Year; 2025 winner of the Sybil Frenette Visionary Housing Creator Award.' where slug = 'wilmot-stephanie-goertz';

-- Drew DILKENS (Mayor, Windsor)
update candidates set bio = 'Drew Dilkens is a lifelong resident of Windsor. He holds business and law degrees from the University of Windsor (called to the Bar in 2012), an M.B.A. from Wayne State University, and a Doctorate of Business Administration from the International School of Management in Paris. Elected Mayor of Windsor in 2014, he was re-elected in 2018 and 2022 and is seeking a fourth term. He is married to Jane Deneau and has two children, Madison and Jack.' where slug = 'windsor-dilkens-drew';

-- Fred FRANCIS (Mayor, Windsor)
update candidates set bio = 'Fred Francis was born November 22, 1980 in Windsor, the youngest of three sons of Farid and Arlette Francis, who immigrated from Lebanon in the early 1970s. He grew up in South Windsor and earned a B.A. (History/Political Science, 2003) from Western University, an M.A. in History (2006) and a B.Ed. (2009) from the University of Windsor. He served as Director of Business Development for a regional automotive retailer group and is Executive Director of the Multicultural Council of Windsor and Essex County. He and his wife Carolyn live in South Windsor with their daughter Bianca.' where slug = 'windsor-francis-fred';

-- Nick KOLASKY (Mayor, Windsor)
update candidates set bio = 'Nick Kolasky is a retired businessman who has lived in Windsor''s core for 16 years. He ran a manufacturing company for 23 years and studied Commerce at the University of Toronto. His passions are travel and photography. This is his second municipal run; he also ran for the Greens provincially in 2025.' where slug = 'windsor-kolasky-nick';

-- Kat PASQUACH (Mayor, Windsor)
update candidates set bio = 'Kat Pasquach''s work has focused on community outreach, policy development, institutional governance, public education and local partnerships. She served as a Senate representative for 6 years at the University, is a Board Director in non-profit housing (where she began as a student placement 14 years ago), and is owner of Culture Shock Bead Co. and CEO of Can Am Urban Native Non-Profit Homes. She has spent nearly two decades sharing her Indigenous culture through education.' where slug = 'windsor-pasquach-kat';

-- Patrick SUTHERLAND (Mayor, Windsor)
update candidates set bio = 'Patrick Sutherland is a graduate of Walkerville Collegiate Institute and the University of Windsor and has lived in Ward 4 his whole life. A father and grandfather, he has been a member of the Knights of Columbus for over 10 years, is a member of the Windsor Essex Caribbean Association and Chair of the Black Council of Windsor-Essex. He has worked as a DJ, in appliance repair, as a support worker for persons with special needs, in IT sales and as a sports convenor. This is his fourth municipal run and his first for mayor.' where slug = 'windsor-sutherland-patrick';

-- Louis VAUPOTIC (Mayor, Windsor)
update candidates set bio = 'Louis Vaupotic completed an Honours BSc, then a Doctor of Dental Surgery (DDS), practised in Timmins, and spent two years in Chicago obtaining a certificate. He and his wife have four adult children and a Doberman Pinscher.' where slug = 'windsor-vaupotic-louis';

-- Geoffrey D GUTTMANN (Councillor Ward 1, Windsor)
update candidates set bio = 'Geoffrey D. Guttmann is married with two adult children and has lived in Windsor for over 20 years. He is a retired professor of medical and dental anatomy and physiology who helped establish three medical schools and one dental school in Canada, the U.S. and the U.K., and has served as a community coordinator, soccer association secretary-treasurer, university faculty senate president and IAFF union local president.' where slug = 'windsor-guttmann-geoffrey-d';

-- Frazier FATHERS (Councillor Ward 2, Windsor)
update candidates set bio = 'Frazier Fathers has lived in West Windsor for over 15 years, moving to Windsor for university in 2010. He is an affordable housing consultant with master''s degrees in Public Policy and Political Science and has spent over a decade working in community development, affordable housing and social policy.' where slug = 'windsor-fathers-frazier';

-- Spiro S SPILIADIS (Councillor Ward 3, Windsor)
update candidates set bio = 'Spiro S. Spiliadis is a management consultant with over 25 years of experience helping businesses understand challenges, identify opportunities and turn ideas into results.' where slug = 'windsor-spiliadis-spiro-s';

-- Rasha ZAID (Councillor Ward 4, Windsor)
update candidates set bio = 'Rasha Zaid has called Windsor''s Ward 4 home for 26 years. She is a mother, educator, small-business owner and community organizer with 23 years of leadership and management experience, holds multiple postsecondary qualifications and is completing a Master''s in Educational Leadership.' where slug = 'windsor-zaid-rasha';

-- Ken ACTON (Councillor Ward 5, Windsor)
update candidates set bio = 'Ken Acton is a lifelong, third-generation resident of Ward 5 living on the same street he grew up on; his grandparents immigrated from Europe in 1923 and his grandfather worked at the Ford plant. His career spans education, architecture, the labour movement, community building and housing.' where slug = 'windsor-acton-ken';

-- Shane POTVIN (Councillor Ward 5, Windsor)
update candidates set bio = 'Shane Potvin is an entrepreneur, Creative Director of design studio Spotvin, and owner of CO:Workshare, a co-working space on Drouillard Road. As President of the Ford City BIA, he has spent over nine years investing in and supporting businesses and residents in the neighbourhood.' where slug = 'windsor-potvin-shane';

-- Denis MARIER (Councillor Ward 6, Windsor)
update candidates set bio = 'Denis Marier left Riverside at eighteen for university and returned permanently in 2020 to care for his parents, settling in Riverside in September 2024. His background spans nearly thirty years of naturopathic healthcare, teaching, international relief work and public-interest governance.' where slug = 'windsor-marier-denis';

-- Hiral MUNIM (Councillor Ward 6, Windsor)
update candidates set bio = 'Hiral Munim is an East Riverside, Ward 6 resident, serial entrepreneur and mother. After studying Electronics Engineering in India, she moved to Canada two decades ago, working from entry-level jobs into leadership roles and leading several ventures in different provinces before moving to Windsor.' where slug = 'windsor-munim-hiral';

-- Khassan SAKA (Councillor Ward 6, Windsor)
update candidates set bio = 'Khassan Saka was born in Baghdad, Iraq and immigrated to Canada in 1994. A father of three, he served at the Embassy of Iraq in Canada (2004-2014), founded the Integrative Canadian Group Organization (ICGO) in 2014, and became President and Publisher of The Ambassador Canadian Newspaper in 2019. He has served on Windsor''s Heritage and Development Committee and the Wyandotte Town Centre BIA, volunteered with the Rotary Club of Windsor, and spoken at the United Nations on human rights and refugee issues. His contributions have been recognized with the Queen''s Jubilee Pin, the King Charles III Coronation Pin and the Mayor of Windsor''s Community Champion recognition.' where slug = 'windsor-saka-khassan';

-- Victoria SOLUADE (Councillor Ward 7, Windsor)
update candidates set bio = 'Victoria Soluade came to Canada from Nigeria in 2006, lived in Toronto, and later made Windsor her home. She is a business owner, immigration consultant and part-time Political Science student at the University of Windsor, and serves with OPUS and on the board of the Black Council of Windsor-Essex.' where slug = 'windsor-soluade-victoria';

commit;