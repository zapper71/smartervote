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
