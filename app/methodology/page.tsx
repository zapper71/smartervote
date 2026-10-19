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
        format, so you can see where they actually differ. The authority running an election
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
        <li>
          It does not accept advertising, sponsorship or funding. Reader donations toward
          running costs buy no influence over content.
        </li>
      </ul>

      <h2>Where the information comes from</h2>
      <p>
        Candidate lists come from the official source for each election: the authority
        running it — a municipal clerk, a provincial or territorial election agency, or
        Elections Canada — publishes the final list of candidates, and that is the list
        we use.
      </p>
      <p>Positions come from, in order of preference:</p>
      <ul>
        <li>The candidate&rsquo;s own campaign website</li>
        <li>The candidate&rsquo;s own public social media</li>
        <li>Their answers to a candidate questionnaire</li>
        <li>Remarks reported from an all-candidates meeting or debate</li>
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
        Summaries are researched and drafted with AI assistance, and constrained to
        restate only what the source actually says. Every summary keeps its quote and its
        source link, so you never have to take a summary&rsquo;s word for anything.
      </p>
      <p>
        Where our confidence is not high — the source is second-hand, the wording is
        ambiguous, or it isn&rsquo;t clear the words are really the candidate&rsquo;s — a
        person reviews the summary before it appears. High-confidence summaries, built on
        a direct quote from an approved source, may appear after automated checks against
        the source, and are spot-checked.
      </p>
      <p>
        We have not checked most positions with the candidates themselves. Unless a
        position is marked as confirmed by the candidate, it rests only on their public
        words — quoted and linked so you can verify it. If you are a candidate and
        something here is wrong or incomplete, the corrections process is the fastest fix,
        and candidates are answered first.
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

      <h2>How much they said</h2>
      <p>
        Next to the link that reveals a candidate&rsquo;s words, you&rsquo;ll
        sometimes see a note in brackets &mdash;{" "}
        <em>(a page or more)</em>, <em>(one sentence)</em>,{" "}
        <em>(reported remarks)</em>. That describes the source we took the
        position from, so you can tell a worked-out plan from a passing mention
        without opening every quote.
      </p>
      <p>
        <strong>It is not a score.</strong> There is no colour, no icon, no
        rating out of five, and the notes are not ranked against each other. We
        thought about a filled-in dot or a green-to-amber scale and decided
        against it: a visual scale is a rating, and this one would rate
        candidates on how much they wrote &mdash; which says more about who has
        a web designer than about who has thought hardest. A single clear
        sentence can be a better answer than five vague paragraphs.
      </p>
      <p>
        Length notes are only ever used for words a candidate published
        themselves, where they chose how much to write. When a position comes
        from a news article or a public meeting we say{" "}
        <em>(reported remarks)</em> and give no length at all, because there the
        length was a reporter&rsquo;s decision, not the candidate&rsquo;s.
        Marking a candidate short because a journalist quoted two sentences of
        them would punish the very candidates who have no website &mdash;
        precisely the unfairness described below.
      </p>
      <p>
        Where you see no note, it means we haven&rsquo;t recorded one yet. It
        doesn&rsquo;t mean anything about the candidate.
      </p>

      <h2>How confident we are</h2>
      <p>
        Under every position you&rsquo;ll see a small{" "}
        <strong>Confidence</strong> label &mdash; Low, Medium or High. It
        answers one question: <em>do we know these are really the
        candidate&rsquo;s words?</em>
      </p>
      <ul>
        <li>
          <strong>High</strong> &mdash; the quote comes from an approved
          source: the candidate&rsquo;s own website, their own public social
          media, a direct media quote, remarks at an all-candidates meeting,
          their answers to a candidate questionnaire, or an email they sent
          us. Or the candidate has confirmed the position themselves.
        </li>
        <li>
          <strong>Medium</strong> &mdash; the position was submitted through
          the site by someone who said they were the candidate, but it
          hasn&rsquo;t been verified yet.
        </li>
        <li>
          <strong>Low</strong> &mdash; the position was submitted through the
          site by someone other than the candidate, and we haven&rsquo;t found
          anything to back it up.
        </li>
      </ul>
      <p>
        When we aren&rsquo;t sure, the answer is Medium. It&rsquo;s the
        default, not a demotion.
      </p>
      <p>
        <strong>Like everything else here, this is not a score.</strong> High
        doesn&rsquo;t mean a position is good and Low doesn&rsquo;t mean
        it&rsquo;s wrong. It describes where the words came from &mdash; not
        how many of them there are, which is why it&rsquo;s separate from the
        length notes above. A Low-confidence position deserves a closer look
        before you act on it, and that&rsquo;s the point of saying so
        openly.
      </p>
      <p>
        If you think a confidence label is wrong &mdash; especially if you
        are the candidate &mdash; that&rsquo;s exactly what the{" "}
        <Link href="/corrections" className="link">
          corrections process
        </Link>{" "}
        is for, and we will fix it quickly.
      </p>

      <h2>When the source is a news article</h2>
      <p>
        A news story mixes two different things: words the candidate actually said,
        inside quotation marks, and the reporter&rsquo;s summary of what they said.
        Those are not the same, and we don&rsquo;t treat them as if they were.
      </p>
      <p>
        <strong>
          Only words a reporter put inside quotation marks and attributed to the
          candidate ever appear here as that candidate&rsquo;s quote.
        </strong>{" "}
        Where an article reports a position but doesn&rsquo;t quote it &mdash;
        &ldquo;she also said she would review the budget process&rdquo; &mdash; that
        appears in our summary, plainly as our summary, never in quotation marks
        beside their name.
      </p>
      <p>
        This is why some candidates have fewer positions here than a full reading of
        their coverage might suggest. If a position was only ever paraphrased, we have
        nothing we can honestly print as their words, so we print nothing and keep
        looking. We also don&rsquo;t stitch two separate quotations together into one
        sentence the candidate never spoke.
      </p>
      <p>
        Comments posted below news articles are not used, even when the name on the
        comment matches a candidate&rsquo;s. A name on a comment form isn&rsquo;t
        verification.
      </p>

      <h2>Links to candidates&rsquo; own pages</h2>
      <p>
        Where we link to a candidate&rsquo;s campaign website, that address comes
        from the official candidate list for that election.
      </p>
      <p>
        <strong>We do not guess social media links.</strong> Official candidate
        lists publish social media as free text &mdash; sometimes a username, sometimes
        just a page name &mdash; and those are not web addresses. Turning them into
        addresses means guessing, and a wrong guess doesn&rsquo;t produce a broken
        link; it points a candidate&rsquo;s name at a stranger who happens to share
        it. A handle on an official candidate list is shown here as plain text,
        exactly as the authority published it, and never as a link.
      </p>
      <p>A social account becomes a link in only two situations:</p>
      <ul>
        <li>
          <strong>The candidate published the address themselves</strong> on their
          own campaign website. We&rsquo;re then passing along an address they
          chose to give out, the same as their website &mdash; not inventing one.
        </li>
        <li>
          <strong>A person here opened the page</strong> and confirmed from its
          content that it belongs to that candidate.
        </li>
      </ul>
      <p>
        What we never do is build an address out of a name or a handle and assume it
        lands in the right place.
      </p>
      <p>
        Names repeat, and a page belonging to someone who shares a
        candidate&rsquo;s name is not that candidate&rsquo;s page. If you ever find
        a link here that goes somewhere it shouldn&rsquo;t,{" "}
        <Link href="/corrections" className="link">
          please tell us
        </Link>{" "}
        &mdash; that gets fixed the same day.
      </p>

      <h2>The fairness problem, stated plainly</h2>
      <p>
        Most candidates, in most places, don&rsquo;t have a campaign website. In
        Huntsville — where this site started — ten of the 28 candidates have one;
        eighteen don&rsquo;t, and nine have neither a website nor a listed social
        account. The same pattern shows up in every election this site covers.
      </p>
      <p>
        A site that only summarises what candidates published would quietly punish whoever
        didn&rsquo;t build a website — which in practice tends to mean first-time
        and less-resourced candidates. That would be a real bias, introduced by a
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
        Every election in Canada has rules about third-party advertising — advertising
        that promotes, supports or opposes a candidate or party. The law differs by
        election — a municipal elections act, a provincial election act, or the Canada
        Elections Act federally — but the basic test is the same.
      </p>
      <p>
        SmarterVote promotes, supports and opposes nobody. It presents what candidates
        have said about issues, with sources, and makes no recommendation. On that basis
        we understand it to fall outside the definition of third-party advertising in the
        elections we cover, and SmarterVote is not registered as a third-party advertiser
        in any of them. We&rsquo;re setting that reasoning out publicly so it can be
        checked rather than assumed. If an election official or any reader believes
        we&rsquo;ve got this wrong, please{" "}
        <Link href="/corrections" className="link">
          tell us
        </Link>{" "}
        and we will act on it.
      </p>

      <h2>Accessibility</h2>
      <p>
        The site targets WCAG 2.2 Level AA. If something here is hard to use with a screen reader, a keyboard, or
        at high zoom, that&rsquo;s a defect — please report it and it will be fixed.
      </p>

      <h2>Who runs this</h2>
      <p>
        One Huntsville resident, unpaid, with no advertising and no affiliation.
        See{" "}
        <Link href="/about" className="link">
          About
        </Link>
        .
      </p>

      <h2>For official information, go to the authority running your election</h2>
      <p>
        This is an independent site. For anything official — registering to vote, how to
        vote, deadlines, results — always use the election authority for your election:
        your municipal clerk, your provincial or territorial election agency, or
        Elections Canada.
      </p>
    </div>
  );
}
