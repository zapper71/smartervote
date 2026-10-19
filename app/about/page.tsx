import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who runs SmarterVote, why it's free, and how it's funded.",
};

export default function AboutPage() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">About SmarterVote</h1>

      <p className="mt-4">
        SmarterVote is a free, non-partisan guide to what candidates actually say —
        now covering the 2026 elections in Ontario and British Columbia. It started in
        Huntsville, Ontario, for the October 2026 municipal election, because
        the information a voter needs was scattered across two dozen websites, some
        Facebook pages, and a few local news articles — and nowhere could you see two
        candidates for the same seat answering the same question.
      </p>

      <h2>Who runs it</h2>
      <p>
        One person, living in Huntsville. Unpaid. This is not a business, a campaign, a
        registered charity, or a front for anything.
      </p>

      <h2>Who funds it</h2>
      <p>
        No advertising, no sponsorship, no grants. Readers can chip in through GoFundMe
        to help with running costs; donations are voluntary, buy no influence over
        content, and are not tax-deductible. Apart from those contributions the costs —
        a domain name and hosting — are paid personally. If that ever changes, it will
        be said plainly on this page before anything else changes.
      </p>

      <h2>Independence</h2>
      <p>
        SmarterVote is not affiliated with any political party, candidate, campaign, or
        advocacy group, and it is not connected to any other similarly named website —
        including smartvoting.ca, a separate and openly partisan strategic-voting site.
        SmarterVote makes no recommendation about how anyone should vote.
      </p>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:support.smartervote.ca@gmail.com" className="link">
          support.smartervote.ca@gmail.com
        </a>
      </p>
      <p>
        For anything about a specific candidate&rsquo;s page, please use the{" "}
        <Link href="/corrections" className="link">
          corrections form
        </Link>{" "}
        instead — it gets logged and answered, rather than sitting in an inbox.
      </p>

      <h2>What&rsquo;s next</h2>
      <p>
        Huntsville was the pilot. SmarterVote now covers municipal elections across
        Ontario and British Columbia&rsquo;s 2026 provincial election. Whether it extends
        further — other provinces, federal elections — depends on whether voters keep
        finding it worth using, so if you have thoughts, please send them.
      </p>

      <h2>How it works</h2>
      <p>
        The{" "}
        <Link href="/methodology" className="link">
          methodology page
        </Link>{" "}
        sets out exactly where information comes from, how it&rsquo;s reviewed, and where
        the weaknesses are. It&rsquo;s worth reading before you trust anything here.
      </p>
    </div>
  );
}
