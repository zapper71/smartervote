import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How this works",
  description:
    "Exactly how SmarterVote gathers, summarises and reviews candidate information — and what it deliberately doesn't do.",
};

export default function MethodologyPage() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">How this works</h1>
      <p className="mt-4">
        SmarterVote only works if you can check it. This page explains exactly where the
        information comes from, how it&rsquo;s summarised, what gets excluded, and where
        the weaknesses are. If anything here doesn&rsquo;t match what you see on the site,
        that&rsquo;s a bug — please{" "}
        <Link href="/corrections" className="link">
          report it
        </Link>
        .
      </p>

      <h2>What this site does</h2>
      <p>
        It puts every candidate in a race side by side on the same issues, in the same
        format, so you can see where they actually differ. The Town of Huntsville
        publishes who is running and how to reach them. It does not compare them. That gap
        is the only reason this site exists.
      </p>

      <h2>What this site does not do</h2>
      <ul>
        <li>It does not endorse, rank, score or recommend any candidate.</li>
        <li>It does not tell you how to vote, or suggest voting strategically.</li>
        <li>It is not affiliated with any party, campaign, or candidate.</li>
        <li>
          It is not affiliated with any other similarly named website. In particular,
          SmarterVote has no connection to smartvoting.ca, which is a separate and openly
          partisan strategic-voting site.
        </li>
        <li>It does not accept advertising, sponsorship, donations or funding.</li>
      </ul>

      <h2>Where the information comes from</h2>
      <p>
        The candidate list is taken from the{" "}
        <a
          href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/certified-candidates/"
          className="link"
          rel="noopener noreferrer"
          target="_blank"
        >
          Town of Huntsville&rsquo;s certified candidate list
        </a>
        . Nominations closed on 21 August 2026 and candidates were certified on 24 August,
        so that list is final.
      </p>
      <p>Positions come from, in order of preference:</p>
      <ul>
        <li>The candidate&rsquo;s own campaign website</li>
        <li>The candidate&rsquo;s own public social media</li>
        <li>Local news reporting, attributed to the outlet and dated</li>
        <li>Anything the candidate sends us directly</li>
      </ul>

      <h2>The rule about sources</h2>
      <p>
        Every published position carries a direct quote, a link to where it came from, and
        a date. There are no exceptions, and this isn&rsquo;t a policy we try to remember
        — it&rsquo;s enforced by the database itself. A position can only be published if
        it has a quote and a source, or if it is explicitly marked &ldquo;no public
        position found&rdquo;. There is no third option.
      </p>
      <p>
        Summaries are drafted with AI assistance and constrained to restate only what the
        source actually says. Every one is reviewed by a person before it appears. Nothing
        publishes automatically.
      </p>

      <h2>How we quote people</h2>
      <p>
        Quotes are reproduced exactly as the candidate wrote or said them. We don&rsquo;t
        tidy them up, and we don&rsquo;t shorten them in ways that change their meaning.
      </p>
      <p>
        <strong>Square brackets always mean SmarterVote added something.</strong> There
        are only two reasons we ever do it:
      </p>
      <ul>
        <li>
          <strong>[sic]</strong> &mdash; marks a spelling or grammatical error that is in
          the original. We reproduce the error rather than silently fixing it, and mark it
          so you know it&rsquo;s theirs and not ours. It is not a comment on the
          candidate.
        </li>
        <li>
          <strong>[added context]</strong> &mdash; a few words we inserted so a quote makes
          sense on its own. Quotes often sit under a heading on a candidate&rsquo;s
          website that supplies the subject; lifted out, they can read as though they
          refer to nothing. For example,{" "}
          <em>
            &ldquo;Prioritize timely completion of that [Chaffey Township Road]
            reconstruction&rdquo;
          </em>{" "}
          &mdash; the bracketed words are ours; everything else is hers.
        </li>
      </ul>
      <p>
        We never use brackets to change what someone meant, to soften a position, or to
        add commentary. Every insertion is checked against the original before it
        publishes, and a quote containing an unexplained bracket is treated as an error
        and stopped rather than published.
      </p>
      <p>
        If you think a bracketed insertion has changed the sense of something you said,
        that is exactly the kind of thing the{" "}
        <Link href="/corrections" className="link">
          corrections process
        </Link>{" "}
        is for, and we will fix it quickly.
      </p>

      <h2>The fairness problem, stated plainly</h2>
      <p>
        Ten of the 28 candidates have campaign websites. Eighteen don&rsquo;t. Nine have
        neither a website nor a listed social account.
      </p>
      <p>
        A site that only summarises what candidates published would quietly punish whoever
        didn&rsquo;t build a website — which in practice tends to mean first-time,
        older and less-resourced candidates. That would be a real bias, introduced by a
        tool claiming to remove bias. So:
      </p>
      <ul>
        <li>Every candidate gets the same page template and the same list of issues.</li>
        <li>
          Where we can&rsquo;t find a position, the page says so explicitly and gives the
          date we looked. We never leave a silent blank, because a blank reads as a
          judgment.
        </li>
        <li>Every candidate page carries a correction link, in the body, not the footer.</li>
        <li>
          Candidates are listed alphabetically. The order of issues is not a ranking of
          their importance.
        </li>
      </ul>
      <p>
        This is the weakest part of the site and we&rsquo;d rather say so than let you
        discover it.
      </p>

      <h2>Corrections</h2>
      <p>
        Anyone can report a correction, and candidates get priority. Every correction is
        logged, reviewed by a person, and answered. Corrections received during the voting
        period are treated as urgent — a wrong fact while people are actively voting is
        the worst thing that can happen here.
      </p>

      <h2>Election advertising rules</h2>
      <p>
        Ontario&rsquo;s <em>Municipal Elections Act, 1996</em> regulates third-party
        advertising, which it defines as advertising that{" "}
        <em>promotes, supports or opposes</em> a candidate. The Province&rsquo;s own
        guidance further states that advertising about an issue rather than a candidate is
        not third-party advertising.
      </p>
      <p>
        SmarterVote promotes, supports and opposes nobody. It presents what candidates have
        said about issues, with sources, and makes no recommendation. On that basis we
        understand it to fall outside the definition of third-party advertising, and
        SmarterVote is not registered as a third-party advertiser. We&rsquo;re setting that
        reasoning out publicly so it can be checked rather than assumed. If the Town Clerk
        or any reader believes we&rsquo;ve got this wrong, please{" "}
        <Link href="/corrections" className="link">
          tell us
        </Link>{" "}
        and we will act on it.
      </p>

      <h2>Accessibility</h2>
      <p>
        The site targets WCAG 2.2 Level AA and is built to meet Ontario&rsquo;s AODA
        requirements. If something here is hard to use with a screen reader, a keyboard, or
        at high zoom, that&rsquo;s a defect — please report it and it will be fixed.
      </p>

      <h2>Who runs this</h2>
      <p>
        One Huntsville resident, unpaid, with no funding, no advertising and no
        affiliation. See{" "}
        <Link href="/about" className="link">
          About
        </Link>
        .
      </p>

      <h2>For official information, go to the Town</h2>
      <p>
        This is an independent site. For anything official — registering to vote, how to
        vote, deadlines, results — always use{" "}
        <a
          href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/"
          className="link"
          rel="noopener noreferrer"
          target="_blank"
        >
          huntsville.ca
        </a>
        .
      </p>
    </div>
  );
}
