import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

const COPY = {
  ar: {
    registered: 'موقع حكومي مسجل لدى هيئة الحكومة الرقمية',
    how: 'كيف تتحقق؟',
    urlTitle: 'روابط المواقع الحكومية الرسمية تنتهي بـ',
    urlSuffix: '.gov.sa',
    urlBody: 'الموقع ينتمي إلى جهة حكومية رسمية في المملكة العربية السعودية وينتهي دائمًا بـ .gov.sa',
    httpsTitle: 'المواقع الموثوقة الرسمية تستخدم',
    httpsSuffix: 'HTTPS',
    httpsBody: 'تأكد من أن الموقع يستخدم بروتوكول HTTPS.',
    registryLabel: 'مسجل في هيئة الحكومة الرقمية:',
    flagAlt: 'شعار المملكة العربية السعودية',
    dgaAlt: 'هيئة الحكومة الرقمية',
  },
  en: {
    registered: 'A government website registered with the Digital Government Authority.',
    how: 'How you know?',
    urlTitle: 'Official Saudi Government websites URL ends with',
    urlSuffix: '.gov.sa',
    urlBody:
      'Website belongs to an official government organization in the Kingdom of Saudi Arabia always ends with .gov.sa',
    httpsTitle: 'Official Reliable websites use',
    httpsSuffix: 'HTTPS',
    httpsBody: 'Ensure the website is using the HTTPS protocol.',
    registryLabel: 'Registered on Digital Government Authority:',
    flagAlt: 'Kingdom of Saudi Arabia emblem',
    dgaAlt: 'Digital Government Authority',
  },
} as const;

/** The registration number shown in the design. */
const REGISTRY_NUMBER = '20250417616';

@Component({
  selector: 'app-digital-stamp',
  templateUrl: './digital-stamp.html',
  styleUrl: './digital-stamp.scss',
})
export class DigitalStamp {
  private readonly language = inject(LanguageService);

  protected readonly expanded = signal(false);
  protected readonly registryNumber = REGISTRY_NUMBER;
  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  protected toggle(): void {
    this.expanded.update((open) => !open);
  }
}
