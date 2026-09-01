import { AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { PageDetail as PageDetailModel, PageSection } from '../../../core/models/page.model';
import { MediaImage } from '../../../shared/media-image/media-image';
import { PageSectionComponent } from '../../../shared/page-section/page-section';
import { ContactForm } from '../contact-form/contact-form';
import { ContactChannels } from '../contact-channels/contact-channels';
import { RegulationsTable } from '../regulations-table/regulations-table';
import { toProseList } from '../../../core/utils/prose-list';

/** Pages whose design carries a form the CMS cannot express as section content. */
const CONTACT_FORM_SLUG = 'contact-us';

/**
 * The regulations page lists the published documents as a filterable table. That listing is not
 * section content an editor writes — it is the Documents collection — so the page renders the table
 * after its prose rather than expecting a section to hold it.
 */
const REGULATIONS_SLUG = 'regulations-and-laws';

/** The id the opening block is given, so the contents list can link to it like any other section. */
const OVERVIEW_ID = 'overview';

const COPY = {
  ar: {
    crumbLabel: 'مسار التنقل',
    home: 'الرئيسية',
    about: 'عن الهيئة',
    contents: 'في هذه الصفحة',
    overview: 'نبذة عن الهيئة',
    lastModified: 'تاريخ آخر تعديل',
    loading: 'جارٍ التحميل…',
    notFound: 'تعذر العثور على هذه الصفحة.',
    back: 'العودة إلى الصفحات',
  },
  en: {
    crumbLabel: 'Breadcrumb',
    home: 'Home',
    about: 'About the Authority',
    contents: 'On this page',
    overview: 'About the Authority',
    lastModified: 'Last modified',
    loading: 'Loading…',
    notFound: 'This page could not be found.',
    back: 'Back to pages',
  },
} as const;

/** A heading turns into an anchor id; two sections sharing a heading still get distinct ids. */
function sectionId(index: number): string {
  return `section-${index}`;
}

@Component({
  selector: 'app-page-detail',
  imports: [RouterLink, MediaImage, PageSectionComponent, ContactForm, ContactChannels, RegulationsTable, DatePipe],
  templateUrl: './page-detail.html',
  styleUrl: './page-detail.scss',
})
export class PageDetail implements AfterViewInit, OnDestroy {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly language = inject(LanguageService);

  private readonly slug = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly page = signal<PageDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly activeId = signal<string>(OVERVIEW_ID);

  private observer: IntersectionObserver | null = null;

  private readonly isArabic = computed(() => this.language.language() === 'ar');
  protected readonly t = computed(() => (this.isArabic() ? COPY.ar : COPY.en));
  protected readonly overviewId = OVERVIEW_ID;

  protected readonly showContactForm = computed(() => this.page()?.slug === CONTACT_FORM_SLUG);

  protected readonly showRegulations = computed(() => this.page()?.slug === REGULATIONS_SLUG);

  /**
   * On Contact Us the first CardGrid is the channels card that sits beside the form; anything
   * else the editors add still renders as a normal full-width section below it.
   */
  protected readonly channelsSection = computed(
    () => (this.page()?.sections ?? []).find((section) => section.kind === 'CardGrid') ?? null,
  );

  protected readonly otherSections = computed(() =>
    (this.page()?.sections ?? []).filter((section) => section !== this.channelsSection()),
  );

  /**
   * Some pages store the same text as both summary and body; rendering both prints the intro
   * twice. Show the body only when it actually adds something.
   */
  protected readonly bodyText = computed(() => {
    const page = this.page();
    const summary = (page?.summary ?? '').trim();
    const body = (page?.body ?? '').trim();
    return body && body !== summary ? body : null;
  });

  /**
   * The design sets the hero picture beside the run of short prose sections that opens the page —
   * establishment, vision, mission — and lets everything after it run the full column. Taking the
   * leading run rather than a fixed count keeps that shape on pages built differently.
   */
  private readonly leadCount = computed(() => {
    const sections = this.page()?.sections ?? [];
    let count = 0;
    while (count < sections.length && sections[count].kind === 'Text') {
      count += 1;
    }
    // All-prose pages would otherwise put every section beside the picture and leave a long, thin
    // column of text; the picture only ever carries the opening run.
    return count === sections.length ? Math.min(count, 3) : count;
  });

  protected readonly leadSections = computed(() =>
    (this.page()?.sections ?? []).slice(0, this.leadCount()).map((section, index) => ({ section, id: sectionId(index) })),
  );

  protected readonly restSections = computed(() =>
    (this.page()?.sections ?? [])
      .slice(this.leadCount())
      .map((section, index) => ({ section, id: sectionId(index + this.leadCount()) })),
  );

  /** Contents list: the opening block, then every section that carries a heading to link to. */
  protected readonly contents = computed(() => {
    const page = this.page();
    // Regulations runs the table across the full width, with no contents list beside it.
    if (!page || this.showContactForm() || this.showRegulations()) {
      return [];
    }
    const entries: { id: string; label: string }[] = [{ id: OVERVIEW_ID, label: this.t().overview }];
    page.sections.forEach((section, index) => {
      if (section.heading) {
        entries.push({ id: sectionId(index), label: section.heading });
      }
    });
    return entries.length > 1 ? entries : [];
  });

  /**
   * The design draws card blocks, and prose that reads as a list, on a grey sheet; running prose
   * sits straight on the page between them. Both tests are about what the section holds, so they
   * survive an editor reordering or adding sections.
   */
  protected isPanelled(section: PageSection): boolean {
    return section.kind !== 'Text' || toProseList(section.body) !== null;
  }

  constructor() {
    effect(() => {
      const slug = this.slug().get('slug');
      const lang = this.language.language();
      if (slug) {
        this.load(slug, lang);
      }
    });

    // Re-arm the spy whenever the rendered sections change.
    effect(() => {
      this.contents();
      if (this.isBrowser) {
        queueMicrotask(() => this.observeSections());
      }
    });
  }

  ngAfterViewInit(): void {
    this.observeSections();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /**
   * Marks the contents entry for whichever section is currently under the top of the viewport.
   * The band is biased to the upper third so a heading counts as "current" as it arrives rather
   * than only once it has filled the screen.
   */
  private observeSections(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer?.disconnect();

    const targets = (this.host.nativeElement as HTMLElement).querySelectorAll('[data-section-id]');
    if (targets.length === 0) {
      return;
    }

    const visible = new Map<string, number>();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset['sectionId'];
          if (!id) {
            continue;
          }
          if (entry.isIntersecting) {
            visible.set(id, entry.boundingClientRect.top);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size > 0) {
          const [topMost] = [...visible.entries()].sort((a, b) => a[1] - b[1]);
          this.activeId.set(topMost[0]);
        }
      },
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 },
    );

    targets.forEach((target) => this.observer?.observe(target));
  }

  /** Anchor navigation, offset so a heading does not land under the fixed header. */
  protected goTo(event: Event, id: string): void {
    if (!this.isBrowser) {
      return;
    }
    event.preventDefault();
    const target = this.document.getElementById(id);
    if (!target) {
      return;
    }
    this.activeId.set(id);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private load(slug: string, lang: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.activeId.set(OVERVIEW_ID);
    this.api.getPage(slug, lang).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.page.set(null);
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }
}
