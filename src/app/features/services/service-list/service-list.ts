import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { ServiceDeliveryType, ServiceListItem } from '../../../core/models/service.model';
import { Lookup } from '../../../core/models/lookup.model';
import { MediaImage } from '../../../shared/media-image/media-image';

/**
 * The design's switcher offers الأفراد / الأعمال / الأدوات. The first two are service audiences,
 * the third is not an audience at all — it is the calculator-style services — so a segment is
 * either audience-backed or the tools segment.
 */
interface Segment {
  /** Audience slug, or 'tools' for the calculator segment. */
  readonly key: string;
  readonly label: string;
  readonly tools?: boolean;
}

const COPY = {
  ar: {
    crumbLabel: 'مسار التنقل',
    home: 'الرئيسية',
    services: 'الخدمات الإلكترونية',
    intro:
      'تستعرض هذه الصفحة الخدمات الإلكترونية التي تقدمها الهيئة السعودية للمياه للأفراد وقطاع ' +
      'الأعمال، إضافة إلى الأدوات المساندة.',
    tools: 'الأدوات',
    loading: 'جارٍ التحميل…',
    error: 'تعذر تحميل الخدمات. يرجى المحاولة لاحقًا.',
    empty: 'لا توجد خدمات في هذا التصنيف.',
    filterLabel: 'تصفية الخدمات حسب الفئة',
    categoryLabel: 'تصفية حسب نوع الخدمة',
    activityLabel: 'نوع النشاط',
    all: 'الكل',
    searchPlaceholder: 'بحث باستخدام اسم الخدمة ، نوع المستفيد ، الفئة',
    search: 'بحث',
  },
  en: {
    crumbLabel: 'Breadcrumb',
    home: 'Home',
    services: 'E-Services',
    intro:
      'This page presents the electronic services the Saudi Water Authority provides to ' +
      'individuals and businesses, along with its supporting tools.',
    tools: 'Tools',
    loading: 'Loading…',
    error: 'Could not load services. Please try again later.',
    empty: 'No services in this category.',
    filterLabel: 'Filter services by audience',
    categoryLabel: 'Filter by service type',
    activityLabel: 'Activity type',
    all: 'All',
    searchPlaceholder: 'Search by service name, beneficiary type, category',
    search: 'Search',
  },
} as const;

@Component({
  selector: 'app-service-list',
  imports: [RouterLink, MediaImage],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  private readonly all = signal<ServiceListItem[]>([]);
  private readonly audiences = signal<Lookup[]>([]);
  private readonly categories = signal<Lookup[]>([]);
  private readonly activityTypes = signal<Lookup[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly selected = signal<string | null>(null);
  protected readonly category = signal<string | null>(null);
  protected readonly activity = signal<string | null>(null);
  protected readonly query = signal('');

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  protected readonly segments = computed<Segment[]>(() => {
    const segments: Segment[] = this.audiences().map((a) => ({ key: a.slug, label: a.name }));
    // Only offer the tools segment when there is actually something in it.
    if (this.all().some((s) => s.deliveryType === ServiceDeliveryType.Calculator)) {
      segments.push({ key: 'tools', label: this.t().tools, tools: true });
    }
    return segments;
  });

  /** The design always has one segment active, so fall back to the first available one. */
  protected readonly current = computed(() => {
    const segments = this.segments();
    const chosen = segments.find((s) => s.key === this.selected());
    return chosen ?? segments[0] ?? null;
  });

  private readonly inSegment = computed(() => {
    const segment = this.current();
    const items = this.all();
    if (!segment) {
      return items;
    }
    if (segment.tools) {
      return items.filter((s) => s.deliveryType === ServiceDeliveryType.Calculator);
    }
    return items.filter((s) => s.audienceSlugs.includes(segment.key));
  });

  /**
   * Category chips, counted within the active segment and dropped when empty — a chip reading 0,
   * or one that leads to an empty grid, is worse than no chip.
   */
  protected readonly chips = computed(() => {
    const items = this.searched();
    return this.categories()
      .map((c) => ({ ...c, count: items.filter((s) => s.categorySlug === c.slug).length }))
      .filter((c) => c.count > 0);
  });

  /** Free-text search across the service name and description, as the design's box describes. */
  private readonly searched = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const items = this.inSegment();
    if (!needle) {
      return items;
    }
    return items.filter((s) =>
      `${s.name} ${s.description ?? ''} ${s.categoryName ?? ''} ${s.audienceNames.join(' ')}`
        .toLowerCase()
        .includes(needle),
    );
  });

  private readonly inCategory = computed(() => {
    const items = this.searched();
    const slug = this.category();
    return slug ? items.filter((s) => s.categorySlug === slug) : items;
  });

  /**
   * Activity tabs, counted against everything the other controls have already narrowed to. An
   * "all" tab leads, then only the activities that actually have services behind them — many
   * services (complaints, calculators, platforms) carry no activity at all.
   */
  protected readonly tabs = computed(() => {
    const items = this.inCategory();
    const withCounts = this.activityTypes()
      .map((a) => ({ slug: a.slug, name: a.name, count: items.filter((s) => s.activityTypeSlug === a.slug).length }))
      .filter((a) => a.count > 0);
    return withCounts.length
      ? [{ slug: '', name: this.t().all, count: items.length }, ...withCounts]
      : [];
  });

  protected readonly visible = computed(() => {
    const items = this.inCategory();
    const slug = this.activity();
    return slug ? items.filter((s) => s.activityTypeSlug === slug) : items;
  });

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.loading.set(true);
      this.error.set(false);
      forkJoin({
        services: this.api.getServices(lang, { pageSize: 100 }),
        audiences: this.api.getLookups('service-audiences', lang),
        categories: this.api.getLookups('service-categories', lang),
        activityTypes: this.api.getLookups('service-activity-types', lang),
      }).subscribe({
        next: ({ services, audiences, categories, activityTypes }) => {
          this.all.set(services.items);
          this.audiences.set(audiences);
          this.categories.set(categories);
          this.activityTypes.set(activityTypes);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected select(segment: Segment): void {
    this.selected.set(segment.key);
    // Switching audience can strand a category or activity with nothing in the new segment.
    this.category.set(null);
    this.activity.set(null);
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.activity.set(null);
  }

  protected selectActivity(slug: string): void {
    this.activity.set(slug || null);
  }

  /** Chips toggle: tapping the active one clears it and shows the whole segment again. */
  protected toggleCategory(slug: string): void {
    this.category.set(this.category() === slug ? null : slug);
    this.activity.set(null);
  }
}
