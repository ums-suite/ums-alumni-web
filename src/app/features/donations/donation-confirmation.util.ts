import type { DonationStatus } from './donations.types';

/**
 * ALMW-15: the single place "is this donation actually confirmed" is answered -- Domain
 * Invariant #2 ("a donation confirmation is never shown before the gateway webhook confirms the
 * charge") and design-decisions.md's "Trust-Signal Design Pattern for the Payment Moment" both
 * hinge on no screen independently inventing its own "looks done enough" check.
 *
 * Deliberately keyed on the ALUMNI `Donation.Status` field, not the Finance `Payment.Status` one
 * (see `payments.types.ts`'s own doc comment for why): `Donation.Status` is the real domain-level
 * projection Alumni's own `DonationConfirmationService` writes only once Finance's webhook has
 * resolved the underlying `Payment` -- polling it is equivalent to polling the Payment directly,
 * but also means a donation's OWN id (known immediately after `POST /alumni/donations`, before
 * Finance is ever involved) is enough to resume tracking from any future session, without this
 * app needing its own separate "list payments by invoice" capability that doesn't exist server-
 * side. `Failed` is terminal but explicitly NOT confirmed -- only `Confirmed` counts.
 */
const TERMINAL_STATUSES: ReadonlySet<DonationStatus> = new Set(['Confirmed', 'Failed']);

export function isTerminalDonationStatus(status: DonationStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function isConfirmedDonationStatus(status: DonationStatus): boolean {
  return status === 'Confirmed';
}

export function isFailedDonationStatus(status: DonationStatus): boolean {
  return status === 'Failed';
}

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idempotency-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * requirement-spec.md §8 invariant #7 / edge-cases.md's closed-campaign-races-stale-tab case:
 * the real backend error code for "this campaign is no longer accepting donations", surfaced by
 * `POST /alumni/donations` at the actual moment of financial commitment -- confirmed this is
 * checked server-side exactly there (`DonationService.InitiateAsync`'s `campaign.IsActive(now)`
 * check), so THIS is the real "point of charge" for this app's own architecture (Finance is only
 * reached after a Donation already exists) -- no separate client-side campaign-status re-check is
 * needed on top of what the server already enforces at the right moment.
 */
export const CAMPAIGN_NOT_ACTIVE_ERROR_CODE = 'donationcampaign.not_active';
