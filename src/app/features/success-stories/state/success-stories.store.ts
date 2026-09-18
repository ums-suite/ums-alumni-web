import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { SuccessStoriesApi } from '../success-stories.api';
import type { NoticeDto, NoticeListParams } from '../success-stories.types';

interface SuccessStoriesState {
  readonly items: readonly NoticeDto[];
  readonly totalCount: number;
  readonly selected: NoticeDto | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: SuccessStoriesState = {
  items: [],
  totalCount: 0,
  selected: null,
  isLoading: false,
  error: null,
};

/** ALMW-22: feature-scoped signal store for the public Success Stories/News SSR pages. */
export const SuccessStoriesStore = signalStore(
  { providedIn: 'root' },
  withState<SuccessStoriesState>(initialState),
  withMethods((store, api = inject(SuccessStoriesApi)) => ({
    loadList(filter: NoticeListParams): void {
      patchState(store, { isLoading: true, error: null });
      api.listPublished(filter).subscribe({
        next: (page) =>
          patchState(store, { items: page.items, totalCount: page.totalCount, isLoading: false }),
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
);
