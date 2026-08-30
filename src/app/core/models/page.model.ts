export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  parentId: string | null;
  showInNavigation: boolean;
  sortOrder: number;
}

export type PageSectionKind = 'Text' | 'CardGrid' | 'StatGroup' | 'Timeline';

export interface PageSectionItem {
  title: string;
  description: string | null;
  iconId: string | null;
  imageId: string | null;
  linkUrl: string | null;
}

export interface PageSection {
  kind: PageSectionKind;
  heading: string | null;
  intro: string | null;
  body: string | null;
  items: PageSectionItem[];
}

export interface PageDetail {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  heroImageId: string | null;
  parentId: string | null;
  showInNavigation: boolean;
  sections: PageSection[];
  updatedAtUtc: string | null;
}
