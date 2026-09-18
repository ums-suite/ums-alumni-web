import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { DonationsApi } from '../donations.api';
import type { DonationCampaignDto } from '../donations.types';

interface CampaignsState {
  readonly items: readonly DonationCampaignDto[];
  readonly selected: DonationCampaignDto | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: CampaignsState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

/** ALMW-14: campaign browsing -- public, works for both anonymous SSR visitors and authenticated donors. */
export const CampaignsStore = signalStore(
  { providedIn: 'root' },
  withState<CampaignsState>(initialState),
  withMethods((store, api = inject(DonationsApi)) => ({
    loadAll(): void {
      patchState(store, { isLoading: true, error: null });
      api.listCampaigns(0, 50).subscribe({
        next: (page) => patchState(store, { items: page.items, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },

    loadOne(id: string): void {
      patchState(store, { isLoading: true, error: null, selected: null });
      api.getCampaign(id).subscribe({
        next: (selected) => patchState(store, { selected, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },
  })),
);

/** True when `now` falls within the campaign's own window and it wasn't closed early -- the only real "is this campaign open" signal this app has (no separate status enum exists on `DonationCampaignDto`). */
export function isCampaignActive(campaign: DonationCampaignDto, now = new Date()): boolean {
  if (campaign.closedEarly) {
    return false;
  }
  const start = new Date(campaign.startsAt).getTime();
  const end = new Date(campaign.endsAt).getTime();
  const nowMs = now.getTime();
  return nowMs >= start && nowMs <= end;
}
