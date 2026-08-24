import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/services/content-api.service';
import { LanguageService } from '../../core/services/language.service';
import { NewsListItem } from '../../core/models/news.model';
import { PageDetail } from '../../core/models/page.model';
import { MediaImage } from '../../shared/media-image/media-image';
import { PageSectionComponent } from '../../shared/page-section/page-section';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MediaImage, PageSectionComponent, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly homePage = signal<PageDetail | null>(null);
  protected readonly latestNews = signal<NewsListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly aboutHeading = computed(() => (this.language.language() === 'ar' ? 'عن الهيئة' : 'About the Authority'));

  constructor() {
    effect(() => {
      const lang = this.language.language();
      this.load(lang);
    });
  }

  private load(lang: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.api.getPage('home', lang).subscribe({
      next: (page) => this.homePage.set(page),
      error: () => this.homePage.set(null),
    });

    this.api.getNews({ lang, page: 1, pageSize: 3 }).subscribe({
      next: (result) => {
        this.latestNews.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
