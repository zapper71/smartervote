import type { ReactNode } from "react";
import Link from "next/link";
import { getUiStrings } from "@/lib/queries";
import { localizePath, type Locale } from "@/lib/i18n";
import {
  splitEmDash,
  splitFirstSentence,
  splitMarker,
} from "@/components/pages/chrome";

/**
 * Link-text boundary markers. The link phrases have no separate
 * ui_string rows — they are split out of their templates, per locale.
 * The visible text always comes from the template; the marker only
 * says where the link (or the bold span) starts.
 */
const MARKERS: Record<
  Locale,
  {
    reportIt: string;
    correctionsProcess: string;
    tellUs: string;
    pleaseTellUs: string;
    confidence: string;
    case1: string;
    case2: string;
    about: string;
  }
> = {
  en: {
    reportIt: "report it",
    correctionsProcess: "corrections process",
    tellUs: "tell us",
    pleaseTellUs: "please tell us",
    confidence: "Confidence",
    case1: "The candidate published the address themselves",
    case2: "A person here opened the page",
    about: "About",
  },
  fr: {
    reportIt: "le signaler",
    correctionsProcess: "processus de correction",
    tellUs: "dites-le-nous",
    pleaseTellUs: "dites-le-nous",
    confidence: "Confiance",
    case1: "Le candidat a publié l'adresse lui-même",
    case2: "Une personne ici a ouvert la page",
    about: "À propos",
  },
  // Phase 2: the method.* template translations must contain exactly
  // these phrases, or the links/bold spans below silently stop
  // splitting. The `about` marker must equal the nav.about ui_string
  // translation in each locale.
  "zh-Hans": {
    reportIt: "报告",
    correctionsProcess: "更正流程",
    tellUs: "告诉我们",
    pleaseTellUs: "请告诉我们",
    confidence: "可信度",
    case1: "候选人自己公布了地址",
    case2: "本站有人打开过该页面",
    about: "关于",
  },
  "zh-Hant": {
    reportIt: "報告",
    correctionsProcess: "更正流程",
    tellUs: "告訴我們",
    pleaseTellUs: "請告訴我們",
    confidence: "可信度",
    case1: "候選人自己公佈了地址",
    case2: "本站有人打開過該頁面",
    about: "關於",
  },
  ta: {
    reportIt: "தெரிவிக்கவும்",
    correctionsProcess: "திருத்த செயல்முறை",
    tellUs: "எங்களிடம் சொல்லுங்கள்",
    pleaseTellUs: "தயவுசெய்து எங்களிடம் சொல்லுங்கள்",
    confidence: "நம்பிக்கை",
    case1: "வேட்பாளர் தாமே முகவரியை வெளியிட்டார்",
    case2: "இங்குள்ள ஒருவர் அந்தப் பக்கத்தைத் திறந்தார்",
    about: "பற்றி",
  },
  pa: {
    reportIt: "ਰਿਪੋਰਟ ਕਰੋ",
    correctionsProcess: "ਸੋਧ ਪ੍ਰਕਿਰਿਆ",
    tellUs: "ਸਾਨੂੰ ਦੱਸੋ",
    pleaseTellUs: "ਕਿਰਪਾ ਕਰਕੇ ਸਾਨੂੰ ਦੱਸੋ",
    confidence: "ਭਰੋਸਾ",
    case1: "ਉਮੀਦਵਾਰ ਨੇ ਖੁਦ ਪਤਾ ਪ੍ਰਕਾਸ਼ਿਤ ਕੀਤਾ",
    case2: "ਇੱਥੋਂ ਕਿਸੇ ਨੇ ਉਹ ਪੰਨਾ ਖੋਲ੍ਹਿਆ ਸੀ",
    about: "ਬਾਰੇ",
  },
};

/** The three extent examples in the "How much they said" paragraph. */
const EXTENT_MARKS: Record<Locale, string[]> = {
  en: ["(a page or more)", "(one sentence)", "(reported remarks)"],
  fr: ["(une page ou plus)", "(une phrase)", "(remarques rapportées)"],
  // Phase 2: method.length_body1 translations must contain exactly these
  // parenthesised phrases (same strings as lib/i18n.ts EXTENT_MAPS).
  "zh-Hans": ["(一页或更多)", "(一句话)", "(据报道的言论)"],
  "zh-Hant": ["(一頁或更多)", "(一句話)", "(據報導的言論)"],
  ta: [
    "(ஒரு பக்கம் அல்லது அதற்கு மேல்)",
    "(ஒரு வாக்கியம்)",
    "(அறிக்கையிடப்பட்ட கருத்துகள்)",
  ],
  pa: ["(ਇੱਕ ਪੰਨਾ ਜਾਂ ਵੱਧ)", "(ਇੱਕ ਵਾਕ)", "(ਰਿਪੋਰਟ ਕੀਤੀਆਂ ਟਿੱਪਣੀਆਂ)"],
};

/** Render `text` with the `marker` phrase as a link to `href`. */
function MethodLink({
  text,
  marker,
  href,
}: {
  text: string;
  marker: string;
  href: string;
}) {
  const [before, after, found] = splitMarker(text, marker);
  if (!found) return <>{text}</>;
  return (
    <>
      {before}
      <Link href={href} className="link">
        {marker}
      </Link>
      {after}
    </>
  );
}

/** Render `text` with the `marker` word in bold. */
function BoldWord({ text, marker }: { text: string; marker: string }) {
  const [before, after, found] = splitMarker(text, marker);
  if (!found) return <>{text}</>;
  return (
    <>
      {before}
      <strong>{marker}</strong>
      {after}
    </>
  );
}

/** Bold the first sentence of `text`; the rest stays plain. */
function BoldFirstSentence({ text }: { text: string }) {
  const [first, rest] = splitFirstSentence(text);
  if (!rest) return <>{text}</>;
  return (
    <>
      <strong>{first}</strong> {rest}
    </>
  );
}

/** Bold the lead phrase before the first em dash. */
function BoldLead({ text }: { text: string }) {
  const [lead, rest] = splitEmDash(text);
  if (!rest) return <>{text}</>;
  return (
    <>
      <strong>{lead}</strong> — {rest}
    </>
  );
}

/** Render `text` with each of `marks` wrapped in <em>. */
function Emphases({ text, marks }: { text: string; marks: string[] }) {
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    let first = -1;
    let mark = "";
    for (const m of marks) {
      const i = rest.indexOf(m);
      if (i !== -1 && (first === -1 || i < first)) {
        first = i;
        mark = m;
      }
    }
    if (first === -1) {
      parts.push(rest);
      break;
    }
    if (first > 0) parts.push(rest.slice(0, first));
    parts.push(<em key={key++}>{mark}</em>);
    rest = rest.slice(first + mark.length);
  }
  return <>{parts}</>;
}

/**
 * Methodology page body, shared by the English route and the /fr wrapper.
 * All prose comes from the method.* rows. No database content renders
 * here, so there is no translations fetch and no footnote.
 */
export default async function MethodologyPage({ locale }: { locale: Locale }) {
  const s = await getUiStrings(locale, {
    "method.intro":
      "SmarterVote only works if you can check it. This page explains exactly where the information comes from, how it’s summarised, what gets excluded, and where the weaknesses are. If anything here doesn’t match what you see on the site, that’s a bug — please report it.",
    "method.does_heading": "What this site does",
    "method.does_body":
      "It puts every candidate in a race side by side on the same issues, in the same format, so you can see where they actually differ. The authority running an election publishes who is running and how to reach them. It does not compare them. That gap is the only reason this site exists.",
    "method.does_not_heading": "What this site does not do",
    "method.does_not_1":
      "It does not endorse, rank, score or recommend any candidate.",
    "method.does_not_2":
      "It does not tell you how to vote, or suggest voting strategically.",
    "method.does_not_3":
      "It is not affiliated with any party, campaign, or candidate.",
    "method.does_not_4":
      "It is not affiliated with any other similarly named website. In particular, SmarterVote has no connection to smartvoting.ca, which is a separate and openly partisan strategic-voting site.",
    "method.does_not_5":
      "It does not accept advertising, sponsorship or funding. Reader donations toward running costs buy no influence over content.",
    "method.sources_heading": "Where the information comes from",
    "method.sources_body":
      "Candidate lists come from the official source for each election: the authority running it — a municipal clerk, a provincial or territorial election agency, or Elections Canada — publishes the final list of candidates, and that is the list we use.",
    "method.sources_intro": "Positions come from, in order of preference:",
    "method.source_1": "The candidate’s own campaign website",
    "method.source_2": "The candidate’s own public social media",
    "method.source_3": "Their answers to a candidate questionnaire",
    "method.source_4":
      "Remarks reported from an all-candidates meeting or debate",
    "method.source_5":
      "Local news reporting, attributed to the outlet and dated",
    "method.source_6": "Anything the candidate sends us directly",
    "method.rule_heading": "The rule about sources",
    "method.rule_body1":
      "Every published position carries a direct quote, a link to where it came from, and a date. There are no exceptions, and this isn’t a policy we try to remember — it’s enforced by the database itself. A position can only be published if it has a quote and a source, or if it is explicitly marked “no public position found”. There is no third option.",
    "method.rule_body2":
      "Summaries are researched and drafted with AI assistance, and constrained to restate only what the source actually says. Every summary keeps its quote and its source link, so you never have to take a summary’s word for anything.",
    "method.rule_body3":
      "Where our confidence is not high — the source is second-hand, the wording is ambiguous, or it isn’t clear the words are really the candidate’s — a person reviews the summary before it appears. High-confidence summaries, built on a direct quote from an approved source, may appear after automated checks against the source, and are spot-checked.",
    "method.rule_body4":
      "We have not checked most positions with the candidates themselves. Unless a position is marked as confirmed by the candidate, it rests only on their public words — quoted and linked so you can verify it. If you are a candidate and something here is wrong or incomplete, the corrections process is the fastest fix, and candidates are answered first.",
    "method.quote_heading": "How we quote people",
    "method.quote_body1":
      "Quotes are reproduced exactly as the candidate wrote or said them. We don’t tidy them up, and we don’t shorten them in ways that change their meaning.",
    "method.quote_body2":
      "Square brackets always mean SmarterVote added something. There are only two reasons we ever do it:",
    "method.quote_sic":
      "[sic] — marks a spelling or grammatical error that is in the original. We reproduce the error rather than silently fixing it, and mark it so you know it’s theirs and not ours. It is not a comment on the candidate.",
    "method.quote_context":
      "[added context] — a few words we inserted so a quote makes sense on its own. Quotes often sit under a heading on a candidate’s website that supplies the subject; lifted out, they can read as though they refer to nothing. For example, “Prioritize timely completion of that [Chaffey Township Road] reconstruction” — the bracketed words are ours; everything else is hers.",
    "method.quote_body3":
      "We never use brackets to change what someone meant, to soften a position, or to add commentary. Every insertion is checked against the original before it publishes, and a quote containing an unexplained bracket is treated as an error and stopped rather than published.",
    "method.quote_body4":
      "If you think a bracketed insertion has changed the sense of something you said, that is exactly the kind of thing the corrections process is for, and we will fix it quickly.",
    "method.length_heading": "How much they said",
    "method.length_body1":
      "Next to the link that reveals a candidate’s words, you’ll sometimes see a note in brackets — (a page or more), (one sentence), (reported remarks). That describes the source we took the position from, so you can tell a worked-out plan from a passing mention without opening every quote.",
    "method.length_body2":
      "It is not a score. There is no colour, no icon, no rating out of five, and the notes are not ranked against each other. We thought about a filled-in dot or a green-to-amber scale and decided against it: a visual scale is a rating, and this one would rate candidates on how much they wrote — which says more about who has a web designer than about who has thought hardest. A single clear sentence can be a better answer than five vague paragraphs.",
    "method.length_body3":
      "Length notes are only ever used for words a candidate published themselves, where they chose how much to write. When a position comes from a news article or a public meeting we say (reported remarks) and give no length at all, because there the length was a reporter’s decision, not the candidate’s. Marking a candidate short because a journalist quoted two sentences of them would punish the very candidates who have no website — precisely the unfairness described below.",
    "method.length_body4":
      "Where you see no note, it means we haven’t recorded one yet. It doesn’t mean anything about the candidate.",
    "method.confidence_heading": "How confident we are",
    "method.confidence_body1":
      "Under every position you’ll see a small Confidence label — Low, Medium or High. It answers one question: do we know these are really the candidate’s words?",
    "method.conf_high":
      "High — the quote comes from an approved source: the candidate’s own website, their own public social media, a direct media quote, remarks at an all-candidates meeting, their answers to a candidate questionnaire, or an email they sent us. Or the candidate has confirmed the position themselves.",
    "method.conf_medium":
      "Medium — the position was submitted through the site by someone who said they were the candidate, but it hasn’t been verified yet.",
    "method.conf_low":
      "Low — the position was submitted through the site by someone other than the candidate, and we haven’t found anything to back it up.",
    "method.conf_default":
      "When we aren’t sure, the answer is Medium. It’s the default, not a demotion.",
    "method.conf_not_score":
      "Like everything else here, this is not a score. High doesn’t mean a position is good and Low doesn’t mean it’s wrong. It describes where the words came from — not how many of them there are, which is why it’s separate from the length notes above. A Low-confidence position deserves a closer look before you act on it, and that’s the point of saying so openly.",
    "method.conf_wrong":
      "If you think a confidence label is wrong — especially if you are the candidate — that’s exactly what the corrections process is for, and we will fix it quickly.",
    "method.news_heading": "When the source is a news article",
    "method.news_body1":
      "A news story mixes two different things: words the candidate actually said, inside quotation marks, and the reporter’s summary of what they said. Those are not the same, and we don’t treat them as if they were.",
    "method.news_body2":
      "Only words a reporter put inside quotation marks and attributed to the candidate ever appear here as that candidate’s quote. Where an article reports a position but doesn’t quote it — “she also said she would review the budget process” — that appears in our summary, plainly as our summary, never in quotation marks beside their name.",
    "method.news_body3":
      "This is why some candidates have fewer positions here than a full reading of their coverage might suggest. If a position was only ever paraphrased, we have nothing we can honestly print as their words, so we print nothing and keep looking. We also don’t stitch two separate quotations together into one sentence the candidate never spoke.",
    "method.news_body4":
      "Comments posted below news articles are not used, even when the name on the comment matches a candidate’s. A name on a comment form isn’t verification.",
    "method.links_heading": "Links to candidates’ own pages",
    "method.links_body1":
      "Where we link to a candidate’s campaign website, that address comes from the official candidate list for that election.",
    "method.links_body2":
      "We do not guess social media links. Official candidate lists publish social media as free text — sometimes a username, sometimes just a page name — and those are not web addresses. Turning them into addresses means guessing, and a wrong guess doesn’t produce a broken link; it points a candidate’s name at a stranger who happens to share it. A handle on an official candidate list is shown here as plain text, exactly as the authority published it, and never as a link.",
    "method.links_intro":
      "A social account becomes a link in only two situations:",
    "method.links_case1":
      "The candidate published the address themselves on their own campaign website. We’re then passing along an address they chose to give out, the same as their website — not inventing one.",
    "method.links_case2":
      "A person here opened the page and confirmed from its content that it belongs to that candidate.",
    "method.links_body3":
      "What we never do is build an address out of a name or a handle and assume it lands in the right place.",
    "method.links_body4":
      "Names repeat, and a page belonging to someone who shares a candidate’s name is not that candidate’s page. If you ever find a link here that goes somewhere it shouldn’t, please tell us — that gets fixed the same day.",
    "method.fairness_heading": "The fairness problem, stated plainly",
    "method.fairness_body1":
      "Most candidates, in most places, don’t have a campaign website. In Huntsville — where this site started — ten of the 28 candidates have one; eighteen don’t, and nine have neither a website nor a listed social account. The same pattern shows up in every election this site covers.",
    "method.fairness_body2":
      "A site that only summarises what candidates published would quietly punish whoever didn’t build a website — which in practice tends to mean first-time and less-resourced candidates. That would be a real bias, introduced by a tool claiming to remove bias. So:",
    "method.fair_item1":
      "Every candidate gets the same page template and the same list of issues.",
    "method.fair_item2":
      "Where we can’t find a position, the page says so explicitly and gives the date we looked. We never leave a silent blank, because a blank reads as a judgment.",
    "method.fair_item3":
      "Every candidate page carries a correction link, in the body, not the footer.",
    "method.fair_item4":
      "Candidates are listed alphabetically. The order of issues is not a ranking of their importance.",
    "method.fairness_body3":
      "This is the weakest part of the site and we’d rather say so than let you discover it.",
    "method.corrections_heading": "Corrections",
    "method.corrections_body":
      "Anyone can report a correction, and candidates get priority. Every correction is logged, reviewed by a person, and answered. Corrections received during the voting period are treated as urgent — a wrong fact while people are actively voting is the worst thing that can happen here.",
    "method.ad_rules_heading": "Election advertising rules",
    "method.ad_rules_body1":
      "Every election in Canada has rules about third-party advertising — advertising that promotes, supports or opposes a candidate or party. The law differs by election — a municipal elections act, a provincial election act, or the Canada Elections Act federally — but the basic test is the same.",
    "method.ad_rules_body2":
      "SmarterVote promotes, supports and opposes nobody. It presents what candidates have said about issues, with sources, and makes no recommendation. On that basis we understand it to fall outside the definition of third-party advertising in the elections we cover, and SmarterVote is not registered as a third-party advertiser in any of them. We’re setting that reasoning out publicly so it can be checked rather than assumed. If an election official or any reader believes we’ve got this wrong, please tell us and we will act on it.",
    "method.access_heading": "Accessibility",
    "method.access_body":
      "The site targets WCAG 2.2 Level AA. If something here is hard to use with a screen reader, a keyboard, or at high zoom, that’s a defect — please report it and it will be fixed.",
    "method.who_heading": "Who runs this",
    "method.who_body":
      "One Huntsville resident, unpaid, with no advertising and no affiliation. See About.",
    "method.official_heading":
      "For official information, go to the authority running your election",
    "method.official_body":
      "This is an independent site. For anything official — registering to vote, how to vote, deadlines, results — always use the election authority for your election: your municipal clerk, your provincial or territorial election agency, or Elections Canada.",
    "nav.how_it_works": "How this works",
  });
  const m = MARKERS[locale];
  const correctionsHref = localizePath("/corrections", locale);
  const aboutHref = localizePath("/about", locale);
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">{s["nav.how_it_works"]}</h1>
      <p className="mt-4">
        <MethodLink
          text={s["method.intro"]}
          marker={m.reportIt}
          href={correctionsHref}
        />
      </p>

      <h2>{s["method.does_heading"]}</h2>
      <p>{s["method.does_body"]}</p>

      <h2>{s["method.does_not_heading"]}</h2>
      <ul>
        <li>{s["method.does_not_1"]}</li>
        <li>{s["method.does_not_2"]}</li>
        <li>{s["method.does_not_3"]}</li>
        <li>{s["method.does_not_4"]}</li>
        <li>{s["method.does_not_5"]}</li>
      </ul>

      <h2>{s["method.sources_heading"]}</h2>
      <p>{s["method.sources_body"]}</p>
      <p>{s["method.sources_intro"]}</p>
      <ul>
        <li>{s["method.source_1"]}</li>
        <li>{s["method.source_2"]}</li>
        <li>{s["method.source_3"]}</li>
        <li>{s["method.source_4"]}</li>
        <li>{s["method.source_5"]}</li>
        <li>{s["method.source_6"]}</li>
      </ul>

      <h2>{s["method.rule_heading"]}</h2>
      <p>{s["method.rule_body1"]}</p>
      <p>{s["method.rule_body2"]}</p>
      <p>{s["method.rule_body3"]}</p>
      <p>{s["method.rule_body4"]}</p>

      <h2>{s["method.quote_heading"]}</h2>
      <p>{s["method.quote_body1"]}</p>
      <p>
        <BoldFirstSentence text={s["method.quote_body2"]} />
      </p>
      <ul>
        <li>
          <BoldLead text={s["method.quote_sic"]} />
        </li>
        <li>
          <BoldLead text={s["method.quote_context"]} />
        </li>
      </ul>
      <p>{s["method.quote_body3"]}</p>
      <p>
        <MethodLink
          text={s["method.quote_body4"]}
          marker={m.correctionsProcess}
          href={correctionsHref}
        />
      </p>

      <h2>{s["method.length_heading"]}</h2>
      <p>
        <Emphases text={s["method.length_body1"]} marks={EXTENT_MARKS[locale]} />
      </p>
      <p>
        <BoldFirstSentence text={s["method.length_body2"]} />
      </p>
      <p>{s["method.length_body3"]}</p>
      <p>{s["method.length_body4"]}</p>

      <h2>{s["method.confidence_heading"]}</h2>
      <p>
        <BoldWord text={s["method.confidence_body1"]} marker={m.confidence} />
      </p>
      <ul>
        <li>
          <BoldLead text={s["method.conf_high"]} />
        </li>
        <li>
          <BoldLead text={s["method.conf_medium"]} />
        </li>
        <li>
          <BoldLead text={s["method.conf_low"]} />
        </li>
      </ul>
      <p>{s["method.conf_default"]}</p>
      <p>
        <BoldFirstSentence text={s["method.conf_not_score"]} />
      </p>
      <p>
        <MethodLink
          text={s["method.conf_wrong"]}
          marker={m.correctionsProcess}
          href={correctionsHref}
        />
      </p>

      <h2>{s["method.news_heading"]}</h2>
      <p>{s["method.news_body1"]}</p>
      <p>
        <BoldFirstSentence text={s["method.news_body2"]} />
      </p>
      <p>{s["method.news_body3"]}</p>
      <p>{s["method.news_body4"]}</p>

      <h2>{s["method.links_heading"]}</h2>
      <p>{s["method.links_body1"]}</p>
      <p>
        <BoldFirstSentence text={s["method.links_body2"]} />
      </p>
      <p>{s["method.links_intro"]}</p>
      <ul>
        <li>
          <BoldWord text={s["method.links_case1"]} marker={m.case1} />
        </li>
        <li>
          <BoldWord text={s["method.links_case2"]} marker={m.case2} />
        </li>
      </ul>
      <p>{s["method.links_body3"]}</p>
      <p>
        <MethodLink
          text={s["method.links_body4"]}
          marker={m.pleaseTellUs}
          href={correctionsHref}
        />
      </p>

      <h2>{s["method.fairness_heading"]}</h2>
      <p>{s["method.fairness_body1"]}</p>
      <p>{s["method.fairness_body2"]}</p>
      <ul>
        <li>{s["method.fair_item1"]}</li>
        <li>{s["method.fair_item2"]}</li>
        <li>{s["method.fair_item3"]}</li>
        <li>{s["method.fair_item4"]}</li>
      </ul>
      <p>{s["method.fairness_body3"]}</p>

      <h2>{s["method.corrections_heading"]}</h2>
      <p>{s["method.corrections_body"]}</p>

      <h2>{s["method.ad_rules_heading"]}</h2>
      <p>{s["method.ad_rules_body1"]}</p>
      <p>
        <MethodLink
          text={s["method.ad_rules_body2"]}
          marker={m.tellUs}
          href={correctionsHref}
        />
      </p>

      <h2>{s["method.access_heading"]}</h2>
      <p>{s["method.access_body"]}</p>

      <h2>{s["method.who_heading"]}</h2>
      <p>
        <MethodLink text={s["method.who_body"]} marker={m.about} href={aboutHref} />
      </p>

      <h2>{s["method.official_heading"]}</h2>
      <p>{s["method.official_body"]}</p>
    </div>
  );
}
