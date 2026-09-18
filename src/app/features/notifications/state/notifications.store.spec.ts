import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { NotificationsStore } from './notifications.store';
import type { NotificationItem } from '../notifications.types';

describe('NotificationsStore', () => {
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const unread: NotificationItem = {
    id: 'n1',
    channel: 'InApp',
    status: 'Delivered',
    readAt: null,
    renderedSubject: 'Hi',
    renderedBody: 'Body',
    renderedDeepLink: null,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushLoad(items: readonly NotificationItem[], unreadCount: number): void {
    httpMock
      .expectOne((r) => r.url.includes('/notifications/me/') && !r.url.includes('unread-count'))
      .flush(
        items.map((item) => ({
          id: item.id,
          notificationRequestId: 'r',
          channel: 4,
          status: item.status === 'Delivered' ? 3 : 0,
          attemptCount: 1,
          deadLetterReason: null,
          lastError: null,
          deliveredAt: null,
          readAt: item.readAt,
          renderedSubject: item.renderedSubject,
          renderedBody: item.renderedBody,
          renderedDeepLink: item.renderedDeepLink,
          createdAt: item.createdAt,
          updatedAt: item.createdAt,
        })),
      );
    httpMock.expectOne((r) => r.url.includes('unread-count')).flush({ unreadCount });
  }

  it('loads items and unread count', () => {
    const store = TestBed.inject(NotificationsStore);
    store.load();
    flushLoad([unread], 1);
    expect(store.items()).toEqual([unread]);
    expect(store.unreadCount()).toBe(1);
  });

  it('decrements unread count when marking one unread item read', (done) => {
    const store = TestBed.inject(NotificationsStore);
    store.load();
    flushLoad([unread], 1);

    store.markRead('n1').subscribe(() => {
      expect(store.unreadCount()).toBe(0);
      expect(store.items()[0].readAt).toBeTruthy();
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/notifications/me/n1/read`).flush(null);
  });

  it('marks everything read and zeroes the unread count', (done) => {
    const store = TestBed.inject(NotificationsStore);
    store.load();
    flushLoad([unread], 1);

    store.markAllRead().subscribe(() => {
      expect(store.unreadCount()).toBe(0);
      expect(store.items().every((item) => item.readAt)).toBe(true);
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/notifications/me/read-all`).flush(null);
  });
});
