import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

interface NavItem {
  path: string;
  en: string;
  ar: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', en: 'Home', ar: 'الرئيسية', exact: true },
  { path: '/pages', en: 'About the Authority', ar: 'عن الهيئة' },
  { path: '/services', en: 'E-Services', ar: 'الخدمات الإلكترونية' },
  { path: '/news', en: 'Media Center', ar: 'المركز الإعلامي' },
  { path: '/events', en: 'Events', ar: 'الفعاليات' },
  { path: '/documents', en: 'Regulations', ar: 'الأنظمة و اللوائح' },
  { path: '/faqs', en: 'FAQs', ar: 'الأسئلة الشائعة' },
];

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly language = inject(LanguageService);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly navItems = computed(() => {
    const arabic = this.isArabic();
    return NAV_ITEMS.map((item) => ({
      path: item.path,
      label: arabic ? item.ar : item.en,
      options: { exact: item.exact ?? false },
    }));
  });

  protected readonly navLabel = computed(() => (this.isArabic() ? 'التنقل الرئيسي' : 'Main navigation'));
  protected readonly homeLabel = computed(() => (this.isArabic() ? 'الهيئة السعودية للمياه — الصفحة الرئيسية' : 'Saudi Water Authority — home'));
  protected readonly languageLabel = computed(() => (this.isArabic() ? 'English' : 'العربية'));

  protected toggleLanguage(): void {
    this.language.toggle();
  }
}
