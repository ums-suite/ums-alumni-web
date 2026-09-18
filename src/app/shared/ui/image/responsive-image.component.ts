import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export interface ResponsiveImageSource {
  readonly url: string;
  /** Real pixel width of this source, for `srcset`'s `Nw` descriptor. */
  readonly width: number;
}

/**
 * ALMW-6: reusable CDN-delivered image component -- `requirement-spec.md` §2 "Media delivery"
 * row: profile photos, campaign imagery, and success-story media are served via CDN, referenced
 * by object-storage metadata, never a DB blob. This app is photography-heavy (§7's editorial
 * success-story grid, campaign hero imagery, campus-crest-style directory avatars) so
 * layout-shift-free, lazy-loaded delivery matters more here than in `ums-admin-web`.
 *
 * Mirrors `ums-public-web`'s own `ResponsiveImageComponent` pattern verbatim (an aspect-ratio
 * box reserved up front, opacity fade-in on load, a persistent placeholder on error) -- the one
 * genuinely reusable image primitive across both apps' CDN-delivery stories.
 */
@Component({
  selector: 'alw-responsive-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'alw-responsive-image',
    '[style.aspect-ratio]': 'aspectRatio()',
    '[class.alw-responsive-image--loaded]': 'loaded()',
    '[class.alw-responsive-image--errored]': 'errored()',
  },
  templateUrl: './responsive-image.component.html',
  styleUrl: './responsive-image.component.scss',
})
export class ResponsiveImageComponent {
  readonly src = input.required<string>();
  readonly alt = input<string>('');
  /** Decorative imagery (e.g. an ambient hero backdrop) gets an empty accessible name instead of `alt`. */
  readonly decorative = input(false);
  /** CSS `aspect-ratio` value, e.g. `'16/9'` or `'1/1'` -- reserves layout space before the image loads. */
  readonly aspectRatio = input<string>('16/9');
  readonly sources = input<readonly ResponsiveImageSource[]>([]);
  readonly sizes = input<string>('100vw');
  /** A hero/LCP image should never be lazy-loaded; every other usage defaults to lazy. */
  readonly priority = input(false);

  protected readonly loaded = signal(false);
  protected readonly errored = signal(false);

  protected get srcset(): string | null {
    const sources = this.sources();
    return sources.length ? sources.map((s) => `${s.url} ${s.width}w`).join(', ') : null;
  }

  protected onLoad(): void {
    this.loaded.set(true);
  }

  protected onError(): void {
    this.errored.set(true);
  }
}
