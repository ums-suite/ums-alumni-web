import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  UmsButtonComponent,
  UmsFormFieldComponent,
  UmsInputComponent,
  UmsSelectComponent,
} from '@ums/design-system';
import type { UmsApiError } from '@ums/shared';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { CampaignsStore } from '../state/campaigns.store';
import { DonationFlowStore } from '../state/donation-flow.store';
import type { RecurrenceInterval } from '../donations.types';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000] as const;

/**
 * ALMW-15: STATE 1 of the three-state payment-moment pattern (design-decisions.md's
 * "Trust-Signal Design Pattern for the Payment Moment") -- amount/impact-framed pre-payment step
 * with real campaign numbers (goal/currency, the campaign's own description as its impact
 * framing -- see `campaign-list.component.ts`'s doc on why no fabricated progress/impact metric
 * is invented) and a plain-language gateway/fee disclosure. One-time and recurring donation,
 * anonymous as a DISPLAY-LAYER-ONLY option (Domain Invariant #3 -- the request still always
 * carries the real, authenticated Alumnus identity; `isAnonymous` only ever affects how this
 * donation is shown to OTHER people later, never who it's attributed to for audit).
 */
@Component({
  selector: 'alw-donation-amount',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    UmsButtonComponent,
    UmsFormFieldComponent,
    UmsInputComponent,
    UmsSelectComponent,
    TranslatePipe,
  ],
  templateUrl: './donation-amount.component.html',
  styleUrl: './donation-amount.component.scss',
})
export class DonationAmountComponent {
  protected readonly campaigns = inject(CampaignsStore);
  protected readonly flow = inject(DonationFlowStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly campaignId = this.route.snapshot.paramMap.get('campaignId') ?? '';

  protected readonly presetAmounts = PRESET_AMOUNTS;
  protected readonly amount = signal<number>(PRESET_AMOUNTS[0]);
  protected readonly isRecurring = signal(false);
  protected readonly recurrenceInterval = signal<RecurrenceInterval>('Monthly');
  protected readonly isAnonymous = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly campaignClosed = signal(false);

  protected readonly recurrenceOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Yearly', label: 'Yearly' },
  ];

  constructor() {
    this.campaigns.loadOne(this.campaignId);
  }

  protected selectPreset(value: number): void {
    this.amount.set(value);
  }

  protected submit(): void {
    const campaign = this.campaigns.selected();
    if (!campaign || this.amount() <= 0) {
      return;
    }
    this.errorMessage.set(null);
    this.campaignClosed.set(false);

    this.flow.startDonation(
      {
        campaignId: this.campaignId,
        amount: this.amount(),
        currency: campaign.currency,
        isAnonymous: this.isAnonymous(),
        recurrenceInterval: this.isRecurring() ? this.recurrenceInterval() : 'None',
      },
      (donation, redirectUrl) => {
        void this.router.navigateByUrl(`/app/donations/${donation.id}/confirming`);
        if (redirectUrl) {
          this.navigateToGateway(redirectUrl);
        }
      },
      (error: UmsApiError, closed: boolean) => {
        this.campaignClosed.set(closed);
        this.errorMessage.set(closed ? null : error.message || 'Could not start this donation.');
      },
    );
  }

  /** Isolated for testability -- a real browser navigation away from this Angular app. */
  protected navigateToGateway(url: string): void {
    window.location.href = url;
  }
}
