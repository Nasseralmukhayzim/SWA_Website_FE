export interface Lookup {
  id: string;
  slug: string;
  name: string;
}

export type LookupKey = 'event-types' | 'faq-categories' | 'service-activity-types' | 'service-audiences' | 'service-categories' | 'service-channels' | 'document-categories';
