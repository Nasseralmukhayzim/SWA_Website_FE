import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  ServiceDeliveryType,
  ServiceDetail as ServiceDetailModel,
  ServiceListItem,
} from '../../../core/models/service.model';
import { MediaImage } from '../../../shared/media-image/media-image';

type TabKey = 'steps' | 'requiredDocuments' | 'terms' | 'objectives';
type FactIcon = 'audience' | 'duration' | 'channels' | 'fee' | 'phone';
/** Matches the three tag colourways in the design: neutral, green and blue. */
type TagTone = 'neutral' | 'success' | 'info';

interface Tab {
  key: TabKey;
  label: string;
  /** Already split into lines so the template can render an ordered/unordered list. */
  lines: string[];
}

const CTA_LABELS: Record<ServiceDeliveryType, { en: string; ar: string }> = {
  [ServiceDeliveryType.Request]: { en: 'Start service', ar: 'ابدأ الخدمة' },
  [ServiceDeliveryType.Inquiry]: { en: 'Make an inquiry', ar: 'الاستعلام' },
  [ServiceDeliveryType.Calculator]: { en: 'Open calculator', ar: 'فتح الحاسبة' },
  [ServiceDeliveryType.Payment]: { en: 'Pay now', ar: 'ادفع الآن' },
  [ServiceDeliveryType.External]: { en: 'Go to service', ar: 'الانتقال للخدمة' },
};

const TEXT = {
  en: {
    home: 'Home',
    services: 'E-services',
    breadcrumb: 'Breadcrumb',
    steps: 'Steps',
    requiredDocuments: 'Required documents',
    terms: 'Terms of use',
    objectives: 'Objectives',
    audience: 'Target audience',
    duration: 'Service duration',
    channels: 'Service channels',
    fee: 'Service cost',
    phone: 'Phone',
    faq: 'Frequently asked questions',
    faqLink: 'SWA-FAQ’s page',
    guideTitle: 'Service guide',
    guide: 'Download the user guide',
    relatedTitle: 'Related services',
    viewAll: 'View all',
    viewDetails: 'View details',
    commentsTitle: 'Comments and suggestions',
    commentsBody:
      'For any question or feedback about government services, please fill in the required information.',
    contactUs: 'Contact us',
    lastModified: 'Last modified',
    notFound: 'This service could not be found.',
    back: 'Back to services',
    loading: 'Loading…',
  },
  ar: {
    home: 'الرئيسية',
    services: 'الخدمات الإلكترونية',
    breadcrumb: 'مسار التنقل',
    steps: 'الخطوات',
    requiredDocuments: 'المستندات المطلوبة',
    terms: 'شروط الاستخدام',
    objectives: 'الأهداف',
    audience: 'الفئة المستهدفة',
    duration: 'مدة الخدمة',
    channels: 'قنوات تقديم الخدمة',
    fee: 'تكلفة الخدمة',
    phone: 'الهاتف',
    faq: 'الاسئلة الشائعة',
    faqLink: 'SWA-FAQ’s page',
    guideTitle: 'دليل الخدمة',
    guide: 'تحميل دليل المستخدم',
    relatedTitle: 'خدمات ذات صلة',
    viewAll: 'عرض الكل',
    viewDetails: 'عرض التفاصيل',
    commentsTitle: 'التعليقات والاقتراحات',
    commentsBody: 'لأي استفسار أو ملاحظات حول الخدمات الحكومية، يرجى ملء المعلومات المطلوبة.',
    contactUs: 'تواصل معنا',
    lastModified: 'تاريخ آخر تعديل',
    notFound: 'تعذر العثور على هذه الخدمة.',
    back: 'العودة إلى الخدمات',
    loading: 'جارٍ التحميل…',
  },
};

/** Content is authored as newline-separated lines, often already prefixed "1- " / "1." / "- ". */
function toLines(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(\d+\s*[-.)]|[-•*])\s*/, '').trim())
    .filter((line) => line.length > 0);
}

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, MediaImage, DatePipe],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss',
})
export class ServiceDetail {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly service = signal<ServiceDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly guideUrl = signal<string | null>(null);
  protected readonly related = signal<ServiceListItem[]>([]);

  private readonly activeTabKey = signal<TabKey | null>(null);

  // Dates render through DatePipe's default locale: only en-US locale data ships by default, and
  // passing an unregistered locale (ar-SA) throws at runtime rather than falling back.
  protected readonly t = computed(() => (this.language.language() === 'ar' ? TEXT.ar : TEXT.en));

  protected readonly ctaLabel = computed(() => {
    const service = this.service();
    if (!service) {
      return '';
    }
    const labels = CTA_LABELS[service.deliveryType] ?? CTA_LABELS[ServiceDeliveryType.External];
    return this.language.language() === 'ar' ? labels.ar : labels.en;
  });

  /**
   * The tags under the title, in the design's reading order: who the service is for, which family
   * it belongs to, then where it sits in the water value chain — one colourway each.
   */
  protected readonly tags = computed<{ label: string; tone: TagTone }[]>(() => {
    const service = this.service();
    if (!service) {
      return [];
    }
    return [
      ...service.audienceNames.map((label) => ({ label, tone: 'neutral' as const })),
      ...(service.categoryName ? [{ label: service.categoryName, tone: 'success' as const }] : []),
      ...(service.activityTypeName ? [{ label: service.activityTypeName, tone: 'info' as const }] : []),
    ];
  });

  /** Only tabs that actually carry content, so an empty service shows no empty tab strip. */
  protected readonly tabs = computed<Tab[]>(() => {
    const service = this.service();
    if (!service) {
      return [];
    }
    const t = this.t();
    return (
      [
        { key: 'steps' as const, label: t.steps, lines: toLines(service.steps) },
        { key: 'terms' as const, label: t.terms, lines: toLines(service.terms) },
        { key: 'requiredDocuments' as const, label: t.requiredDocuments, lines: toLines(service.requiredDocuments) },
        { key: 'objectives' as const, label: t.objectives, lines: toLines(service.objectives) },
      ] satisfies Tab[]
    ).filter((tab) => tab.lines.length > 0);
  });

  protected readonly activeTab = computed<Tab | null>(() => {
    const tabs = this.tabs();
    if (tabs.length === 0) {
      return null;
    }
    return tabs.find((tab) => tab.key === this.activeTabKey()) ?? tabs[0];
  });

  /** The card's first block: the plain label/value facts, each with its own icon. */
  protected readonly facts = computed<{ icon: FactIcon; label: string; value: string }[]>(() => {
    const service = this.service();
    if (!service) {
      return [];
    }
    const t = this.t();
    return [
      { icon: 'audience' as const, label: t.audience, value: service.audienceNames.join('، ') },
      { icon: 'duration' as const, label: t.duration, value: service.deliveryTime ?? '' },
      { icon: 'channels' as const, label: t.channels, value: service.channelNames.join(' - ') },
      { icon: 'fee' as const, label: t.fee, value: service.fee ?? '' },
    ].filter((fact) => fact.value.length > 0);
  });

  /**
   * The card's second block. These read as links rather than plain values, and the design gives
   * only the phone row an icon — the FAQ row is deliberately icon-less.
   */
  protected readonly contactLinks = computed(() => {
    const service = this.service();
    if (!service) {
      return [];
    }
    const t = this.t();
    return [
      { key: 'faq', icon: null, label: t.faq, value: t.faqLink, route: '/faqs', href: null },
      ...(service.supportPhone
        ? [
            {
              key: 'phone',
              icon: 'phone' as const,
              label: t.phone,
              value: service.supportPhone,
              route: null,
              href: `tel:${service.supportPhone}`,
            },
          ]
        : []),
    ];
  });

  constructor() {
    effect(() => {
      const slug = this.paramMap().get('slug');
      const lang = this.language.language();
      if (!slug) {
        return;
      }

      this.loading.set(true);
      this.notFound.set(false);
      this.activeTabKey.set(null);
      this.guideUrl.set(null);
      this.related.set([]);

      this.api.getService(slug, lang).subscribe({
        next: (service) => {
          this.service.set(service);
          this.loading.set(false);
          if (service.guideFileId) {
            this.api.getMedia(service.guideFileId).subscribe({
              next: (asset) => this.guideUrl.set(asset.url),
              error: () => this.guideUrl.set(null),
            });
          }
          this.loadRelated(service, lang);
        },
        error: () => {
          this.service.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  /**
   * "Related" means the same service family. The list endpoint takes a category id and this page
   * only holds the slug, so it filters the (small) published list client-side rather than spending
   * a round trip resolving the lookup first.
   */
  private loadRelated(service: ServiceDetailModel, lang: string): void {
    if (!service.categorySlug) {
      return;
    }
    this.api.getServices(lang, { pageSize: 100 }).subscribe({
      next: (result) => {
        this.related.set(
          result.items
            .filter((item) => item.categorySlug === service.categorySlug && item.slug !== service.slug)
            .slice(0, 3),
        );
      },
      error: () => this.related.set([]),
    });
  }

  protected selectTab(key: TabKey): void {
    this.activeTabKey.set(key);
  }
}
