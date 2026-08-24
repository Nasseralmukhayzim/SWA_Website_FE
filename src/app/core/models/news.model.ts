export interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  heroImageId: string | null;
  isFeatured: boolean;
  createdAtUtc: string;
  publishedAtUtc: string | null;
}

export interface NewsDetail {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  heroImageCaption: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  heroImageId: string | null;
  isFeatured: boolean;
  createdAtUtc: string;
  publishedAtUtc: string | null;
}
