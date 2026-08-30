import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

type FieldKind = 'text' | 'email' | 'tel' | 'select' | 'textarea';

interface Field {
  readonly id: string;
  readonly kind: FieldKind;
  readonly ar: string;
  readonly en: string;
  readonly placeholderAr: string;
  readonly placeholderEn: string;
}

interface Tab {
  readonly key: 'contact' | 'developers';
  readonly ar: string;
  readonly en: string;
  /** Each entry is one row; a row holds one or two fields, as the design lays them out. */
  readonly rows: readonly (readonly Field[])[];
}

const f = (
  id: string,
  kind: FieldKind,
  ar: string,
  en: string,
  placeholderAr: string,
  placeholderEn: string,
): Field => ({ id, kind, ar, en, placeholderAr, placeholderEn });

const CHOOSE_AR = 'إختيار';
const CHOOSE_EN = 'Select';

/**
 * The two form variants from Figma nodes 3145:27791 (نموذج التواصل) and 3140:24137
 * (استفسارات المطورين العقاريين). Fields are listed in reading order, so the first of a pair
 * lands on the right in Arabic and the left in English.
 */
const TABS: readonly Tab[] = [
  {
    key: 'contact',
    ar: 'نموذج التواصل',
    en: 'Contact form',
    rows: [
      [
        f('full-name', 'text', 'الأسم الثلاثي', 'Full name', 'ادخل الاسم الثلاثي', 'Enter your full name'),
        f('national-id', 'text', 'رقم الهوية / الإقامة', 'National ID / Iqama', 'ادخل رقم الهوية / الإقامة', 'Enter your ID number'),
      ],
      [
        f('email', 'email', 'البريد الإلكتروني', 'Email', 'ادخل البريد الإلكتروني', 'Enter your email'),
        f('mobile', 'tel', 'رقم الجوال', 'Mobile number', '00 000 0000', '00 000 0000'),
      ],
      [
        f('message-type', 'select', 'نوع الرسالة', 'Message type', CHOOSE_AR, CHOOSE_EN),
        f('subject', 'select', 'الموضوع', 'Subject', CHOOSE_AR, CHOOSE_EN),
      ],
      [f('message', 'textarea', 'محتوى الرسالة', 'Message', 'ادخل محتوى الرسالة', 'Enter your message')],
    ],
  },
  {
    key: 'developers',
    ar: 'استفسارات المطورين العقاريين',
    en: 'Real-estate developer enquiries',
    rows: [
      [
        f('developer-name', 'text', 'اسم المطور', 'Developer name', 'ادخل اسم المطور', 'Enter the developer name'),
        f('project-address', 'text', 'عنوان المشروع', 'Project address', 'ادخل عنوان المشروع', 'Enter the project address'),
      ],
      [
        f('agent-first', 'text', 'اسم المفوض الاول', 'First authorised agent', 'ادخل اسم المفوض الاول', 'Enter the first agent’s name'),
        f('agent-last', 'text', 'اسم المفوض الأخير', 'Second authorised agent', 'ادخل اسم المفوض الأخير', 'Enter the second agent’s name'),
      ],
      [
        f('dev-email', 'email', 'البريد الإلكتروني', 'Email', 'ادخل البريد الإلكتروني', 'Enter your email'),
        f('dev-mobile', 'tel', 'رقم الجوال', 'Mobile number', '00 000 0000', '00 000 0000'),
      ],
      [
        f('region', 'select', 'المنطقة', 'Region', CHOOSE_AR, CHOOSE_EN),
        f('city', 'select', 'المدينة', 'City', CHOOSE_AR, CHOOSE_EN),
      ],
      [f('dev-subject', 'text', 'الموضوع', 'Subject', 'ادخل الموضوع', 'Enter the subject')],
      [f('dev-message', 'textarea', 'محتوى الرسالة', 'Message', 'ادخل محتوى الرسالة', 'Enter your message')],
    ],
  },
];

const COPY = {
  ar: {
    required: 'حقل مطلوب',
    attach: 'إرفاق ملف',
    attachHint: 'الحد الأقصى لحجم الملف المسموح به هو 2 ميجابايت، وتشمل الصيغ المدعومة .jpg و .png و .pdf.',
    browse: 'تصفح الملفات',
    submit: 'إرسال الرسالة',
    tabsLabel: 'اختيار النموذج',
  },
  en: {
    required: 'Required field',
    attach: 'Attach a file',
    attachHint: 'Maximum file size is 2 MB. Supported formats are .jpg, .png and .pdf.',
    browse: 'Browse files',
    submit: 'Send message',
    tabsLabel: 'Choose a form',
  },
} as const;

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly language = inject(LanguageService);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly active = signal<Tab['key']>('contact');
  protected readonly t = computed(() => (this.isArabic() ? COPY.ar : COPY.en));

  protected readonly tabs = computed(() =>
    TABS.map((tab) => ({ key: tab.key, label: this.isArabic() ? tab.ar : tab.en })),
  );

  protected readonly rows = computed(() => {
    const arabic = this.isArabic();
    const tab = TABS.find((entry) => entry.key === this.active()) ?? TABS[0];
    return tab.rows.map((row) =>
      row.map((field) => ({
        id: field.id,
        kind: field.kind,
        label: arabic ? field.ar : field.en,
        placeholder: arabic ? field.placeholderAr : field.placeholderEn,
      })),
    );
  });

  protected select(key: Tab['key']): void {
    this.active.set(key);
  }
}
