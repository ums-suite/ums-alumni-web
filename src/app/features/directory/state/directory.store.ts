import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { AlumnusProfileApi } from '../../../core/http/alumnus-profile.api';
import type {
  AlumniDirectoryEntryDto,
  AlumniDirectoryFilterParams,
} from '../../../core/http/alumnus-profile.types';

interface DirectoryState {
  readonly items: readonly AlumniDirectoryEntryDto[];
  readonly skip: number;
  readonly take: number;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastFilter: AlumniDirectoryFilterParams;
}

const DEFAULT_TAKE = 24;

const initialState: DirectoryState = {
  items: [],
  skip: 0,
  take: DEFAULT_TAKE,
  isLoading: false,
  error: null,
  lastFilter: {},
};

/** ALMW-9: feature-scoped signal store for the alumni directory search screen. */
export const DirectoryStore = signalStore(
  { providedIn: 'root' },
  withState<DirectoryState>(initialState),
  withMethods((store, api = inject(AlumnusProfileApi)) => ({
    search(filter: AlumniDirectoryFilterParams): void {
      patchState(store, { isLoading: true, error: null, lastFilter: filter });
      api.searchDirectory({ ...filter, skip: 0, take: store.take() }).subscribe({
        next: (page) => patchState(store, { items: page.items, skip: page.skip, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },

    loadMore(): void {
      const nextSkip = store.skip() + store.take();
      patchState(store, { isLoading: true, error: null });
      api.searchDirectory({ ...store.lastFilter(), skip: nextSkip, take: store.take() }).subscribe({
        next: (page) =>
          patchState(store, {
            items: [...store.items(), ...page.items],
            skip: page.skip,
            isLoading: false,
          }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },
  })),
);
