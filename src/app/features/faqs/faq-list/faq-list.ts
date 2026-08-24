import { Component, computed, effect, inject, signal } from '@angular/core';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { FaqListItem } from '../../../core/models/faq.model';

interface FaqGroup {
  categoryName: string;
  faqs: FaqListItem[];
}

@Component({
  selector: 'app-faq-list',
  imports: [],
  templateUrl: './faq-list.html',
  styleUrl: './faq-list.scss',
})
export class FaqList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly faqs = signal<FaqListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly openId = signal<string | null>(null);

  protected readonly groups = computed<FaqGroup[]>(() => {
    const byCategory = new Map<string, FaqListItem[]>();
    for (const faq of this.faqs()) {
      const key = faq.categoryName ?? 'General';
      byCategory.set(key, [...(byCategory.get(key) ?? []), faq]);
    }
    return [...byCategory.entries()].map(([categoryName, faqs]) => ({ categoryName, faqs }));
  });

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.loading.set(true);
      this.error.set(false);
      this.api.getFaqs({ lang, pageSize: 200 }).subscribe({
        next: (result) => {
          this.faqs.set(result.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }
}
