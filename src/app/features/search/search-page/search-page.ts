import { Component, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchApiService } from '../../../core/services/search-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { SearchResult } from '../../../core/models/search.model';

const PAGE_SIZE = 10;

/**
 * The content types the index carries, in the order the filter row shows them. `null` is "all".
 * The values are the entity names the backend writes, so they are passed through unchanged.
 */
const FILTERS: { value: string | null; ar: string; en: string }[] = [
  { value: null, ar: 'الكل', en: 'All' },
  { value: 'Page', ar: 'الصفحات', en: 'Pages' },
  { value: 'Service', ar: 'الخدمات', en: 'Services' },
  { value: 'NewsArticle', ar: 'الأخبار', en: 'News' },
  { value: 'Event', ar: 'الفعاليات', en: 'Events' },
  { value: 'Faq', ar: 'الأسئلة الشائعة', en: 'FAQs' },
  { value: 'Document', ar: 'الوثائق', en: 'Documents' },
];

/** Where a hit of each content type lives on the site. */
const ROUTES: Record<string, (slug: string) => string[]> = {
  Page: (slug) => ['/pages', slug],
  Service: (slug) => ['/services', slug],
  NewsArticle: (slug) => ['/news', slug],
  Event: (slug) => ['/events', slug],
  Document: (slug) => ['/documents', slug],
  // FAQs are all on one page, so a hit links to the list rather than a detail route of its own.
  Faq: () => ['/faqs'],
};

const COPY = {
  ar: {
    heading: 'البحث في الموقع',
    placeholder: 'ابحث عن صفحة أو خدمة أو خبر…',
    submit: 'بحث',
    crumbLabel: 'مسار التنقل',
    home: 'الرئيسية',
    resultsFor: 'نتائج البحث عن',
    count: (n: number) => `${n} نتيجة`,
    empty: 'لا توجد نتائج مطابقة لبحثك.',
    emptyHint: 'جرّب كلمات أقل أو تحقق من الإملاء.',
    prompt: 'اكتب كلمة للبحث في محتوى الموقع.',
    loading: 'جارٍ البحث…',
    error: 'تعذر إجراء البحث حاليًا. يرجى المحاولة لاحقًا.',
    prev: 'السابق',
    next: 'التالي',
    types: {
      Page: 'صفحة',
      Service: 'خدمة',
      NewsArticle: 'خبر',
      Event: 'فعالية',
      Faq: 'سؤال شائع',
      Document: 'وثيقة',
    } as Record<string, string>,
  },
  en: {
    heading: 'Search the site',
    placeholder: 'Search for a page, service or story…',
    submit: 'Search',
    crumbLabel: 'Breadcrumb',
    home: 'Home',
    resultsFor: 'Results for',
    count: (n: number) => `${n} result${n === 1 ? '' : 's'}`,
    empty: 'Nothing matched your search.',
    emptyHint: 'Try fewer words, or check the spelling.',
    prompt: 'Type a word to search the site.',
    loading: 'Searching…',
    error: 'Search is unavailable right now. Please try again later.',
    prev: 'Previous',
    next: 'Next',
    types: {
      Page: 'Page',
      Service: 'Service',
      NewsArticle: 'News',
      Event: 'Event',
      Faq: 'FAQ',
      Document: 'Document',
    } as Record<string, string>,
  },
};

@Component({
  selector: 'app-search-page',
  imports: [RouterLink],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  private readonly api = inject(SearchApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly results = signal<SearchResult[]>([]);
  protected readonly total = signal(0);
  /**
   * Starts true when the URL already carries a term, so the server and the freshly hydrated client
   * agree on which branch of the template is showing before any result arrives.
   */
  protected readonly loading = signal(!!this.route.snapshot.queryParamMap.get('q'));
  protected readonly failed = signal(false);
  /**
   * What the visitor has typed since the page loaded, or null while they have not touched the
   * field. Kept separate from the term in the URL so the loading effect never writes to it — a
   * signal write from inside that effect re-enters change detection and desynchronises hydration.
   */
  private readonly draft = signal<string | null>(null);

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  protected readonly term = computed(() => (this.queryParams().get('q') ?? '').trim());
  protected readonly contentType = computed(() => this.queryParams().get('type'));
  protected readonly page = computed(() => Number(this.queryParams().get('page') ?? '1') || 1);

  protected readonly filters = computed(() =>
    FILTERS.map((f) => ({ value: f.value, label: this.language.language() === 'ar' ? f.ar : f.en })),
  );

  protected readonly lastPage = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  /** The field shows what was typed, falling back to whatever the URL is currently searching for. */
  protected readonly fieldValue = computed(() => this.draft() ?? this.term());

  constructor() {
    effect(() => {
      const term = this.term();
      const contentType = this.contentType();
      const page = this.page();
      const lang = this.language.language();

      // Search runs in the browser only. Results carry no SEO value, and the reader's language
      // lives in their own storage — rendering them on the server would search the wrong language
      // and leave markup the client then has to replace, which breaks hydration.
      if (!this.isBrowser) {
        return;
      }

      if (!term) {
        this.results.set([]);
        this.total.set(0);
        this.failed.set(false);
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.failed.set(false);
      this.api.search({ q: term, lang, contentType, page, pageSize: PAGE_SIZE }).subscribe({
        next: (result) => {
          this.results.set(result.items);
          this.total.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.results.set([]);
          this.total.set(0);
          this.failed.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected typeLabel(contentType: string): string {
    return this.t().types[contentType] ?? contentType;
  }

  protected linkFor(result: SearchResult): string[] {
    const build = ROUTES[result.contentType];
    return build ? build(result.slug) : ['/'];
  }

  protected setDraft(value: string): void {
    this.draft.set(value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.go({ q: this.fieldValue().trim(), page: 1 });
  }

  protected selectType(value: string | null): void {
    this.go({ type: value, page: 1 });
  }

  protected goToPage(page: number): void {
    this.go({ page });
  }

  /** Search state lives in the URL so a result list can be linked to and survives a reload. */
  private go(changes: { q?: string; type?: string | null; page?: number }): void {
    const queryParams: Record<string, string | null> = {
      q: changes.q ?? this.term(),
      type: changes.type === undefined ? this.contentType() : changes.type,
      page: String(changes.page ?? this.page()),
    };
    if (queryParams['page'] === '1') {
      queryParams['page'] = null;
    }
    this.router.navigate(['/search'], { queryParams });
  }
}
