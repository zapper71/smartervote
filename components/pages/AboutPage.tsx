import Link from "next/link";
import { localizePath, type Locale } from "@/lib/i18n";
import { getUiStrings } from "@/lib/queries";
import { splitMarker } from "@/components/pages/chrome";

/**
 * Link-text boundary markers for the About page. The "corrections form"
 * and "methodology page" phrases have no separate ui_string rows — they
 * are split out of their templates, per locale. The visible text always
 * comes from the template; the marker only says where the link starts.
 */
const LINK_MARKERS: Record<Locale, { correctionsForm: string; methodologyPage: string }> = {
  en: { correctionsForm: "corrections form", methodologyPage: "methodology page" },
  fr: {
    correctionsForm: "le formulaire de correction",
    methodologyPage: "La page de méthodologie",
  },
};

/**
 * About page body, shared by the English route and the /fr wrapper.
 * All prose comes from the about.* rows.
 */
export default async function AboutPage({ locale }: { locale: Locale }) {
  const s = await getUiStrings(locale, {
    "about.heading": "About SmarterVote",
    "about.intro":
      "SmarterVote is a free, non-partisan guide to what candidates actually say — now covering the 2026 elections in Ontario and British Columbia. It started in Huntsville, Ontario, for the October 2026 municipal election, because the information a voter needs was scattered across two dozen websites, some Facebook pages, and a few local news articles — and nowhere could you see two candidates for the same seat answering the same question.",
    "about.who_runs_heading": "Who runs it",
    "about.who_runs_body":
      "One person, living in Huntsville. Unpaid. This is not a business, a campaign, a registered charity, or a front for anything.",
    "about.who_funds_heading": "Who funds it",
    "about.who_funds_body":
      "No advertising, no sponsorship, no grants. Readers can chip in through GoFundMe to help with running costs; donations are voluntary, buy no influence over content, and are not tax-deductible. Apart from those contributions the costs — a domain name and hosting — are paid personally. If that ever changes, it will be said plainly on this page before anything else changes.",
    "about.independence_heading": "Independence",
    "about.independence_body":
      "SmarterVote is not affiliated with any political party, candidate, campaign, or advocacy group, and it is not connected to any other similarly named website — including smartvoting.ca, a separate and openly partisan strategic-voting site. SmarterVote makes no recommendation about how anyone should vote.",
    "about.contact_heading": "Contact",
    "about.contact_email_label": "Email:",
    "about.contact_corrections":
      "For anything about a specific candidate’s page, please use the corrections form instead — it gets logged and answered, rather than sitting in an inbox.",
    "about.next_heading": "What’s next",
    "about.next_body":
      "Huntsville was the pilot. SmarterVote now covers municipal elections across Ontario and British Columbia’s 2026 provincial election. Whether it extends further — other provinces, federal elections — depends on whether voters keep finding it worth using, so if you have thoughts, please send them.",
    "about.how_body":
      "The methodology page sets out exactly where information comes from, how it’s reviewed, and where the weaknesses are. It’s worth reading before you trust anything here.",
    "nav.how_it_works": "How this works",
  });
  const markers = LINK_MARKERS[locale];
  const [corrBefore, corrAfter, corrHasLink] = splitMarker(
    s["about.contact_corrections"],
    markers.correctionsForm
  );
  const [howBefore, howAfter, howHasLink] = splitMarker(
    s["about.how_body"],
    markers.methodologyPage
  );
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">{s["about.heading"]}</h1>

      <p className="mt-4">{s["about.intro"]}</p>

      <h2>{s["about.who_runs_heading"]}</h2>
      <p>{s["about.who_runs_body"]}</p>

      <h2>{s["about.who_funds_heading"]}</h2>
      <p>{s["about.who_funds_body"]}</p>

      <h2>{s["about.independence_heading"]}</h2>
      <p>{s["about.independence_body"]}</p>

      <h2>{s["about.contact_heading"]}</h2>
      <p>
        {s["about.contact_email_label"]}{" "}
        <a href="mailto:support.smartervote.ca@gmail.com" className="link">
          support.smartervote.ca@gmail.com
        </a>
      </p>
      <p>
        {corrHasLink ? (
          <>
            {corrBefore}
            <Link href={localizePath("/corrections", locale)} className="link">
              {markers.correctionsForm}
            </Link>
            {corrAfter}
          </>
        ) : (
          s["about.contact_corrections"]
        )}
      </p>

      <h2>{s["about.next_heading"]}</h2>
      <p>{s["about.next_body"]}</p>

      <h2>{s["nav.how_it_works"]}</h2>
      <p>
        {howHasLink ? (
          <>
            {howBefore}
            <Link href={localizePath("/methodology", locale)} className="link">
              {markers.methodologyPage}
            </Link>
            {howAfter}
          </>
        ) : (
          s["about.how_body"]
        )}
      </p>
    </div>
  );
}
