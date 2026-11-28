import Link from "next/link";
import CorrectionForm from "@/components/CorrectionForm";
import { getUiStrings } from "@/lib/queries";
import { localizePath, type Locale } from "@/lib/i18n";
import { splitMarker } from "@/components/pages/chrome";

type Props = {
  searchParams: Promise<{ about?: string; page?: string }>;
  locale: Locale;
};

/**
 * Link-text boundary markers for the footer note. The "privacy page"
 * and "methodology page" phrases have no separate ui_string rows — they
 * are split out of the template, per locale. The visible text always
 * comes from the template; the marker only says where the link starts.
 */
const FOOTER_MARKERS: Record<
  Locale,
  { privacyPage: string; methodologyPage: string }
> = {
  en: { privacyPage: "privacy page", methodologyPage: "methodology page" },
  fr: {
    privacyPage: "page de confidentialité",
    methodologyPage: "page de méthodologie",
  },
  // Phase 2: corrections.footer_note translations must contain exactly
  // these phrases, or the links below silently stop splitting.
  "zh-Hans": { privacyPage: "隐私页面", methodologyPage: "方法页面" },
  "zh-Hant": { privacyPage: "隱私頁面", methodologyPage: "方法頁面" },
  ta: { privacyPage: "தனியுரிமை பக்கம்", methodologyPage: "முறைமை பக்கம்" },
  pa: { privacyPage: "ਗੋਪਨੀਯਤਾ ਪੰਨਾ", methodologyPage: "ਵਿਧੀ ਪੰਨਾ" },
};

const SUPPORT_EMAIL = "support.smartervote.ca@gmail.com";

/**
 * Corrections page body, shared by the English route and the /fr wrapper.
 * All prose comes from the corrections.* rows; the form's own strings
 * come from the form.* rows and are passed down. No database content
 * renders here, so there is no translations fetch and no footnote.
 */
export default async function CorrectionsPage({ searchParams, locale }: Props) {
  const sp = await searchParams;
  const s = await getUiStrings(locale, {
    "corrections.intro":
      "If something here is wrong, incomplete or out of date, please tell us. Corrections from candidates about their own pages are handled first, and anything reported while voting is open is treated as urgent.",
    "corrections.next_heading": "What happens next",
    "corrections.next_1":
      "Every correction is logged, whether or not we end up agreeing with it.",
    "corrections.next_2": "A person reads it. Nothing is applied automatically.",
    "corrections.next_3":
      "You get a reply either way — including when we decide not to change something, and why.",
    "corrections.next_4":
      "Accepted corrections are published to a public corrections log, so the site’s error record is visible rather than quietly edited away.",
    "corrections.candidate_heading": "If you’re a candidate",
    "corrections.candidate_body1":
      "You’re welcome to send us your positions directly, whether or not anything is wrong. Where we haven’t found a public statement from you on an issue, your page says so plainly — and the fastest way to change that is to tell us where to look, or simply tell us what you think.",
    "corrections.candidate_body2":
      "We’ll publish what you send in the same format as everyone else, attributed to you as a direct submission.",
    "corrections.email_heading": "Prefer email?",
    "corrections.email_body": "{email} works too, and is checked daily.",
    "corrections.footer_note":
      "How we handle what you send is covered on the privacy page. Our sourcing and quotation rules are on the methodology page.",
    "footer.report_correction": "Report a correction",
    "form.submit": "Send correction",
    "form.sending": "Sending…",
    "form.thanks_heading": "Thank you — we’ve got it",
    "form.thanks_body1":
      "Your correction is in the queue and a person will read it. You’ll get a reply either way, including if we decide not to change something.",
    "form.thanks_body2":
      "If this is urgent — voting is open, or it concerns your own candidate page — email {email} as well and we’ll prioritise it.",
    "form.about_label": "About: {about}",
    "form.claim_label": "What’s wrong?",
    "form.claim_hint": "Tell us what’s inaccurate, missing or out of date.",
    "form.proposed_label": "What should it say instead?",
    "form.proposed_hint": "Optional, but it speeds things up a lot.",
    "form.url_label": "A link we can check",
    "form.url_hint": "Optional. A page, article or post that backs this up.",
    "form.name_label": "Your name",
    "form.email_label": "Your email",
    "form.candidate_checkbox": "I’m a candidate in this election.",
    "form.candidate_note":
      "Corrections from candidates about their own page are handled first.",
    "form.privacy_note":
      "We use your email only to reply about this correction. It is never published, sold or shared.",
  });
  const markers = FOOTER_MARKERS[locale];
  const [emailBefore, emailAfter] = s["corrections.email_body"].split("{email}");
  const [footBefore, footAfterPrivacy, footHasPrivacy] = splitMarker(
    s["corrections.footer_note"],
    markers.privacyPage
  );
  const [footMiddle, footAfterMethod, footHasMethod] = splitMarker(
    footAfterPrivacy,
    markers.methodologyPage
  );
  return (
    <div>
      <div className="prose-civic">
        <h1 className="text-3xl text-ink">{s["footer.report_correction"]}</h1>
        <p className="mt-4">{s["corrections.intro"]}</p>
      </div>

      <CorrectionForm
        about={sp.about ?? ""}
        pageUrl={sp.page ?? ""}
        locale={locale}
        strings={s}
      />

      <div className="prose-civic mt-12">
        <h2>{s["corrections.next_heading"]}</h2>
        <ul>
          <li>{s["corrections.next_1"]}</li>
          <li>{s["corrections.next_2"]}</li>
          <li>{s["corrections.next_3"]}</li>
          <li>{s["corrections.next_4"]}</li>
        </ul>

        <h2>{s["corrections.candidate_heading"]}</h2>
        <p>{s["corrections.candidate_body1"]}</p>
        <p>{s["corrections.candidate_body2"]}</p>

        <h2>{s["corrections.email_heading"]}</h2>
        <p>
          {emailBefore}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="link">
            {SUPPORT_EMAIL}
          </a>
          {emailAfter}
        </p>

        <p className="mt-8 text-sm text-ink-faint">
          {footHasPrivacy && footHasMethod ? (
            <>
              {footBefore}
              <Link href={localizePath("/privacy", locale)} className="link">
                {markers.privacyPage}
              </Link>
              {footMiddle}
              <Link
                href={localizePath("/methodology", locale)}
                className="link"
              >
                {markers.methodologyPage}
              </Link>
              {footAfterMethod}
            </>
          ) : (
            s["corrections.footer_note"]
          )}
        </p>
      </div>
    </div>
  );
}
