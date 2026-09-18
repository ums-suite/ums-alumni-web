import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SuccessStoriesStore } from '../state/success-stories.store';
import { excerptOf } from '../success-stories.types';

/**
 * ALMW-22: public, SSR, editorial "magazine" grid of Success Stories/News (real Content `Notice`s
 * -- see `success-stories.types.ts` for the repurposing decision). Discoverable, shareable,
 * anonymous-friendly by design (§4 SEO row).
 */
@Component({
  selector: 'alw-success-stories-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsEmptyStateComponent, TranslatePipe],
  templateUrl: './success-stories-list.component.html',
  styleUrl: './success-stories-list.component.scss',
})
export class SuccessStoriesListComponent {
  protected readonly store = inject(SuccessStoriesStore);
  protected readonly excerptOf = excerptOf;
  private readonly titleService = inject(Title);

  constructor() {
    this.store.loadList({ take: 30 });
    this.titleService.setTitle('Success Stories | UMS Alumni');
  }
}
