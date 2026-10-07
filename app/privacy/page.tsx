import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "SmarterVote collects no personal information, sets no cookies, and has no accounts.",
};

export default function PrivacyPage() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">Privacy</h1>
      <p className="mt-4">Short version: we don&rsquo;t collect anything about you.</p>

      <h2>No accounts</h2>
      <p>
        There is no sign-up and no login. You cannot create an account here because there
        are no accounts.
      </p>

      <h2>No cookies, no ad trackers</h2>
      <p>
        SmarterVote sets no cookies and uses no advertising trackers. Our hosting
        provider, Vercel, collects anonymous aggregate analytics — which pages are
        viewed and which sites referred visitors — with no cookies and nothing that
        identifies you. That&rsquo;s also why you aren&rsquo;t being asked to dismiss
        a cookie banner — there&rsquo;s nothing to consent to.
      </p>

      <h2>What we do count</h2>
      <p>
        We count how many times each page is viewed, by the hour. That&rsquo;s a number in
        a table — a page address, an hour, and a count. It contains no IP address, no
        device identifier, no session ID and nothing that could be traced to a person.
      </p>
      <p>
        We use it for one thing: to see which races people are actually looking at, so
        effort goes where it&rsquo;s useful. It cannot tell us who you are, and it
        cannot tell us whether two visits came from the same person.
      </p>

      <h2>If you send us a correction</h2>
      <p>
        The corrections form asks for your name and email so we can reply and so
        candidates can be verified. That information is used only to handle your
        correction. It is never published, never sold, and never shared. If you&rsquo;d
        like it deleted after your correction is resolved, just ask.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Candidate websites, social media and news outlets have their own privacy practices,
        which we don&rsquo;t control. Following a link from here takes you outside
        SmarterVote.
      </p>

      <h2>Questions</h2>
      <p>
        Email{" "}
        <a href="mailto:support.smartervote.ca@gmail.com" className="link">
          support.smartervote.ca@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
