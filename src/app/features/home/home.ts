import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/services/content-api.service';
import { LanguageService } from '../../core/services/language.service';
import { NewsListItem } from '../../core/models/news.model';
import { PageDetail, PageSection } from '../../core/models/page.model';
import { MediaImage } from '../../shared/media-image/media-image';
import { PageSectionComponent } from '../../shared/page-section/page-section';
import { formatPublicationDate } from '../../core/utils/publication-date';

/** The design shows three stories in the news strip. */
const NEWS_COUNT = 3;

const COPY = {
  ar: {
    heroAlt: 'الهيئة السعودية للمياه — استدامة و ابتكار',
    about: 'عن الهيئة',
    news: 'آخر الأخبار',
    newsIntro:
      'يعرض هذا القسم أحدث الأخبار والمبادرات والفعاليات المرتبطة بقطاع المياه، بما يعكس جهود ' +
      'الهيئة في تطوير القطاع وتعزيز التعاون مع الجهات المحلية والدولية.',
    viewAll: 'عرض الكل',
    readMore: 'قراءة المزيد',
    empty: 'لا توجد أخبار منشورة حاليًا.',
    error: 'تعذر تحميل محتوى الصفحة. يرجى المحاولة لاحقًا.',
  },
  en: {
    heroAlt: 'Saudi Water Authority — sustainability and innovation',
    about: 'About the Authority',
    news: 'Latest News',
    newsIntro:
      'This section presents the latest news, initiatives and events related to the water sector, ' +
      'reflecting the Authority’s work to develop the sector and strengthen cooperation with ' +
      'local and international bodies.',
    viewAll: 'View all',
    readMore: 'Read more',
    empty: 'No news published yet.',
    error: 'Something went wrong loading this page’s content. Please try again later.',
  },
} as const;

@Component({
  selector: 'app-home',
  imports: [RouterLink, MediaImage, PageSectionComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly homePage = signal<PageDetail | null>(null);
  protected readonly latestNews = signal<NewsListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.load(lang);
    });
  }

  protected formatDate(item: NewsListItem): string {
    return formatPublicationDate(item.publishedAtUtc ?? item.createdAtUtc);
  }

  /**
   * The design bands the page instead of alternating blindly: the strip that opens the content and
   * the two blocks of figures sit on the tinted background, everything else on white. Deriving the
   * band from the section rather than its position keeps that rhythm intact when an editor adds,
   * removes or reorders sections in the CMS — including ones the design never covered, which would
   * otherwise land on whichever background their index happened to fall on.
   */
  protected isTinted(section: PageSection, index: number): boolean {
    return index === 0 || section.kind === 'StatGroup';
  }

  private load(lang: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.api.getPage('home', lang).subscribe({
      next: (page) => this.homePage.set(page),
      error: () => this.homePage.set(null),
    });

    this.api.getNews(lang, { page: 1, pageSize: NEWS_COUNT }).subscribe({
      next: (result) => {
        this.latestNews.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
