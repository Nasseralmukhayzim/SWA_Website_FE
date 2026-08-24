import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { EventDetail as EventDetailModel } from '../../../core/models/event.model';
import { MediaImage } from '../../../shared/media-image/media-image';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, DatePipe, MediaImage],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail {
  private readonly api = inject(ContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly event = signal<EventDetailModel | null>(null);
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
      this.api.getEvent(slug, lang).subscribe({
        next: (event) => {
          this.event.set(event);
          this.loading.set(false);
        },
        error: () => {
          this.event.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }
}
