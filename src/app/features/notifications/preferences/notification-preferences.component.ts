import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import type { DigestCategory } from '../notifications.types';
import { NotificationPreferencesStore } from './notification-preferences.store';

interface DigestToggleRow {
  readonly category: DigestCategory;
  readonly labelKey: string;
}

const ROWS: readonly DigestToggleRow[] = [
  { category: 'jobMatches', labelKey: 'notifications.digest.jobMatches' },
  { category: 'eventReminders', labelKey: 'notifications.digest.eventReminders' },
  { category: 'mentorshipRequests', labelKey: 'notifications.digest.mentorshipRequests' },
  { category: 'campaignUpdates', labelKey: 'notifications.digest.campaignUpdates' },
];

/** ALMW-23: opt-in email digest preferences -- UI-only this sprint, see `notification-preferences.store.ts`. */
@Component({
  selector: 'alw-notification-preferences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './notification-preferences.component.html',
  styleUrl: './notification-preferences.component.scss',
})
export class NotificationPreferencesComponent {
  protected readonly store = inject(NotificationPreferencesStore);
  protected readonly rows = ROWS;

  protected toggle(category: DigestCategory): void {
    this.store.toggle(category);
  }
}
