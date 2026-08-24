import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../../core/services/content-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { EventListItem } from '../../../core/models/event.model';
import { MediaImage } from '../../../shared/media-image/media-image';

/** null = every event, regardless of date. */
export type EventFilter = boolean | null;

@Component({
  selector: 'app-event-list',
  imports: [RouterLink, DatePipe, MediaImage],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList {
  private readonly api = inject(ContentApiService);
  private readonly language = inject(LanguageService);

  protected readonly items = signal<EventListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  // Defaults to all events: the list previously hard-coded upcoming-only, which silently hid the
  // whole archive once every published event was in the past.
  protected readonly upcomingFilter = signal<EventFilter>(null);

  constructor() {
    effect(() => {
      const lang = this.language.language();
      const upcoming = this.upcomingFilter();
      this.loading.set(true);
      this.error.set(false);
      this.api.getEvents({ lang, upcoming: upcoming ?? undefined, pageSize: 30 }).subscribe({
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

  protected setUpcomingFilter(upcoming: EventFilter): void {
    this.upcomingFilter.set(upcoming);
  }
}
