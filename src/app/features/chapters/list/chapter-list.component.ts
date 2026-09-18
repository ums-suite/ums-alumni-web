import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsBadgeComponent, UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { chapterAccentIndex } from '../chapter-accent.util';
import { ChaptersStore } from '../state/chapters.store';

/** ALMW-21: browsable list of `AlumniChapter`s (real, paged `GET /alumni/chapters`). */
@Component({
  selector: 'alw-chapter-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsBadgeComponent, UmsEmptyStateComponent, TranslatePipe],
  templateUrl: './chapter-list.component.html',
  styleUrl: './chapter-list.component.scss',
})
export class ChapterListComponent {
  protected readonly store = inject(ChaptersStore);

  constructor() {
    this.store.loadList({ take: 50 });
  }

  protected accentClass(chapterId: string): string {
    return `alw-chapter-list__card--accent-${chapterAccentIndex(chapterId)}`;
  }
}
