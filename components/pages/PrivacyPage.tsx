import { getUiStrings } from "@/lib/queries";
import { splitMarker } from "@/components/pages/chrome";
import type { Locale } from "@/lib/i18n";

/**
 * Privacy page body, shared by the English route and the /fr wrapper.
 * All prose comes from the privacy.* rows. The Questions paragraph
 * embeds a mailto link at {email}.
 */
export default async function PrivacyPage({ locale }: { locale: Locale }) {
  const s = await getUiStrings(locale, {
    "footer.privacy": "Privacy",
    "privacy.short_version": "Short version: we don’t collect anything about you.",
    "privacy.no_accounts_heading": "No accounts",
    "privacy.no_accounts_body":
      "There is no sign-up and no login. You cannot create an account here because there are no accounts.",
    "privacy.no_cookies_heading": "No cookies, no ad trackers",
    "privacy.no_cookies_body":
      "SmarterVote sets no cookies and uses no advertising trackers. Our hosting provider, Vercel, collects anonymous aggregate analytics — which pages are viewed and which sites referred visitors — with no cookies and nothing that identifies you. That’s also why you aren’t being asked to dismiss a cookie banner — there’s nothing to consent to.",
    "privacy.count_heading": "What we do count",
    "privacy.count_body1":
      "We count how many times each page is viewed, by the hour. That’s a number in a table — a page address, an hour, and a count. It contains no IP address, no device identifier, no session ID and nothing that could be traced to a person.",
    "privacy.count_body2":
      "We use it for one thing: to see which races people are actually looking at, so effort goes where it’s useful. It cannot tell us who you are, and it cannot tell us whether two visits came from the same person.",
    "privacy.correction_heading": "If you send us a correction",
    "privacy.correction_body":
      "The corrections form asks for your name and email so we can reply and so candidates can be verified. That information is used only to handle your correction. It is never published, never sold, and never shared. If you’d like it deleted after your correction is resolved, just ask.",
    "privacy.links_heading": "Links to other sites",
    "privacy.links_body":
      "Candidate websites, social media and news outlets have their own privacy practices, which we don’t control. Following a link from here takes you outside SmarterVote.",
    "privacy.questions_heading": "Questions",
    "privacy.questions_body": "Email {email}.",
  });
  const [qBefore, qAfter, qHasEmail] = splitMarker(
    s["privacy.questions_body"],
    "{email}"
  );
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">{s["footer.privacy"]}</h1>
      <p className="mt-4">{s["privacy.short_version"]}</p>

      <h2>{s["privacy.no_accounts_heading"]}</h2>
      <p>{s["privacy.no_accounts_body"]}</p>

      <h2>{s["privacy.no_cookies_heading"]}</h2>
      <p>{s["privacy.no_cookies_body"]}</p>

      <h2>{s["privacy.count_heading"]}</h2>
      <p>{s["privacy.count_body1"]}</p>
      <p>{s["privacy.count_body2"]}</p>

      <h2>{s["privacy.correction_heading"]}</h2>
      <p>{s["privacy.correction_body"]}</p>

      <h2>{s["privacy.links_heading"]}</h2>
      <p>{s["privacy.links_body"]}</p>

      <h2>{s["privacy.questions_heading"]}</h2>
      <p>
        {qHasEmail ? (
          <>
            {qBefore}
            <a href="mailto:support.smartervote.ca@gmail.com" className="link">
              support.smartervote.ca@gmail.com
            </a>
            {qAfter}
          </>
        ) : (
          <>
            {qBefore}{" "}
            <a href="mailto:support.smartervote.ca@gmail.com" className="link">
              support.smartervote.ca@gmail.com
            </a>
          </>
        )}
      </p>
    </div>
  );
}
