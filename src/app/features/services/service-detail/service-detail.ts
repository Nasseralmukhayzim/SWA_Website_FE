import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { ServiceDeliveryType, ServiceDetail as ServiceDetailModel } from '../../../core/models/service.model';
import { MediaImage } from '../../../shared/media-image/media-image';

type TabKey = 'steps' | 'requiredDocuments' | 'terms' | 'objectives';

interface Tab {
  key: TabKey;
  label: string;
  /** Already split into lines so the template can render an ordered/unordered list. */
  lines: string[];
}

const CTA_LABELS: Record<ServiceDeliveryType, { en: string; ar: string }> = {
  [ServiceDeliveryType.Request]: { en: 'Start service', ar: 'بدء الخدمة' },
  [ServiceDeliveryType.Inquiry]: { en: 'Make an inquiry', ar: 'الاستعلام' },
  [ServiceDeliveryType.Calculator]: { en: 'Open calculator', ar: 'فتح الحاسبة' },
  [ServiceDeliveryType.Payment]: { en: 'Pay now', ar: 'ادفع الآن' },
  [ServiceDeliveryType.External]: { en: 'Go to service', ar: 'الانتقال للخدمة' },
};

const TEXT = {
  en: {
    services: 'Services',
    steps: 'Steps',
    requiredDocuments: 'Required documents',
    terms: 'Terms of use',
    objectives: 'Objectives',
    audience: 'Target audience',
    duration: 'Service duration',
    channels: 'Service channels',
    fee: 'Service cost',
    phone: 'Phone',
    guide: 'Download the user guide',
    lastModified: 'Last modified',
    notFound: 'This service could not be found.',
    back: 'Back to services',
    loading: 'Loading…',
  },
  ar: {
    services: 'الخدمات',
    steps: 'الخطوات',
    requiredDocuments: 'المستندات المطلوبة',
    terms: 'شروط الاستخدام',
    objectives: 'الأهداف',
    audience: 'الفئة المستهدفة',
    duration: 'مدة الخدمة',
    channels: 'قنوات الخدمة',
    fee: 'تكلفة الخدمة',
    phone: 'الهاتف',
    guide: 'تحميل دليل المستخدم',
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
        { key: 'requiredDocuments' as const, label: t.requiredDocuments, lines: toLines(service.requiredDocuments) },
        { key: 'terms' as const, label: t.terms, lines: toLines(service.terms) },
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

  protected readonly facts = computed(() => {
    const service = this.service();
    if (!service) {
      return [];
    }
    const t = this.t();
    return [
      { icon: 'audience', label: t.audience, value: service.audienceNames.join('، ') },
      { icon: 'duration', label: t.duration, value: service.deliveryTime ?? '' },
      { icon: 'channels', label: t.channels, value: service.channelNames.join('، ') },
      { icon: 'fee', label: t.fee, value: service.fee ?? '' },
      { icon: 'phone', label: t.phone, value: service.supportPhone ?? '' },
    ].filter((fact) => fact.value.length > 0);
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
        },
        error: () => {
          this.service.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected selectTab(key: TabKey): void {
    this.activeTabKey.set(key);
  }
}
