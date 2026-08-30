import { Component, computed, input } from '@angular/core';
import { MediaImage } from '../media-image/media-image';
import { PageSection } from '../../core/models/page.model';
import { toProseList } from '../../core/utils/prose-list';

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
   * Content pages give each section heading a leading accent rule; the home page does not.
   * Exposed as an input rather than overridden from outside so the rule stays with the component
   * that owns it.
   */
  readonly plainHeading = input(false);

  /**
   * Draw the section inside the design's tinted, rounded panel. Content pages use it to pick out
   * their card blocks from the prose that runs between them.
   */
  readonly panelled = input(false);

  /**
   * Drop the section's own vertical padding and container. Set when the host already places the
   * section inside a column of its own, as the content pages' two-column layout does.
   */
  readonly flush = input(false);

  /**
   * Opt in to the home page's bespoke section shapes. They are inferred from the shape of a
   * section's items, and plenty of content-page sections happen to share that shape without sharing
   * the design — so they stay off unless a host asks for them.
   */
  readonly autoLayout = input(false);

  /**
   * The designs fit cards four to a row when they divide evenly into fours and three otherwise, so
   * a block never ends on a row with a single narrow card beside two gaps.
   */
  readonly cardColumns = computed(() => ((this.section().items ?? []).length % 4 === 0 ? 4 : 3));

  /**
   * True when the final card would be left alone on its own row. The design runs that card the full
   * width of the block instead.
   */
  readonly lastCardSpans = computed(() => {
    const count = (this.section().items ?? []).length;
    const columns = this.cardColumns();
    return count > columns && count % columns === 1;
  });

  /**
   * A text section whose body reads as a list of short statements is drawn as one, the way the
   * designs do, rather than run together into a single paragraph.
   */
  readonly bodyList = computed(() =>
    this.section().kind === 'Text' ? toProseList(this.section().body) : null,
  );

  /**
   * How a card grid is laid out. The CMS has no layout flag, so this reads the shape of the items
   * the way the design does:
   *
   * - `split`  one image-backed item — the "About Us" shape: heading and prose on the wide side, a
   *            fixed-width image opposite. The item title is dropped because it restates the heading.
   * - `logos`  marks with names and no prose — the design's logo strip. Without it the grid gives
   *            each entity a full card, leaving a large empty box wherever a logo is missing. At
   *            least one item has to carry a picture, or this is a plain list of names that belongs
   *            in cards rather than in a row of empty tiles.
   * - `panel`  pictures with prose — cards inside the design's tinted panel.
   * - `cards`  the default grid.
   */
  readonly layout = computed<'split' | 'logos' | 'panel' | 'cards'>(() => {
    const section = this.section();
    const items = section.items ?? [];

    if (section.kind !== 'CardGrid' || this.variant() !== 'feature' || items.length === 0) {
      return 'cards';
    }
    if (items.length === 1 && items[0].imageId) {
      return 'split';
    }
    if (!this.autoLayout()) {
      return 'cards';
    }
    if (items.every((item) => !item.description) && items.some((item) => !!item.imageId)) {
      return 'logos';
    }
    if (items.every((item) => !!item.imageId)) {
      return 'panel';
    }
    return 'cards';
  });
}
