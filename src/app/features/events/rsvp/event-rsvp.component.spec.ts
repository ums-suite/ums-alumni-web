import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { EventRsvpComponent } from './event-rsvp.component';
import type { AlumniEventDto, RsvpDto } from '../events.types';

describe('EventRsvpComponent', () => {
  let fixture: ComponentFixture<EventRsvpComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const alumniEvent: AlumniEventDto = {
    id: 'ae-1',
    title: 'Chapter Meetup',
    description: 'Annual get-together',
    chapterId: null,
    contentEventId: null,
    eventDate: '2024-06-01T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRsvpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ alumniEventId: 'ae-1' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventRsvpComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushEvent(): void {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/events/ae-1`).flush(alumniEvent);
    fixture.detectChanges();
  }

  it('shows the event and a no-capacity-limit disclosure', () => {
    flushEvent();
    expect(fixture.nativeElement.textContent).toContain('Chapter Meetup');
    expect(fixture.nativeElement.textContent).toContain('capacity');
  });

  it('submits an rsvp and shows the confirmed response', () => {
    flushEvent();
    fixture.componentInstance['response'].set('Going');
    fixture.componentInstance['guestCount'].set('2');
    fixture.componentInstance['submitRsvp']();

    const rsvp: RsvpDto = {
      id: 'rsvp-1',
      eventId: 'ae-1',
      alumnusId: 'alum-1',
      response: 'Going',
      guestCount: 2,
      respondedAt: '2024-05-01T00:00:00Z',
    };
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/events/ae-1/rsvp`).flush(rsvp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Going');
  });

  it('rejects a negative guest count client-side without calling the server', () => {
    flushEvent();
    fixture.componentInstance['guestCount'].set('-1');
    fixture.componentInstance['submitRsvp']();
    httpMock.expectNone((r) => r.url.includes('/rsvp'));
    expect(fixture.componentInstance['submitError']()).toBeTruthy();
  });
});
