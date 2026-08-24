import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppLanguage = 'en' | 'ar';

const STORAGE_KEY = 'swa-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly language = signal<AppLanguage>(this.readInitialLanguage());

  constructor() {
    this.applyToDocument(this.language());
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    this.applyToDocument(language);
    if (this.isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }

  toggle(): void {
    this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
  }

  get isRtl(): boolean {
    return this.language() === 'ar';
  }

  private readInitialLanguage(): AppLanguage {
    if (this.isBrowser) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
    }
    return 'en';
  }

  private applyToDocument(language: AppLanguage): void {
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }
}
