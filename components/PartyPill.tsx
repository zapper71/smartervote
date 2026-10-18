/**
 * Party logo pill for provincial-ballot (BC) candidates.
 *
 * Andreas's direction (2026-10-18): since the BC election is provincial and
 * party affiliation matters, show a pill beside the candidate's name carrying
 * the party's LOGO. Renders ONLY when a party is actually recorded — Ontario
 * municipal candidates carry no party data, so nothing renders there.
 *
 * Parties with a sourced logo asset (public/parties/, from Wikipedia/Wikimedia
 * party files) get the logo inside a white pill; the party name is the
 * tooltip and a visually-hidden label (the img itself is alt="" so screen
 * readers announce it once). Parties without a clean logo asset — CWP,
 * Freedom Party of BC, Unaffiliated, Independent — get a neutral-accent text
 * pill with the party name exactly as recorded (never a party colour, per
 * the site's neutrality rule).
 *
 * Shown beside the candidate name everywhere WithdrawnPill renders. When a
 * candidate is both withdrawn and affiliated, order is: name, PartyPill,
 * WithdrawnPill.
 */
const PARTY_LOGOS: Record<string, string> = {
  "BC NDP": "/parties/bc-ndp.svg",
  "Conservative Party": "/parties/conservative-bc.png",
  "BC Green Party": "/parties/bc-greens.svg",
  CentreBC: "/parties/centrebc.png",
  OneBC: "/parties/onebc.png",
  "Communist Party of BC": "/parties/communist-bc.png",
  Libertarian: "/parties/libertarian-bc.png",
  "Christian Heritage Party of BC": "/parties/chp-bc.jpg",
};

export default function PartyPill({ party }: { party?: string | null }) {
  if (!party) return null;

  const logo = PARTY_LOGOS[party];
  if (logo) {
    return (
      <span
        className="pill ml-2 border border-paper-edge bg-white align-middle"
        title={party}
      >
        <img src={logo} alt="" className="h-4 w-auto" loading="lazy" />
        <span className="sr-only">{party}</span>
      </span>
    );
  }

  // No logo asset: neutral text pill, party name exactly as recorded.
  return (
    <span
      className="pill ml-2 bg-accent-light align-middle text-accent"
      title={party}
    >
      {party}
    </span>
  );
}
