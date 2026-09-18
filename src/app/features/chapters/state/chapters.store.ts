import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { tap } from 'rxjs';
import { ChaptersApi } from '../chapters.api';
import type { ChapterDto, ChapterListParams } from '../chapters.types';

interface ChaptersState {
  readonly items: readonly ChapterDto[];
  readonly selected: ChapterDto | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  /** The caller's own join actions this session -- see `chapters.types.ts`'s flagged gap on the missing server-side membership flag. */
  readonly joinedChapterIds: readonly string[];
}

const initialState: ChaptersState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  joinedChapterIds: [],
};

/** ALMW-21: feature-scoped signal store for the AlumniChapter list/detail/join/leave screens. */
export const ChaptersStore = signalStore(
  { providedIn: 'root' },
  withState<ChaptersState>(initialState),
  withMethods((store, api = inject(ChaptersApi)) => ({
    loadList(filter: ChapterListParams): void {
      patchState(store, { isLoading: true, error: null });
      api.list(filter).subscribe({
        next: (items) => patchState(store, { items, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },

    loadOne(id: string): void {
      patchState(store, { isLoading: true, error: null, selected: null });
      api.getById(id).subscribe({
        next: (selected) => patchState(store, { selected, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },
  })),
  withMethods((store, api = inject(ChaptersApi)) => ({
    join: (id: string) =>
      api.join(id).pipe(
        tap((selected) =>
          patchState(store, {
            selected,
            joinedChapterIds: [...new Set([...store.joinedChapterIds(), id])],
          }),
        ),
      ),

    leave: (id: string) =>
      api.leave(id).pipe(
        tap((selected) =>
          patchState(store, {
            selected,
            joinedChapterIds: store.joinedChapterIds().filter((chapterId) => chapterId !== id),
          }),
        ),
      ),
  })),
);
