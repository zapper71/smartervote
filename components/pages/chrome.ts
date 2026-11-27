/**
 * Split a template at a marker phrase so the marker's span can be
 * rendered as a link (or other markup) while the rest stays plain text.
 *
 * Returns [before, after, found]. When the marker is absent, `before`
 * is the whole text and `found` is false — callers render the template
 * as plain text in that case.
 *
 * The marker itself is NOT in either half: the caller renders the
 * marker text (from the ui_string row, or a per-locale constant) as
 * the link label.
 */
export function splitMarker(
  text: string,
  marker: string
): [string, string, boolean] {
  if (!marker) return [text, "", false];
  const i = text.indexOf(marker);
  if (i === -1) return [text, "", false];
  return [text.slice(0, i), text.slice(i + marker.length), true];
}

/**
 * Split a string at its FIRST sentence (first ". " — the finder intro
 * puts a dated sentence first, then the rest). Returns [first, rest];
 * rest is "" when there is no second sentence.
 */
export function splitFirstSentence(text: string): [string, string] {
  const i = text.indexOf(". ");
  if (i === -1) return [text, ""];
  return [text.slice(0, i + 1), text.slice(i + 2)];
}

/**
 * Split a string at the FIRST em dash — the race-page intro and the
 * about teaser both put a dated clause before one. Returns [before,
 * after]; after is "" when there is no em dash.
 */
export function splitEmDash(text: string): [string, string] {
  const i = text.indexOf("—");
  if (i === -1) return [text, ""];
  return [text.slice(0, i).trimEnd(), text.slice(i + 1).trimStart()];
}

/**
 * Localised province-name ui_string keys by province slug. The
 * inventory splits them across two prefixes: finder.province_* for
 * ON/BC/SK/QC (the finder provinces) and elections.province_* for the
 * other nine. Together they cover all 13 provinces — use this map
 * wherever a province name renders or fills a {province} placeholder.
 */
export const PROVINCE_NAME_KEYS: Record<string, string> = {
  ontario: "finder.province_ontario",
  "british-columbia": "finder.province_bc",
  saskatchewan: "finder.province_sk",
  quebec: "finder.province_qc",
  alberta: "elections.province_alberta",
  manitoba: "elections.province_manitoba",
  "new-brunswick": "elections.province_nb",
  "newfoundland-and-labrador": "elections.province_nl",
  "nova-scotia": "elections.province_ns",
  "northwest-territories": "elections.province_nwt",
  nunavut: "elections.province_nunavut",
  "prince-edward-island": "elections.province_pei",
  yukon: "elections.province_yukon",
};
