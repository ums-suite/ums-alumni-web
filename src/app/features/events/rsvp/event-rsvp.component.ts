import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UmsButtonComponent,
  UmsInputComponent,
  UmsSelectComponent,
  type SelectOption,
} from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { EventsStore } from '../state/events.store';
import type { RsvpResponse } from '../events.types';

const RESPONSE_OPTIONS: readonly SelectOption[] = [
  { value: 'Going', label: 'Going' },
  { value: 'Interested', label: 'Interested' },
  { value: 'NotGoing', label: 'Not going' },
];

/**
 * ALMW-19: RSVP to a specific `AlumniEvent`, reached by a known id (route param) rather than a
 * click-through from the calendar (see `events.types.ts`'s flagged gap #2). Server-validated,
 * no optimistic "confirmed" state (design-decisions.md "Concurrency Resolution for Finite,
 * Contested Resources") -- though unlike the mentorship-capacity case, THIS resource genuinely
 * has no capacity/waitlist mechanism at all server-side (flagged gap #1): an RSVP here is always
 * either accepted or rejected on plain validation grounds, and this screen says so plainly
 * rather than implying a waitlist queue that doesn't exist.
 */
@Component({
  selector: 'alw-event-rsvp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UmsButtonComponent, UmsInputComponent, UmsSelectComponent, TranslatePipe],
  templateUrl: './event-rsvp.component.html',
  styleUrl: './event-rsvp.component.scss',
})
export class EventRsvpComponent {
  protected readonly store = inject(EventsStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly responseOptions = RESPONSE_OPTIONS;
  protected readonly response = signal<string>('Going');
  protected readonly guestCount = signal('0');
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('alumniEventId') ?? '';

  constructor() {
    if (this.eventId) {
      this.store.loadAlumniEvent(this.eventId);
    }
  }

  protected submitRsvp(): void {
    const guests = Number(this.guestCount());
    if (Number.isNaN(guests) || guests < 0) {
      this.submitError.set('Enter a valid, non-negative guest count.');
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);
    this.store
      .submitRsvp(this.eventId, { response: this.response() as RsvpResponse, guestCount: guests })
      .subscribe({
        next: () => this.isSubmitting.set(false),
        error: (error: { message: string }) => {
          this.isSubmitting.set(false);
          this.submitError.set(error.message);
        },
      });
  }
}
