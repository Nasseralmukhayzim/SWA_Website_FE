import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

interface FooterLink {
  en: string;
  ar: string;
  routerLink?: string;
  href?: string;
}

interface FooterGroup {
  en: string;
  ar: string;
  links: FooterLink[];
}

interface SocialChannel {
  name: string;
  icon: string;
  /** Official account URL. Left undefined until the real handle is supplied, in which case the
   *  icon renders as a non-interactive mark rather than a link that goes nowhere. */
  url?: string;
  /** The design places LinkedIn as a bare 32px mark rather than a bordered icon button. */
  bare?: boolean;
}

// Ordered as the design reads: About first, social channels last.
const GROUPS: FooterGroup[] = [
  {
    en: 'About the Authority',
    ar: 'عن الهيئة',
    links: [
      { en: 'Overview', ar: 'لمحة عن الهيئة', routerLink: '/pages' },
      { en: 'Organizational structure', ar: 'الهيكل التنظيمي', routerLink: '/pages/organizational-structure' },
      { en: 'Board of directors', ar: 'مجلس الإدارة', routerLink: '/pages/board-of-directors' },
      { en: 'Sustainability', ar: 'الإستدامة', routerLink: '/pages/sustainability' },
      { en: 'Site map', ar: 'خريطة الموقع', routerLink: '/pages/sitemap' },
    ],
  },
  {
    en: 'Regulations and policies',
    ar: 'الأنظمة و السياسات',
    links: [
      { en: 'Documents and regulations', ar: 'الوثائق و اللوائح', routerLink: '/documents' },
      { en: 'Regulations, bylaws and decisions', ar: 'الأنظمة و اللوائح و القرارات', routerLink: '/pages/regulations-and-laws' },
      { en: 'Sector governance', ar: 'حوكمة القطاع', routerLink: '/pages/sector-governance' },
      { en: 'Licensing governance', ar: 'حوكمة التراخيص', routerLink: '/pages/licensing-governance' },
    ],
  },
  {
    en: 'Support and help',
    ar: 'الدعم و المساعدة',
    links: [
      { en: 'Frequently asked questions', ar: 'الأسئلة الشائعة', routerLink: '/faqs' },
      { en: 'E-services', ar: 'الخدمات الإلكترونية', routerLink: '/services' },
      { en: 'E-participation', ar: 'المشاركة الإلكترونية', routerLink: '/pages/e-participation' },
      { en: 'Tenders and procurement', ar: 'المنافسات و المشتريات', routerLink: '/pages/tenders-and-procurement' },
    ],
  },
  {
    en: 'Related links',
    ar: 'روابط ذات صلة',
    links: [
      { en: 'Ministry of Environment, Water and Agriculture', ar: 'وزارة البيئة و المياه و الزراعة', href: 'https://www.mewa.gov.sa' },
      { en: 'Unified National Platform', ar: 'المنصة الوطنية الموحدة', href: 'https://my.gov.sa' },
      { en: 'Invest Saudi', ar: 'استثمر في السعودية', href: 'https://investsaudi.sa' },
      { en: 'Etimad Platform', ar: 'منصة اعتماد', href: 'https://etimad.sa' },
    ],
  },
];

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly language = inject(LanguageService);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly year = new Date().getFullYear();

  protected readonly socialChannels: SocialChannel[] = [
    { name: 'Facebook', icon: '/brand/social-facebook.svg' },
    { name: 'Instagram', icon: '/brand/social-instagram.svg' },
    { name: 'Snapchat', icon: '/brand/social-snapchat.svg' },
    { name: 'LinkedIn', icon: '/brand/social-linkedin.svg', bare: true },
    { name: 'X', icon: '/brand/social-x.svg' },
    { name: 'YouTube', icon: '/brand/social-youtube.svg' },
    { name: 'TikTok', icon: '/brand/social-tiktok.svg' },
  ];

  protected readonly groups = computed(() => {
    const arabic = this.isArabic();
    return GROUPS.map((group) => ({
      heading: arabic ? group.ar : group.en,
      links: group.links.map((link) => ({
        label: arabic ? link.ar : link.en,
        routerLink: link.routerLink,
        href: link.href,
      })),
    }));
  });

  protected readonly socialHeading = computed(() => (this.isArabic() ? 'منصات التواصل الاجتماعي الرسمية' : 'Official social media channels'));

  protected readonly address = computed(() =>
    this.isArabic()
      ? 'عنوان الفرع الرئيسي: حي العليا – طريق الأمير محمد بن عبدالعزيز – الرياض 11432 – ص.ب 5968'
      : 'Head office: Al Olaya District – Prince Mohammed bin Abdulaziz Road – Riyadh 11432 – P.O. Box 5968',
  );

  protected readonly copyright = computed(() =>
    this.isArabic()
      ? `جميع الحقوق محفوظة للهيئة السعودية للمياه © ${this.year}`
      : `© ${this.year} Saudi Water Authority. All rights reserved.`,
  );

  protected readonly authorityName = computed(() => (this.isArabic() ? 'الهيئة السعودية للمياه' : 'Saudi Water Authority'));
}
