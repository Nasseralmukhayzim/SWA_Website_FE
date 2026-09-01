import { Component, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { DocumentListItem, DocumentSection } from '../../../core/models/document.model';

/** The design lists ten regulations to a page. */
const PAGE_SIZE = 10;

/**
 * The four categories the design colours differently, keyed by the lookup's Arabic name. The public
 * list endpoint returns only `categoryName`, not a slug, so the tone has to be matched on the label
 * — with a neutral fallback so a category an editor adds later still renders as a chip.
 */
const TONES: Record<string, 'neutral' | 'warning' | 'info' | 'success'> = {
  'الأنظمة واللوائح': 'neutral',
  القرارات: 'warning',
  'الأدلة و القواعد و الأطر التنظيمية': 'info',
  'الأكواد و المعايير': 'success',
};

const COPY = {
  ar: {
    all: 'الكل',
    search: 'بحث',
    colTitle: 'العنوان',
    colCategory: 'التصنيف',
    colAction: 'الإجراء',
    download: 'تنزيل',
    noFile: 'لا يوجد ملف مرفق بهذه الوثيقة.',
    empty: 'لا توجد وثائق مطابقة.',
    loading: 'جارٍ التحميل…',
    error: 'تعذر تحميل الوثائق. يرجى المحاولة لاحقًا.',
    pager: 'صفحات النتائج',
    prev: 'السابق',
    next: 'التالي',
  },
  en: {
    all: 'All',
    search: 'Search',
    colTitle: 'Title',
    colCategory: 'Category',
    colAction: 'Action',
    download: 'Download',
    noFile: 'No file is attached to this document.',
    empty: 'No matching documents.',
    loading: 'Loading…',
    error: 'Could not load the documents. Please try again later.',
    pager: 'Result pages',
    prev: 'Previous',
    next: 'Next',
  },
};

@Component({
  selector: 'app-regulations-table',
  templateUrl: './regulations-table.html',
  styleUrl: './regulations-table.scss',
})
export class RegulationsTable {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly all = signal<DocumentListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  /**
   * slug -> the file to open, once resolved. `null` means "looked and there is nothing attached",
   * which is different from a slug that is simply absent and still being fetched.
   *
   * The list endpoint carries no file id, so each row's document has to be read to find one. That
   * happens for the rows on screen only, and each slug is fetched once.
   */
  private readonly files = signal<Record<string, string | null>>({});
  private readonly requested = new Set<string>();

  protected readonly category = signal<string | null>(null);
  protected readonly term = signal('');
  protected readonly page = signal(1);

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  /**
   * Tabs come from the documents actually on the page rather than the category lookup: a category
   * with nothing filed under it would otherwise show an empty tab. They are ordered as the design
   * lists them — the list endpoint carries no sort order, so TONES doubles as that running order —
   * with anything unrecognised appended rather than dropped.
   */
  protected readonly categories = computed(() => {
    const names = new Set<string>();
    for (const item of this.all()) {
      if (item.categoryName) {
        names.add(item.categoryName);
      }
    }
    const order = Object.keys(TONES);
    return [...names].sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
    });
  });

  /**
   * Filtering runs here rather than on the server: the endpoint filters by category id and the list
   * carries only the name, and at this size fetching once and narrowing locally also keeps the
   * search box instant.
   */
  protected readonly filtered = computed(() => {
    const term = this.term().trim().toLocaleLowerCase();
    const category = this.category();
    return this.all().filter((item) => {
      if (category && item.categoryName !== category) {
        return false;
      }
      return !term || item.title.toLocaleLowerCase().includes(term);
    });
  });

  protected readonly lastPage = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  protected readonly rows = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  /**
   * Ascending, so page 1 lands on the reading edge — right in Arabic, left in English — which is
   * how the design orders them.
   */
  protected readonly pages = computed(() =>
    Array.from({ length: this.lastPage() }, (_, i) => i + 1),
  );

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.loading.set(true);
      this.failed.set(false);
      this.api.getDocuments(lang, { section: DocumentSection.Regulations, pageSize: 200 }).subscribe({
        next: (result) => {
          this.all.set(result.items);
          this.loading.set(false);
        },
        error: () => {
          this.all.set([]);
          this.failed.set(true);
          this.loading.set(false);
        },
      });
    });

    // Resolving runs in the browser only: it settles after the page has rendered, and doing it on
    // the server would leave markup the client then has to change, which breaks hydration.
    effect(() => {
      const rows = this.rows();
      const lang = this.language.language();
      if (!this.isBrowser) {
        return;
      }
      for (const row of rows) {
        if (this.requested.has(row.slug)) {
          continue;
        }
        this.requested.add(row.slug);
        this.api.getDocument(row.slug, lang).subscribe({
          next: (detail) => {
            if (detail.externalFileUrl) {
              this.files.update((current) => ({ ...current, [row.slug]: detail.externalFileUrl }));
              return;
            }
            if (!detail.fileId) {
              this.files.update((current) => ({ ...current, [row.slug]: null }));
              return;
            }
            this.api.getMedia(detail.fileId).subscribe({
              next: (asset) => this.files.update((current) => ({ ...current, [row.slug]: asset.url })),
              error: () => this.files.update((current) => ({ ...current, [row.slug]: null })),
            });
          },
          error: () => this.files.update((current) => ({ ...current, [row.slug]: null })),
        });
      }
    });
  }

  /** The file a row opens, or null when it has none — or has not been looked up yet. */
  protected fileFor(slug: string): string | null {
    return this.files()[slug] ?? null;
  }

  /**
   * Blocks the click only when the row has nothing to open. Written as a method rather than an
   * inline expression on purpose: Angular calls preventDefault whenever an event statement
   * evaluates to `false`, so `!fileFor(slug) && ...` would cancel exactly the clicks that should
   * go through.
   */
  protected onDownload(event: Event, slug: string): void {
    if (!this.fileFor(slug)) {
      event.preventDefault();
    }
  }

  protected toneFor(categoryName: string | null): string {
    return categoryName ? (TONES[categoryName] ?? 'neutral') : 'neutral';
  }

  protected selectCategory(name: string | null): void {
    this.category.set(name);
    this.page.set(1);
  }

  protected setTerm(value: string): void {
    this.term.set(value);
    this.page.set(1);
  }

  protected goToPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.lastPage()));
  }
}
