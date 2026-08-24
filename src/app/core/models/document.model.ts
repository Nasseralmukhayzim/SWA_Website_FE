export enum DocumentSection {
  Reports = 0,
  Regulations = 1,
}

export interface DocumentListItem {
  id: string;
  slug: string;
  title: string;
  section: DocumentSection;
  year: number | null;
  coverImageId: string | null;
  categoryName: string | null;
}

export interface DocumentDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  section: DocumentSection;
  year: number | null;
  coverImageId: string | null;
  fileId: string | null;
  externalFileUrl: string | null;
  categoryName: string | null;
}
