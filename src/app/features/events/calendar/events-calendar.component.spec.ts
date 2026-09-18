import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { EventsCalendarComponent } from './events-calendar.component';
import type { ContentEventDto } from '../events.types';

describe('EventsCalendarComponent', () => {
  let fixture: ComponentFixture<EventsCalendarComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const event: ContentEventDto = {
    id: 'ce-1',
    title: 'Reunion',
    body: 'Come celebrate',
    locationLabel: 'Main Campus',
    languageCode: 'en',
    audience: ['Alumni'],
    organizationNodeId: null,
    startAt: '2024-06-01T10:00:00Z',
    endAt: '2024-06-01T12:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsCalendarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventsCalendarComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows an empty state when no events are returned', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/content/events'))
      .flush({ items: [], totalCount: 0, skip: 0, take: 50 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No events');
  });

  it('renders each returned calendar event', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/content/events'))
      .flush({ items: [event], totalCount: 1, skip: 0, take: 50 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Reunion');
    expect(fixture.nativeElement.textContent).toContain('Main Campus');
  });

  it('loads more when the button is clicked', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/content/events'))
      .flush({ items: [event], totalCount: 2, skip: 0, take: 50 });
    fixture.detectChanges();

    fixture.componentInstance['loadMore']();
    const req = httpMock.expectOne((r) => r.url.includes('/content/events'));
    expect(req.request.params.get('skip')).toBe('1');
    req.flush({ items: [], totalCount: 2, skip: 1, take: 50 });
  });
});
