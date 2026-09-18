import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/config/app-config';
import { NotificationsApi } from './notifications.api';
import type { RawNotificationDeliveryAttemptDto } from './notifications.types';

describe('NotificationsApi', () => {
  let api: NotificationsApi;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    api = TestBed.inject(NotificationsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps raw wire enums into named NotificationItems on list()', (done) => {
    const raw: RawNotificationDeliveryAttemptDto = {
      id: 'n1',
      notificationRequestId: 'r1',
      channel: 4,
      status: 0,
      attemptCount: 1,
      deadLetterReason: null,
      lastError: null,
      deliveredAt: null,
      readAt: null,
      renderedSubject: 'Hi',
      renderedBody: 'Body',
      renderedDeepLink: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    api.list(0, 20).subscribe((items) => {
      expect(items).toEqual([
        {
          id: 'n1',
          channel: 'InApp',
          status: 'Pending',
          readAt: null,
          renderedSubject: 'Hi',
          renderedBody: 'Body',
          renderedDeepLink: null,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);
      done();
    });

    httpMock.expectOne((r) => r.url.includes('/notifications/me')).flush([raw]);
  });

  it('extracts unreadCount from the wrapped response', (done) => {
    api.unreadCount().subscribe((count) => {
      expect(count).toBe(3);
      done();
    });
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/notifications/me/unread-count`)
      .flush({ unreadCount: 3 });
  });

  it('marks one notification read', (done) => {
    api.markRead('n1').subscribe(() => {
      expect().nothing();
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/notifications/me/n1/read`).flush(null);
  });

  it('marks all notifications read', (done) => {
    api.markAllRead().subscribe(() => {
      expect().nothing();
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/notifications/me/read-all`).flush(null);
  });
});
