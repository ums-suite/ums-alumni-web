import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { chapterAccentIndex } from '../chapter-accent.util';
import { ChaptersStore } from '../state/chapters.store';

/**
 * ALMW-21: a single `AlumniChapter`'s page -- info, join/leave, and a themed accent (client-side
 * only, see `chapter-accent.util.ts`). The "own event/news feed" this app's requirement-spec
 * names (`§3.6`) has no real backing data source yet (`chapters.types.ts` flagged gap #1) -- shown
 * here as an honest, explicit note rather than a silently-empty list.
 */
@Component({
  selector: 'alw-chapter-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsButtonComponent, TranslatePipe],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss',
})
export class ChapterDetailComponent {
  protected readonly store = inject(ChaptersStore);
  private readonly route = inject(ActivatedRoute);

  private readonly chapterId = this.route.snapshot.paramMap.get('chapterId') ?? '';
  protected readonly isMember = computed(() =>
    this.store.joinedChapterIds().includes(this.chapterId),
  );
  protected readonly isBusy = signal(false);
  protected readonly actionError = signal<string | null>(null);

  constructor() {
    if (this.chapterId) {
      this.store.loadOne(this.chapterId);
    }
  }

  protected accentClass(): string {
    return `alw-chapter-detail__banner--accent-${chapterAccentIndex(this.chapterId)}`;
  }

  protected join(): void {
    this.actionError.set(null);
    this.isBusy.set(true);
    this.store.join(this.chapterId).subscribe({
      next: () => this.isBusy.set(false),
      error: (error: { message: string }) => {
        this.isBusy.set(false);
        this.actionError.set(error.message);
      },
    });
  }

  protected leave(): void {
    this.actionError.set(null);
    this.isBusy.set(true);
    this.store.leave(this.chapterId).subscribe({
      next: () => this.isBusy.set(false),
      error: (error: { message: string }) => {
        this.isBusy.set(false);
        this.actionError.set(error.message);
      },
    });
  }
}
