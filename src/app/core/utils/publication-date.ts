/**
 * Formats a publication timestamp as the dd-MM-yyyy stamp the design puts on news cards and
 * article headers.
 *
 * The API returns these without a timezone offset (e.g. "2026-03-12T00:00:00"), which `Date`
 * interprets as local time. Going through `Date` and reading UTC parts therefore shifts a
 * midnight publication date to the previous day east of Greenwich, so the calendar date is taken
 * straight off the string instead. Anything unparseable yields an empty string rather than
 * "NaN-NaN-NaN".
 */
export function formatPublicationDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) {
    const [, year, month, day] = iso;
    return `${day}-${month}-${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${pad(parsed.getDate())}-${pad(parsed.getMonth() + 1)}-${parsed.getFullYear()}`;
}
