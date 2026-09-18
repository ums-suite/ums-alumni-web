import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { UmsApiError } from '@ums/shared';
import { DonationsApi } from '../donations.api';
import { generateIdempotencyKey } from '../donation-confirmation.util';
import { PaymentsApi } from '../payments.api';
import type { DonationDto, InitiateDonationRequest } from '../donations.types';

interface DonationFlowState {
  readonly submitting: boolean;
  readonly error: string | null;
  /** requirement-spec.md §8 invariant #7: set specifically on the confirmed `donationcampaign.not_active` rejection. */
  readonly campaignClosed: boolean;
}

const initialState: DonationFlowState = {
  submitting: false,
  error: null,
  campaignClosed: false,
};

/**
 * ALMW-15: orchestrates the two real backend calls a donation attempt requires -- `POST
 * /alumni/donations` (creates the Donation + raises a Finance Invoice, checked against the
 * campaign's real active window server-side) followed by `POST /finance/payments` (a fresh,
 * per-attempt `Idempotency-Key`, ADR-0008) -- and hands the caller back the gateway `RedirectUrl`
 * for a real, full browser redirect. This store never itself decides a donation is "done" --
 * see `donation-confirmation.util.ts` for that boundary.
 */
export const DonationFlowStore = signalStore(
  { providedIn: 'root' },
  withState<DonationFlowState>(initialState),
  withMethods((store, donationsApi = inject(DonationsApi), paymentsApi = inject(PaymentsApi)) => ({
    startDonation(
      request: InitiateDonationRequest,
      onRedirect: (donation: DonationDto, redirectUrl: string) => void,
      onError?: (error: UmsApiError, campaignClosed: boolean) => void,
    ): void {
      if (store.submitting()) {
        return;
      }
      patchState(store, { submitting: true, error: null, campaignClosed: false });

      donationsApi.initiateDonation(request).subscribe({
        next: (donation) => {
          if (!donation.invoiceId) {
            patchState(store, {
              submitting: false,
              error: 'This donation could not be linked to an invoice. Please try again.',
            });
            onError?.({ status: 0, message: 'Missing invoiceId on the created donation.' }, false);
            return;
          }

          const idempotencyKey = generateIdempotencyKey();
          paymentsApi.initiatePayment(donation.invoiceId, idempotencyKey).subscribe({
            next: ({ redirectUrl }) => {
              patchState(store, { submitting: false });
              if (redirectUrl) {
                onRedirect(donation, redirectUrl);
              } else {
                // A pure idempotency replay with no fresh gateway call -- the donation is still
                // pending resolution; send the donor straight to the confirming screen instead.
                onRedirect(donation, '');
              }
            },
            error: (rawError: unknown) => {
              // `DonationsApi`/`PaymentsApi` already normalize via `AlumniApiBase.
              // normalizeErrors` -- `rawError` here is ALREADY a `UmsApiError` plain object, not
              // an `HttpErrorResponse`; re-wrapping via `toUmsApiError` a second time would hit
              // its "unknown error" fallback and lose the real status/code (the exact bug already
              // caught and fixed once in `AlumnusContextService` -- see that file's own comment).
              const apiError = rawError as UmsApiError;
              patchState(store, { submitting: false, error: apiError.message });
              onError?.(apiError, false);
            },
          });
        },
        error: (rawError: unknown) => {
          const apiError = rawError as UmsApiError;
          const campaignClosed = apiError.code === 'donationcampaign.not_active';
          patchState(store, { submitting: false, error: apiError.message, campaignClosed });
          onError?.(apiError, campaignClosed);
        },
      });
    },
  })),
);
