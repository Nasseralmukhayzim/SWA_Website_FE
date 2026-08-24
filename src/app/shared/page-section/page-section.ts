import { Component, computed, input } from '@angular/core';
import { MediaImage } from '../media-image/media-image';
import { PageSection } from '../../core/models/page.model';

@Component({
  selector: 'app-page-section',
  imports: [MediaImage],
  templateUrl: './page-section.html',
  styleUrl: './page-section.scss',
})
export class PageSectionComponent {
  readonly section = input.required<PageSection>();
  readonly tinted = input(false);

  /**
   * 'inline' keeps the home page's compact card (icon beside the title).
   * 'feature' is the content-page treatment: a 48px icon medallion above a centred title.
   */
  readonly variant = input<'inline' | 'feature'>('inline');

  /**
   * A card grid holding a single image-backed item is the design's "About Us Section": heading and
   * prose on the wide side, a fixed-width image opposite — not a card, and not a full-width banner.
   * The item title is dropped in this shape because it restates the section heading.
   */
  readonly isSplit = computed(() => {
    const section = this.section();
    const items = section.items ?? [];
    return this.variant() === 'feature' && section.kind === 'CardGrid' && items.length === 1 && !!items[0].imageId;
  });
}
