import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { DocumentListItem, DocumentSection } from '../../../core/models/document.model';
import { MediaImage } from '../../../shared/media-image/media-image';

@Component({
  selector: 'app-document-list',
  imports: [RouterLink, MediaImage],
  templateUrl: './document-list.html',
  styleUrl: './document-list.scss',
})
export class DocumentList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly DocumentSection = DocumentSection;
  protected readonly items = signal<DocumentListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly sectionFilter = signal<DocumentSection | null>(null);

  constructor() {
    effect(() => {
      const lang = this.language.language();
      const section = this.sectionFilter();
      this.loading.set(true);
      this.error.set(false);
      this.api.getDocuments(lang, { section: section ?? undefined, pageSize: 100 }).subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected setSectionFilter(section: DocumentSection | null): void {
    this.sectionFilter.set(section);
  }
}
