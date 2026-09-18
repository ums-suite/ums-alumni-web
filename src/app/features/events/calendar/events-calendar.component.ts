import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UmsButtonComponent, UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { EventsStore } from '../state/events.store';

/**
 * ALMW-19: the real, browsable event calendar -- sourced from Content's `Event` list (anonymous,
 * paginated, real). See `events.types.ts` for why this screen never links through to an RSVP
 * action: there is no server-side cross-reference from a Content Event to its optional
 * `AlumniEvent` RSVP wrapper. RSVP is a separate screen reached by a known `AlumniEvent` id
 * (e.g. from a notification link), not a click-through from here.
 */
@Component({
  selector: 'alw-events-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UmsButtonComponent, UmsEmptyStateComponent, TranslatePipe],
  templateUrl: './events-calendar.component.html',
  styleUrl: './events-calendar.component.scss',
})
export class EventsCalendarComponent {
  protected readonly store = inject(EventsStore);

  constructor() {
    this.store.loadCalendar({ take: 50 });
  }

  protected loadMore(): void {
    this.store.loadCalendar({ skip: this.store.calendar().length, take: 50 });
  }
}
