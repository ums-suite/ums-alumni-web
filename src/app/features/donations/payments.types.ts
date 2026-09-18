/**
 * Hand-typed against the real `ums-core` Finance source
 * (`UMS.Modules.Finance.Api.Endpoints.PaymentEndpoints`, `Domain.Payments.PaymentStatus`).
 *
 * This app's flow calls exactly two Finance endpoints directly:
 *  - `POST /api/v1/finance/payments/` -- initiates the gateway-hosted redirect for an already-
 *    created Alumni `Donation`'s `InvoiceId`. Requires an `Idempotency-Key` header (client-
 *    generated, never a body field) -- ADR-0008's mechanism, confirmed against `PaymentEndpoints`
 *    and `Payment.Initiate` source directly.
 *  - `GET /api/v1/finance/payments/{id}` -- status query. NOTE: this app's own "is this donation
 *    confirmed" source of truth is actually `GET /alumni/donations/{id}`'s `Donation.Status`
 *    field (see `donation-flow.service.ts`'s own doc comment for why), not this endpoint directly
 *    -- `PaymentDto` is still needed for the one moment this app reads `RedirectUrl`.
 */
export type PaymentStatus = 'Initiated' | 'Pending' | 'Successful' | 'Failed' | 'Reconciled';

export interface PaymentDto {
  readonly id: string;
  readonly invoiceId: string;
  readonly ownerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly gatewayName: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InitiatePaymentResult {
  readonly payment: PaymentDto;
  readonly redirectUrl: string | null;
}
