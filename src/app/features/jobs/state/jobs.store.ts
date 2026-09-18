import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { tap } from 'rxjs';
import { JobsApi } from '../jobs.api';
import type {
  EditJobPostingRequest,
  JobListFilterParams,
  JobPostingDto,
  PostJobRequest,
  RemoveJobPostingRequest,
} from '../jobs.types';

interface JobsState {
  readonly items: readonly JobPostingDto[];
  readonly selected: JobPostingDto | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: JobsState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

/** ALMW-12: feature-scoped signal store for job-board search/list/detail/create/update/withdraw. */
export const JobsStore = signalStore(
  { providedIn: 'root' },
  withState<JobsState>(initialState),
  withMethods((store, api = inject(JobsApi)) => ({
    search(filter: JobListFilterParams): void {
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
  withMethods((store, api = inject(JobsApi)) => ({
    create: (request: PostJobRequest) => api.create(request).pipe(tap(() => store.search({}))),

    update: (id: string, request: EditJobPostingRequest) =>
      api.update(id, request).pipe(tap((updated) => patchState(store, { selected: updated }))),

    withdraw: (id: string, request: RemoveJobPostingRequest) =>
      api.remove(id, request).pipe(tap(() => store.search({}))),
  })),
);
