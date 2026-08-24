import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { PageListItem } from '../../../core/models/page.model';

@Component({
  selector: 'app-page-list',
  imports: [RouterLink],
  templateUrl: './page-list.html',
  styleUrl: './page-list.scss',
})
export class PageList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly pages = signal<PageListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.api.getPages({ lang: this.language.language(), pageSize: 100 }).subscribe({
      next: (result) => {
        this.pages.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
