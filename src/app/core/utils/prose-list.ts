/**
 * Some CMS text sections hold what the designs draw as a bulleted list — a page's strategic
 * objectives, for instance — but the editor stores them as one run of short sentences. There is no
 * list field to key off, so this recognises the shape instead: several short, self-contained
 * sentences rather than a paragraph of prose.
 *
 * Returns the items when the body reads as a list, and null when it reads as prose, so a caller can
 * fall back to rendering it as a paragraph.
 */

/** Below this a "list" is more likely to be a two-sentence paragraph. */
const MIN_ITEMS = 3;

/** A sentence longer than this is prose, not a list item. */
const MAX_ITEM_LENGTH = 160;

function stripTags(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export function toProseList(body: string | null | undefined): string[] | null {
  if (!body) {
    return null;
  }

  const text = stripTags(body).trim();
  if (!text) {
    return null;
  }

  // Split on line breaks first — an editor who used them already meant a list — then on sentence
  // ends. Arabic full stops are the Latin "." here; the CMS does not emit U+06D4.
  const parts = (text.includes('\n') ? text.split(/\n+/) : text.split(/(?<=\.)\s+/))
    .map((part) => part.replace(/^\s*[-•*]\s*/, '').replace(/\s*\.\s*$/, '').trim())
    .filter((part) => part.length > 0);

  if (parts.length < MIN_ITEMS || parts.some((part) => part.length > MAX_ITEM_LENGTH)) {
    return null;
  }
  return parts;
}
