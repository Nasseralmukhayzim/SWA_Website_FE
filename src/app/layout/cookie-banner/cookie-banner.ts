import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

const STORAGE_KEY = 'swa-cookie-consent';

const COPY = {
  ar: {
    title: 'ملفات الارتباط',
    body:
      'نستخدم ملفات الارتباط لتحسين تجربة التصفح. وباستمرارك في تصفح هذا الموقع، فإنك تقر بذلك ' +
      'وتوافق على استخدام ملفات الارتباط.',
    policy: 'سياسة الخصوصية',
    accept: 'قبول',
    reject: 'رفض',
    manage: 'إدارة ملفات الارتباط',
    close: 'إغلاق',
    region: 'إشعار ملفات الارتباط',
  },
  en: {
    title: 'Cookies',
    body:
      'We use cookies to improve your browsing experience. By continuing to browse this website, ' +
      'you acknowledge and accept the use of cookies.',
    policy: 'Privacy Policy',
    accept: 'Accept',
    reject: 'Reject',
    manage: 'Manage Cookies',
    close: 'Close',
    region: 'Cookie notice',
  },
} as const;

@Component({
  selector: 'app-cookie-banner',
  imports: [RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner {
  private readonly language = inject(LanguageService);

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  /**
   * Hidden once a choice has been recorded. Reading storage in a field initialiser keeps the
   * banner out of the server-rendered markup's way — on the server there is no storage, so it
   * renders and then settles on the client.
   */
  protected readonly visible = signal(!this.storedChoice());

  private storedChoice(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private record(choice: 'accepted' | 'rejected'): void {
    try {
      window.localStorage?.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage can be blocked; dismissing for this session is still better than nothing.
    }
    this.visible.set(false);
  }

  protected accept(): void {
    this.record('accepted');
  }

  protected reject(): void {
    this.record('rejected');
  }

  /** No preference centre exists yet, so "manage" is treated as a decline until one does. */
  protected manage(): void {
    this.record('rejected');
  }

  protected dismiss(): void {
    this.visible.set(false);
  }
}
