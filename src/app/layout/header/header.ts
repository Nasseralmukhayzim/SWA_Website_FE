import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { NAV_MENUS } from './nav-menu';

const COPY = {
  ar: {
    nav: 'التنقل الرئيسي',
    home: 'الهيئة السعودية للمياه — الصفحة الرئيسية',
    language: 'English',
    portal: 'بوابة الخدمات',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
  },
  en: {
    nav: 'Main navigation',
    home: 'Saudi Water Authority — home',
    language: 'العربية',
    portal: 'Services Portal',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
} as const;

/** The external services portal the header button points at. */
const PORTAL_URL = 'https://www.swa.gov.sa';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly t = computed(() => (this.isArabic() ? COPY.ar : COPY.en));
  protected readonly portalUrl = PORTAL_URL;

  /** Key of the menu whose panel is open, or null when everything is closed. */
  protected readonly openKey = signal<string | null>(null);
  protected readonly mobileOpen = signal(false);

  protected readonly menus = computed(() => {
    const arabic = this.isArabic();
    return NAV_MENUS.map((menu) => ({
      key: menu.key,
      label: arabic ? menu.ar : menu.en,
      path: menu.path,
      columns: menu.columns.map((column) => ({
        heading: arabic ? column.headingAr : column.headingEn,
        links: column.links.map((link) => ({ path: link.path, label: arabic ? link.ar : link.en })),
      })),
    }));
  });

  constructor() {
    // Any navigation closes whatever is open — otherwise the panel hangs over the new page.
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.openKey.set(null);
      this.mobileOpen.set(false);
    });

    // Switching language re-labels everything; collapse rather than leave a stale panel open.
    effect(() => {
      this.language.language();
      this.openKey.set(null);
    });
  }

  protected toggle(key: string): void {
    this.openKey.update((current) => (current === key ? null : key));
  }

  protected isOpen(key: string): boolean {
    return this.openKey() === key;
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  protected toggleLanguage(): void {
    this.language.toggle();
  }

  protected close(): void {
    this.openKey.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openKey.set(null);
    this.mobileOpen.set(false);
  }

  /** A click anywhere outside the header dismisses an open panel. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.openKey() === null) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.site-header')) {
      this.openKey.set(null);
    }
  }
}
