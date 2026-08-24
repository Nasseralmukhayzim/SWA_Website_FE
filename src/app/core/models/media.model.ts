export interface MediaAsset {
  id: string;
  url: string;
  contentType: string;
  kind: number;
  titleAr: string | null;
  titleEn: string | null;
  altTextAr: string | null;
  altTextEn: string | null;
}
