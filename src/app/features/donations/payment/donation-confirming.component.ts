import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DonationsApi } from '../donations.api';
import {
  isConfirmedDonationStatus,
  isFailedDonationStatus,
  isTerminalDonationStatus,
} from '../donation-confirmation.util';
import type { DonationDto } from '../donations.types';

const POLL_INTERVAL_MS = 3000;
/**
 * design-decisions.md's "Trust-Signal Design Pattern for the Payment Moment": the confirming
 * state is "never skipped or shortened even when a webhook happens to arrive quickly" -- this is
 * the mechanism that makes that literal: the terminal outcome is known as soon as a poll reports
 * it, but never REVEALED to the donor until at least this much time has passed, so the pattern's
 * meaning never depends on network/webhook timing.
 */
const MIN_CONFIRMING_DISPLAY_MS = 1500;

/**
 * ALMW-15: STATES 2 and 3 of the three-state payment-moment pattern. This is the mandatory
 * status-query-on-return flow (design-decisions.md's "Donation-Flow Idempotency/Recovery UX"):
 * on ANY arrival here -- a fresh redirect back from the gateway, a manual refresh, browser-back,
 * or a completely different session days later -- the first and only action is to query the
 * donation's real, server-persisted status by its id (the URL param IS the durable key; no
 * browser-memory/localStorage assumption is made about how the visitor got here). Domain
 * Invariant #2 is enforced structurally by `donation-confirmation.util.ts`: this component can
 * only ever render "confirmed" when `Donation.Status === 'Confirmed'`, which Alumni's own
 * `DonationConfirmationService` sets only after Finance's webhook resolves the underlying
 * `Payment` -- never on the redirect return alone, never on a client-side guess.
 */
@Component({
  selector: 'alw-donation-confirming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsButtonComponent, TranslatePipe],
  templateUrl: './donation-confirming.component.html',
  styleUrl: './donation-confirming.component.scss',
})
export class DonationConfirmingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DonationsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly donationId = this.route.snapshot.paramMap.get('donationId') ?? '';
  protected readonly donation = signal<DonationDto | null>(null);
  protected readonly notFound = signal(false);
  /** Flips true only once BOTH a terminal status is known AND the minimum display window has elapsed. */
  private readonly revealed = signal(false);

  protected readonly isConfirmed = computed(() => {
    const donation = this.donation();
    return this.revealed() && !!donation && isConfirmedDonationStatus(donation.status);
  });

  protected readonly isFailed = computed(() => {
    const donation = this.donation();
    return this.revealed() && !!donation && isFailedDonationStatus(donation.status);
  });

  private readonly minDisplayUntil = Date.now() + MIN_CONFIRMING_DISPLAY_MS;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private revealTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.donationId) {
      this.notFound.set(true);
      return;
    }
    this.pollOnce();
    this.pollIntervalId = setInterval(() => this.pollOnce(), POLL_INTERVAL_MS);
    this.destroyRef.onDestroy(() => this.stopAll());
  }

  private pollOnce(): void {
    this.api.getDonation(this.donationId).subscribe({
      next: (donation) => {
        this.donation.set(donation);
        if (isTerminalDonationStatus(donation.status)) {
          this.stopPolling();
          this.scheduleReveal();
        }
      },
      error: () => {
        this.notFound.set(true);
        this.stopAll();
      },
    });
  }

  private scheduleReveal(): void {
    if (this.revealTimeoutId !== null) {
      return;
    }
    const remaining = Math.max(0, this.minDisplayUntil - Date.now());
    this.revealTimeoutId = setTimeout(() => this.revealed.set(true), remaining);
  }

  private stopPolling(): void {
    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private stopAll(): void {
    this.stopPolling();
    if (this.revealTimeoutId !== null) {
      clearTimeout(this.revealTimeoutId);
      this.revealTimeoutId = null;
    }
  }
}
