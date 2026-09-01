/**
 * The content types the search index carries. These are the values the backend's mappers write, so
 * they are matched verbatim rather than normalised — "NewsArticle" is the entity name, not "News".
 */
export type SearchContentType = 'Page' | 'NewsArticle' | 'Service' | 'Event' | 'Faq' | 'Document';

export interface SearchResult {
  entityId: string;
  contentType: SearchContentType | string;
  slug: string;
  title: string;
  /** A short extract around the match, already trimmed by the backend. */
  snippet: string;
  /** Audience, category, event type — whatever taxonomy the indexed entity carries. */
  taxonomyLabels: string[];
  updatedAtUtc: string | null;
}
