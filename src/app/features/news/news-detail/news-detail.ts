import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { NewsDetail as NewsDetailModel } from '../../../core/models/news.model';
import { MediaImage } from '../../../shared/media-image/media-image';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink, DatePipe, MediaImage],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly article = signal<NewsDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  constructor() {
    effect(() => {
      const slug = this.paramMap().get('slug');
      const lang = this.language.language();
      if (!slug) {
        return;
      }

      this.loading.set(true);
      this.notFound.set(false);
      this.api.getNewsItem(slug, lang).subscribe({
        next: (article) => {
          this.article.set(article);
          this.loading.set(false);
        },
        error: () => {
          this.article.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }
}
