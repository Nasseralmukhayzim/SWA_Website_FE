import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, catchError } from 'rxjs';
import { ContentApiService } from '../../core/services/content-api.service';
import { LanguageService } from '../../core/services/language.service';
import { MediaAsset } from '../../core/models/media.model';

@Component({
  selector: 'app-media-image',
  imports: [],
  templateUrl: './media-image.html',
  styleUrl: './media-image.scss',
})
export class MediaImage {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  readonly mediaId = input<string | null | undefined>(null);
  readonly alt = input<string>('');
  readonly variant = input<'icon' | 'image' | 'hero'>('image');

  protected readonly broken = signal(false);

  private readonly asset = toSignal(
    toObservable(this.mediaId).pipe(
      switchMap((id) => {
        this.broken.set(false);
        if (!id) return of(null);
        return this.api.getMedia(id).pipe(catchError(() => of(null)));
      }),
    ),
    { initialValue: null as MediaAsset | null },
  );

  protected readonly src = () => this.asset()?.url ?? null;

  /** Image/hero slots always reserve their space — a placeholder shows when there's no media, or the
   *  file itself 404s (e.g. media metadata exists but the referenced file isn't available). Icons are
   *  small decorative accents, so they render nothing rather than a placeholder when unavailable. */
  protected showPlaceholder(): boolean {
    return this.variant() !== 'icon' && (!this.src() || this.broken());
  }

  protected showImage(): boolean {
    return this.variant() === 'icon' ? !!this.src() && !this.broken() : !this.showPlaceholder();
  }

  protected resolvedAlt(): string {
    if (this.alt()) return this.alt();
    const asset = this.asset();
    if (!asset) return '';
    return (this.language.language() === 'ar' ? asset.altTextAr : asset.altTextEn) ?? asset.altTextEn ?? asset.altTextAr ?? '';
  }

  protected onError(): void {
    this.broken.set(true);
  }
}
