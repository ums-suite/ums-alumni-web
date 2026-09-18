import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { NotificationCenterComponent } from './notification-center.component';

describe('NotificationCenterComponent', () => {
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationCenterComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushEmpty(): void {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/notifications/me/') && !r.url.includes('unread-count'))
      .flush([]);
    httpMock.expectOne((r) => r.url.includes('unread-count')).flush({ unreadCount: 0 });
    fixture.detectChanges();
  }

  it('shows an empty state with no notifications', () => {
    flushEmpty();
    expect(fixture.nativeElement.textContent).toContain('No notifications');
  });

  it('renders an unread notification and marks it read on action', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/notifications/me/') && !r.url.includes('unread-count'))
      .flush([
        {
          id: 'n1',
          notificationRequestId: 'r1',
          channel: 4,
          status: 3,
          attemptCount: 1,
          deadLetterReason: null,
          lastError: null,
          deliveredAt: null,
          readAt: null,
          renderedSubject: 'Job Match',
          renderedBody: 'A new job matches your profile.',
          renderedDeepLink: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]);
    httpMock.expectOne((r) => r.url.includes('unread-count')).flush({ unreadCount: 1 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Job Match');

    fixture.componentInstance['markRead']('n1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/notifications/me/n1/read`).flush(null);
    fixture.detectChanges();

    expect(fixture.componentInstance['store'].unreadCount()).toBe(0);
  });
});
