/** The canonical origin. Also used by metadataBase and the sitemap. */
export const SITE_URL = "https://smartervote.ca";

/**
 * Whether search engines may index this site.
 *
 * DEFAULTS TO FALSE, AND THE DEFAULT IS THE POINT.
 *
 * There is a window — now — where the site is deployed and working but not
 * finished. Nine of twenty-eight candidates have no positions, and not one
 * candidate has been written to yet. If Google indexes it in that state,
 * "Huntsville election candidates" returns a page showing nine people with
 * nothing to say, and search results are slow to correct. A candidate would
 * be entitled to be angry about that, and they would be right.
 *
 * So: deploy, share the URL directly with candidates so they can check their
 * own pages, and stay out of the index until the site actually represents
 * them fairly.
 *
 * TO GO PUBLIC: set SITE_INDEXABLE=true in Vercel → Settings → Environment
 * Variables (Production only), then redeploy. No code change, no push. The
 * launch checklist has this at 14 October, when advance voting opens.
 *
 * Failing closed is deliberate. If the variable is missing, misspelled, or
 * set on the wrong environment, the site stays out of the index — which is
 * the recoverable direction. The opposite default would mean a typo silently
 * publishes an unfinished site.
 */
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";
