import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { PageDetail as PageDetailModel } from '../../../core/models/page.model';
import { MediaImage } from '../../../shared/media-image/media-image';
import { PageSectionComponent } from '../../../shared/page-section/page-section';
import { ContactForm } from '../contact-form/contact-form';

/** Pages whose design carries a form the CMS cannot express as section content. */
const CONTACT_FORM_SLUG = 'contact-us';

@Component({
  selector: 'app-page-detail',
  imports: [RouterLink, MediaImage, PageSectionComponent, ContactForm],
  templateUrl: './page-detail.html',
  styleUrl: './page-detail.scss',
})
export class PageDetail {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  private readonly slug = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly page = signal<PageDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly crumbLabel = computed(() => (this.isArabic() ? 'مسار التنقل' : 'Breadcrumb'));
  protected readonly crumbHome = computed(() => (this.isArabic() ? 'الرئيسية' : 'Home'));
  protected readonly crumbAbout = computed(() => (this.isArabic() ? 'عن الهيئة' : 'About the Authority'));

  protected readonly showContactForm = computed(() => this.page()?.slug === CONTACT_FORM_SLUG);

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

  constructor() {
    effect(() => {
      const slug = this.slug().get('slug');
      const lang = this.language.language();
      if (slug) {
        this.load(slug, lang);
      }
    });
  }

  private load(slug: string, lang: string): void {
    this.loading.set(true);
    this.notFound.set(false);
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
