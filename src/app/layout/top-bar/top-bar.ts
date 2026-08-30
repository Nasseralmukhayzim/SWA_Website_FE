import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

const COPY = {
  ar: { city: 'الرياض', search: 'البحث في الموقع', locale: 'ar-SA' },
  en: { city: 'Riyadh', search: 'Search the site', locale: 'en-GB' },
} as const;

/** Riyadh is UTC+3 year round, so the clock is offset rather than left on the visitor's zone. */
const RIYADH_OFFSET_MINUTES = 3 * 60;

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  private readonly language = inject(LanguageService);

  /** Set once on construction; the design shows a static stamp rather than a ticking clock. */
  private readonly now = signal(new Date());

  protected readonly t = computed(() => (this.language.language() === 'ar' ? COPY.ar : COPY.en));

  private readonly riyadhNow = computed(() => {
    const date = this.now();
    return new Date(date.getTime() + (RIYADH_OFFSET_MINUTES + date.getTimezoneOffset()) * 60_000);
  });

  protected readonly date = computed(() => {
    const { locale } = this.t();
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      this.riyadhNow(),
    );
  });

  protected readonly time = computed(() => {
    const { locale } = this.t();
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: true }).format(
      this.riyadhNow(),
    );
  });
}
