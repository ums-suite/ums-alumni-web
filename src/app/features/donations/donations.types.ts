/**
 * Hand-typed against the real `ums-core` source. CRITICAL SCOPE CORRECTION confirmed directly
 * against source: Campaign browsing and Donation creation/history live in the ALUMNI module
 * (`UMS.Modules.Alumni.Api.Endpoints.DonationEndpoints`), not Finance -- Alumni only calls into
 * Finance's generic Payment core via an in-process contract (`IInvoiceRequester`). Finance's own
 * `Payment`/`PaymentTransaction` endpoints are confirmed separately in `payments.types.ts`.
 *
 * FLAGGED GAP (ALMW-14, live progress indicator): `DonationCampaignDto` has NO `AmountRaised` or
 * `DonorCount` field at all -- `DonationCampaign` (entity) and `DonationCampaignRepository`
 * (confirmed via source) carry only `Name/Description/GoalAmount/Currency/StartsAt/EndsAt/
 * ClosedEarly/CreatedAt`, with no aggregate query over `Donation` rows anywhere in the module.
 * requirement-spec.md §3.4/§8 both insist a progress number is "never an invented one" -- the
 * only honest choice here is to render NO progress bar/percentage at all until a real backend
 * aggregate exists, with a clear inline note instead (`donations.progress.unavailable`).
 */
export type RecurrenceInterval = 'None' | 'Monthly' | 'Quarterly' | 'Yearly';
export type DonationStatus = 'Pending' | 'Confirmed' | 'Failed';
export type RecurrenceStatus = 'Active' | 'Paused' | 'Cancelled';

export interface DonationCampaignDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly goalAmount: number;
  readonly currency: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly closedEarly: boolean;
  readonly createdAt: string;
}

export interface DonationCampaignPage {
  readonly items: readonly DonationCampaignDto[];
  readonly skip: number;
  readonly take: number;
}

export interface InitiateDonationRequest {
  readonly campaignId: string;
  readonly amount: number;
  readonly currency: string;
  readonly isAnonymous: boolean;
  readonly recurrenceInterval: RecurrenceInterval;
}

export interface DonationDto {
  readonly id: string;
  readonly alumnusId: string;
  readonly campaignId: string;
  readonly amount: number;
  readonly currency: string;
  readonly isAnonymous: boolean;
  readonly recurrenceInterval: RecurrenceInterval;
  readonly recurrenceStatus: RecurrenceStatus | null;
  readonly seriesRootDonationId: string | null;
  readonly status: DonationStatus;
  readonly invoiceId: string | null;
  readonly createdAt: string;
  readonly confirmedAt: string | null;
  readonly nextChargeAt: string | null;
  readonly version: number;
}
