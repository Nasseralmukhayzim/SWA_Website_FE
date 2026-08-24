export interface FaqListItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
  categoryId: string | null;
  categoryName: string | null;
}
