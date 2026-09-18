import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsBadgeComponent, UmsButtonComponent, UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { NotificationsStore } from '../state/notifications.store';

/** ALMW-23: the real in-app notification center (`GET/PATCH /notifications/me/...`, confirmed live). */
@Component({
  selector: 'alw-notification-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    UmsBadgeComponent,
    UmsButtonComponent,
    UmsEmptyStateComponent,
    TranslatePipe,
  ],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss',
})
export class NotificationCenterComponent {
  protected readonly store = inject(NotificationsStore);

  constructor() {
    this.store.load();
  }

  protected markRead(id: string): void {
    this.store.markRead(id).subscribe();
  }

  protected markAllRead(): void {
    this.store.markAllRead().subscribe();
  }
}
