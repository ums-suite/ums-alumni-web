import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UmsBadgeComponent, UmsButtonComponent, UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DonationHistoryStore } from '../state/donation-history.store';
import type { DonationDto } from '../donations.types';

/**
 * ALMW-16: full donation history + recurring-donation management + a receipt note.
 *
 * FLAGGED GAP: receipt generation (via `Documents`) is a synchronous, best-effort, fire-and-
 * forget SERVER-SIDE side effect of a successful webhook (confirmed against `PaymentWebhookService`
 * source) -- there is no endpoint this app can call to fetch, list, or link to the resulting
 * document. The honest treatment here is a plain note, never a fabricated "Download receipt"
 * link to nowhere.
 *
 * design-decisions.md's "Recurring-Donation Failure Handling": a `Paused` recurring donation
 * shows the real pause-and-notify state with a "resume" action -- this is a DIFFERENT resolution
 * from the (not-yet-real, flagged) general-fund-redirect-on-campaign-closure case, and this
 * screen never conflates the two.
 */
@Component({
  selector: 'alw-donation-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UmsBadgeComponent, UmsButtonComponent, UmsEmptyStateComponent, TranslatePipe],
  templateUrl: './donation-history.component.html',
  styleUrl: './donation-history.component.scss',
})
export class DonationHistoryComponent {
  protected readonly store = inject(DonationHistoryStore);

  constructor() {
    this.store.load();
  }

  protected statusVariant(status: DonationDto['status']): 'success' | 'warning' | 'danger' {
    if (status === 'Confirmed') return 'success';
    if (status === 'Failed') return 'danger';
    return 'warning';
  }

  protected isRecurringSeriesRoot(donation: DonationDto): boolean {
    return donation.recurrenceInterval !== 'None' && donation.recurrenceStatus !== null;
  }
}
