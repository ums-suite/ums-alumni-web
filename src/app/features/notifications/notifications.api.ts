import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type { NotificationItem, RawNotificationDeliveryAttemptDto } from './notifications.types';
import { toNotificationItem } from './notifications.types';

/**
 * `UMS.Modules.Notifications.Api.Endpoints.NotificationCenterEndpoints` -- confirmed real routes
 * under `/api/v1/notifications/me`. Enum-ordinal-to-name mapping happens here, at the API
 * boundary, so nothing downstream ever sees a raw wire integer (see `notifications.types.ts`).
 */
@Injectable({ providedIn: 'root' })
export class NotificationsApi extends AlumniApiBase {
  list(skip: number, take: number): Observable<readonly NotificationItem[]> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.normalizeErrors(
      this.http.get<readonly RawNotificationDeliveryAttemptDto[]>(
        this.apiUrl('notifications/me/'),
        {
          params,
        },
      ),
    ).pipe(map((rows) => rows.map(toNotificationItem)));
  }

  unreadCount(): Observable<number> {
    return this.normalizeErrors(
      this.http.get<{ unreadCount: number }>(this.apiUrl('notifications/me/unread-count')),
    ).pipe(map((r) => r.unreadCount));
  }

  markRead(id: string): Observable<void> {
    return this.normalizeErrors(
      this.http.patch(
        this.apiUrl(`notifications/me/${id}/read`),
        {},
      ) as unknown as Observable<void>,
    );
  }

  markAllRead(): Observable<void> {
    return this.normalizeErrors(
      this.http.patch(this.apiUrl('notifications/me/read-all'), {}) as unknown as Observable<void>,
    );
  }
}
