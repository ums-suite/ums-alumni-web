import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { DonationsApi } from '../donations.api';
import type { DonationDto } from '../donations.types';

interface DonationHistoryState {
  readonly items: readonly DonationDto[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly mutatingId: string | null;
}

const initialState: DonationHistoryState = {
  items: [],
  isLoading: false,
  error: null,
  mutatingId: null,
};

/**
 * ALMW-16: full donation history per Alumnus, plus the two real recurring-donation management
 * actions (`cancel-recurring`/`resume-recurring`, confirmed against source).
 *
 * design-decisions.md's "Recurring-Donation Failure Handling": pause-and-notify (an in-app
 * `RecurrenceStatus.Paused` row here, surfaced with a "resume" action) is the real, confirmed
 * server behavior on a failed cycle -- general-fund redirect on campaign closure is a DIFFERENT,
 * NOT-YET-BUILT-server-side mechanism (FLAGGED GAP: no "general fund" entity exists at all,
 * confirmed against Finance/Alumni source) -- this store deliberately does not conflate the two.
 */
export const DonationHistoryStore = signalStore(
  { providedIn: 'root' },
  withState<DonationHistoryState>(initialState),
  withMethods((store, api = inject(DonationsApi)) => ({
    load(): void {
      patchState(store, { isLoading: true, error: null });
      api.myDonations().subscribe({
        next: (items) => patchState(store, { items, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },

    cancelRecurring(id: string): void {
      patchState(store, { mutatingId: id, error: null });
      api.cancelRecurring(id).subscribe({
        next: (updated) =>
          patchState(store, {
            mutatingId: null,
            items: store.items().map((d) => (d.id === id ? updated : d)),
          }),
        error: (error: unknown) =>
          patchState(store, { mutatingId: null, error: toUmsApiError(error).message }),
      });
    },

    resumeRecurring(id: string): void {
      patchState(store, { mutatingId: id, error: null });
      api.resumeRecurring(id).subscribe({
        next: (updated) =>
          patchState(store, {
            mutatingId: null,
            items: store.items().map((d) => (d.id === id ? updated : d)),
          }),
        error: (error: unknown) =>
          patchState(store, { mutatingId: null, error: toUmsApiError(error).message }),
      });
    },
  })),
);
