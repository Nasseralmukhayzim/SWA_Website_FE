import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { PageSection, PageSectionItem } from '../../../core/models/page.model';
import { MediaImage } from '../../../shared/media-image/media-image';

/** The seven channels the footer already carries, reused for the card's social row. */
const SOCIAL = [
  { name: 'X', icon: '/brand/social-x.svg' },
  { name: 'YouTube', icon: '/brand/social-youtube.svg' },
  { name: 'LinkedIn', icon: '/brand/social-linkedin.svg' },
  { name: 'Instagram', icon: '/brand/social-instagram.svg' },
  { name: 'Facebook', icon: '/brand/social-facebook.svg' },
  { name: 'TikTok', icon: '/brand/social-tiktok.svg' },
  { name: 'Snapchat', icon: '/brand/social-snapchat.svg' },
] as const;

interface Channel {
  readonly title: string;
  readonly iconId: string | null;
  readonly imageId: string | null;
  /** First line of the description — the number, address, handle or code the design highlights. */
  readonly value: string | null;
  readonly href: string | null;
  /** Anything after the first line, e.g. the postal address under the national address code. */
  readonly detail: string | null;
}

@Component({
  selector: 'app-contact-channels',
  imports: [MediaImage],
  templateUrl: './contact-channels.html',
  styleUrl: './contact-channels.scss',
})
export class ContactChannels {
  private readonly language = inject(LanguageService);

  readonly section = input.required<PageSection>();

  protected readonly socialChannels = SOCIAL;

  protected readonly mapAlt = computed(() =>
    this.language.language() === 'ar' ? 'موقع المقر الرئيسي على الخريطة' : 'Head office location map',
  );

  /**
   * The final item in the section is the social-platforms heading, which the design renders as a
   * row of buttons rather than another channel row.
   */
  private readonly entries = computed(() => this.section().items ?? []);

  protected readonly socialItem = computed<PageSectionItem | null>(() => {
    const items = this.entries();
    const last = items[items.length - 1];
    return last && !last.description && !last.iconId ? last : null;
  });

  protected readonly channels = computed<Channel[]>(() =>
    this.entries()
      .filter((item) => item !== this.socialItem())
      .map((item) => {
        const lines = (item.description ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const value = lines[0] ?? null;
        return {
          title: item.title ?? '',
          iconId: item.iconId,
          imageId: item.imageId,
          value,
          href: this.linkFor(value),
          detail: lines.slice(1).join(' ') || null,
        };
      }),
  );

  /** Phone, e-mail and social handles are actionable; a national address code is not. */
  private linkFor(value: string | null): string | null {
    if (!value) {
      return null;
    }
    if (/^[\d\s-]+$/.test(value)) {
      return `tel:${value.replace(/\s|-/g, '')}`;
    }
    if (value.includes('@') && value.includes('.')) {
      return `mailto:${value}`;
    }
    if (value.startsWith('@')) {
      return `https://x.com/${value.slice(1)}`;
    }
    return null;
  }
}
