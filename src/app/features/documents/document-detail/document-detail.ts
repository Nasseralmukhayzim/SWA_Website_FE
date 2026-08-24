import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { DocumentDetail as DocumentDetailModel } from '../../../core/models/document.model';
import { MediaAsset } from '../../../core/models/media.model';
import { MediaImage } from '../../../shared/media-image/media-image';

@Component({
  selector: 'app-document-detail',
  imports: [RouterLink, MediaImage],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.scss',
})
export class DocumentDetail {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly document = signal<DocumentDetailModel | null>(null);
  protected readonly file = signal<MediaAsset | null>(null);
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
      this.file.set(null);
      this.api.getDocument(slug, lang).subscribe({
        next: (document) => {
          this.document.set(document);
          this.loading.set(false);
          if (document.fileId) {
            this.api.getMedia(document.fileId).subscribe({ next: (media) => this.file.set(media) });
          }
        },
        error: () => {
          this.document.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }
}
