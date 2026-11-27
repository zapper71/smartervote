import Link from "next/link";
import CorrectionForm from "@/components/CorrectionForm";
import { localizePath, type Locale } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ about?: string; page?: string }>;
  locale: Locale;
};

/**
 * Corrections page body, shared by the English route and the /fr wrapper.
 * The form itself is a client component and stays English in Phase 1
 * (phase (b)); the chrome pass wires its strings. No database content
 * renders here, so there is no translations fetch and no footnote.
 */
export default async function CorrectionsPage({ searchParams, locale }: Props) {
  const sp = await searchParams;
  return (
    <div>
      <div className="prose-civic">
        <h1 className="text-3xl text-ink">Report a correction</h1>
        <p className="mt-4">
          If something here is wrong, incomplete or out of date, please tell us.
          Corrections from candidates about their own pages are handled first, and
          anything reported while voting is open is treated as urgent.
        </p>
      </div>

      <CorrectionForm about={sp.about ?? ""} pageUrl={sp.page ?? ""} />

      <div className="prose-civic mt-12">
        <h2>What happens next</h2>
        <ul>
          <li>Every correction is logged, whether or not we end up agreeing with it.</li>
          <li>A person reads it. Nothing is applied automatically.</li>
          <li>
            You get a reply either way — including when we decide not to change
            something, and why.
          </li>
          <li>
            Accepted corrections are published to a public corrections log, so the
            site&rsquo;s error record is visible rather than quietly edited away.
          </li>
        </ul>

        <h2>If you&rsquo;re a candidate</h2>
        <p>
          You&rsquo;re welcome to send us your positions directly, whether or not
          anything is wrong. Where we haven&rsquo;t found a public statement from you on
          an issue, your page says so plainly — and the fastest way to change that is to
          tell us where to look, or simply tell us what you think.
        </p>
        <p>
          We&rsquo;ll publish what you send in the same format as everyone else,
          attributed to you as a direct submission.
        </p>

        <h2>Prefer email?</h2>
        <p>
          <a href="mailto:support.smartervote.ca@gmail.com" className="link">
            support.smartervote.ca@gmail.com
          </a>{" "}
          works too, and is checked daily.
        </p>

        <p className="mt-8 text-sm text-ink-faint">
          How we handle what you send is covered on the{" "}
          <Link href={localizePath("/privacy", locale)} className="link">
            privacy page
          </Link>
          . Our sourcing and quotation rules are on the{" "}
          <Link href={localizePath("/methodology", locale)} className="link">
            methodology page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
