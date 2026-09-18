import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { tap } from 'rxjs';
import { MentorshipApi } from '../mentorship.api';
import type {
  EndMatchRequest,
  MentorshipMatchDto,
  MentorshipOptInDto,
  OptInRequest,
} from '../mentorship.types';

interface MentorshipState {
  /** Named `myOptIn`, not `optIn` -- a `signalStore` member can't share a name with a `withMethods` method (`optIn` below). */
  readonly myOptIn: MentorshipOptInDto | null;
  readonly matches: readonly MentorshipMatchDto[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: MentorshipState = {
  myOptIn: null,
  matches: [],
  isLoading: false,
  error: null,
};

function replaceMatch(
  matches: readonly MentorshipMatchDto[],
  updated: MentorshipMatchDto,
): readonly MentorshipMatchDto[] {
  return matches.map((match) => (match.id === updated.id ? updated : match));
}

/**
 * ALMW-17/18: feature-scoped signal store for this app's Alumnus-side mentorship surface --
 * managing a mentor opt-in profile and the caller's own `MentorshipMatch` list (see
 * `mentorship.types.ts` for why this is scoped to the mentor's own matches only).
 */
export const MentorshipStore = signalStore(
  { providedIn: 'root' },
  withState<MentorshipState>(initialState),
  withMethods((store, api = inject(MentorshipApi)) => ({
    loadMatches(): void {
      patchState(store, { isLoading: true, error: null });
      api.getMyMatches().subscribe({
        next: (matches) => patchState(store, { matches, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },
  })),
  withMethods((store, api = inject(MentorshipApi)) => ({
    optIn: (request: OptInRequest) =>
      api.optIn(request).pipe(tap((myOptIn) => patchState(store, { myOptIn }))),

    acceptMatch: (id: string) =>
      api
        .acceptMatch(id)
        .pipe(
          tap((updated) => patchState(store, { matches: replaceMatch(store.matches(), updated) })),
        ),

    endMatch: (id: string, request: EndMatchRequest) =>
      api
        .endMatch(id, request)
        .pipe(
          tap((updated) => patchState(store, { matches: replaceMatch(store.matches(), updated) })),
        ),
  })),
);
