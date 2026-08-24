import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { NewsListItem } from '../../../core/models/news.model';
import { MediaImage } from '../../../shared/media-image/media-image';
import { formatPublicationDate } from '../../../core/utils/publication-date';

/** The design lays the news out three to a row, three rows to a page. */
const PAGE_SIZE = 9;

const COPY = {
  ar: {
    crumbLabel: 'مسار التنقل',
    home: 'الرئيسية',
    mediaCentre: 'المركز الإعلامي',
    news: 'الأخبار',
    intro:
      'تستعرض هذه الصفحة أخبار الهيئة السعودية للمياه ومستجدات قطاع المياه، بما يشمل المبادرات ' +
      'والمشروعات والأنشطة ذات العلاقة.',
    search: 'بحث',
    searchPlaceholder: 'بحث بـ',
    readMore: 'إقرأ المزيد',
    loading: 'جارٍ التحميل…',
    error: 'تعذر تحميل الأخبار. يرجى المحاولة لاحقًا.',
    empty: 'لا توجد أخبار منشورة حاليًا.',
    noMatch: 'لا توجد نتائج مطابقة للبحث.',
    pagination: 'تصفح الصفحات',
    previous: 'السابق',
    next: 'التالي',
  },
  en: {
    crumbLabel: 'Breadcrumb',
    home: 'Home',
    mediaCentre: 'Media Centre',
    news: 'News',
    intro:
      'This page presents news from the Saudi Water Authority and updates from the water sector, ' +
      'including related initiatives, projects, and activities.',
    search: 'Search',
    searchPlaceholder: 'Search by',
    readMore: 'Read more',
    loading: 'Loading…',
    error: 'Could not load news. Please try again later.',
    empty: 'No news published yet.',
    noMatch: 'No articles match your search.',
    pagination: 'Pagination',
    previous: 'Previous',
    next: 'Next',
  },
} as const;

@Component({
  selector: 'app-news-list',
  imports: [RouterLink, MediaImage],
  templateUrl: './news-list.html',
  styleUrl: './news-list.scss',
})
export class NewsList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly all = signal<NewsListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly query = signal('');
  protected readonly page = signal(1);

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  /**
   * Search and paging both run client-side: the archive is small enough to fetch in one request,
   * and doing it here means a search covers every article rather than only the visible page.
   */
  protected readonly matches = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const items = this.all();
    if (!needle) {
      return items;
    }
    return items.filter((item) =>
      `${item.title} ${item.summary ?? ''}`.toLowerCase().includes(needle),
    );
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.matches().length / PAGE_SIZE)),
  );

  protected readonly visible = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.matches().slice(start, start + PAGE_SIZE);
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.loading.set(true);
      this.error.set(false);
      this.api.getNews({ lang, pageSize: 100 }).subscribe({
        next: (result) => {
          this.all.set(result.items);
          this.page.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  protected goTo(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  /** The design stamps each card with a dd-MM-yyyy date. */
  protected formatDate(item: NewsListItem): string {
    return formatPublicationDate(item.publishedAtUtc ?? item.createdAtUtc);
  }
}
