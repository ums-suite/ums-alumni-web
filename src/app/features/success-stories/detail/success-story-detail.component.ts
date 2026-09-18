import { ChangeDetectionStrategy, Component, REQUEST, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UmsAssetComponent } from '@ums/design-system';
import { SuccessStoriesStore } from '../state/success-stories.store';
import { SuccessStoriesSeoService } from '../success-stories-seo.service';
import { excerptOf } from '../success-stories.types';

/**
 * ALMW-22: a single Success Story/News detail page -- editorial "asymmetric image + pull-quote +
 * text" grid (`requirement-spec.md` §3.7/§7). This layout convention doesn't exist anywhere else
 * in the suite (confirmed: no `pull-quote`/`asymmetric`/`grid-template-areas` usage in either
 * `ums-public-web` or this app) -- designed fresh here using this app's own token/logical-property
 * conventions. The image slot uses `UmsAssetComponent`'s illustration placeholder rather than a
 * fabricated CDN image URL (`Notice` carries no image field, see `success-stories.types.ts`), and
 * the pull-quote is a plain, honestly-labeled excerpt of the real `Body` text.
 */
@Component({
  selector: 'alw-success-story-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsAssetComponent],
  templateUrl: './success-story-detail.component.html',
  styleUrl: './success-story-detail.component.scss',
})
export class SuccessStoryDetailComponent {
  protected readonly store = inject(SuccessStoriesStore);
  protected readonly excerptOf = excerptOf;
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SuccessStoriesSeoService);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly storyId = this.route.snapshot.paramMap.get('storyId') ?? '';

  constructor() {
    if (this.storyId) {
      this.store.loadOne(this.storyId);
    }

    effect(() => {
      const story = this.store.selected();
      if (story) {
        this.seo.apply(story, this.canonicalUrl());
      }
    });
  }

  private canonicalUrl(): string {
    if (this.request) {
      return this.request.url;
    }
    return typeof document !== 'undefined' ? document.location.href : '';
  }
}
