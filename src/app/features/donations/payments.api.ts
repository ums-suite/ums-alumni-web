import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type { InitiatePaymentResult, PaymentDto } from './payments.types';

const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

/** `UMS.Modules.Finance.Api.Endpoints.PaymentEndpoints` -- the two Finance routes this app calls directly. */
@Injectable({ providedIn: 'root' })
export class PaymentsApi extends AlumniApiBase {
  initiatePayment(invoiceId: string, idempotencyKey: string): Observable<InitiatePaymentResult> {
    return this.normalizeErrors(
      this.http.post<InitiatePaymentResult>(
        this.apiUrl('finance/payments/'),
        { invoiceId },
        { headers: { [IDEMPOTENCY_KEY_HEADER]: idempotencyKey } },
      ),
    );
  }

  getPayment(id: string): Observable<PaymentDto> {
    return this.normalizeErrors(this.http.get<PaymentDto>(this.apiUrl(`finance/payments/${id}`)));
  }
}
