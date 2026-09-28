import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-paper-edge bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-ink-soft">
        {/* R17 mitigation. This is not boilerplate — smartvoting.ca is an
            openly partisan strategic-voting site with a confusingly similar
            name, and being mistaken for it would end this project's
            credibility. It appears on every page, deliberately. */}
        <div className="rounded-lg border border-paper-edge bg-paper-warm p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink">
            SmarterVote is independent and non-partisan
          </h2>
          <p className="leading-relaxed">
            We do not endorse, rank or recommend any candidate, and we do not tell anyone
            how to vote. We are not affiliated with any political party, campaign, or with
            any other similarly named website. Everything here is drawn from what
            candidates have published themselves or from local news reporting, and every
            claim carries a link to its source.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/methodology" className="link tap-target">
            How this works
          </Link>
          <Link href="/corrections" className="link tap-target">
            Report a correction
          </Link>
          <Link href="/privacy" className="link tap-target">
            Privacy
          </Link>
                    <a
            href="https://gofund.me/9b32a40d4"
            className="link tap-target"
            rel="noopener noreferrer"
            target="_blank"
          >
            Donate to support SmarterVote
          </a>
          <a
            href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/"
            className="link tap-target"
            rel="noopener noreferrer"
            target="_blank"
          >
            Official Town of Huntsville election page
          </a>
        </div>

        <p className="mt-6 text-xs text-ink-faint">
                    Built and run by one person, for free, with no advertising. Reader donations
          help keep it running.
          Candidate information is sourced from the Town of Huntsville&rsquo;s certified
          candidate list. For official information about voting, always check{" "}
          <a
            href="https://www.huntsville.ca"
            className="link"
            rel="noopener noreferrer"
            target="_blank"
          >
            huntsville.ca
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
