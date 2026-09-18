import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { EventsStore } from './events.store';
import type { AlumniEventDto, ContentEventDto, RsvpDto } from '../events.types';

describe('EventsStore', () => {
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const contentEvent: ContentEventDto = {
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

  const alumniEvent: AlumniEventDto = {
    id: 'ae-1',
    title: 'Chapter Meetup',
    description: null,
    chapterId: null,
    contentEventId: null,
    eventDate: '2024-06-01T10:00:00Z',
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

  it('loads the calendar page', () => {
    const store = TestBed.inject(EventsStore);
    store.loadCalendar({ take: 50 });
    httpMock
      .expectOne((r) => r.url.includes('/content/events'))
      .flush({ items: [contentEvent], totalCount: 1, skip: 0, take: 50 });
    expect(store.calendar()).toEqual([contentEvent]);
    expect(store.totalCount()).toBe(1);
  });

  it('records a calendar load error', () => {
    const store = TestBed.inject(EventsStore);
    store.loadCalendar({});
    httpMock
      .expectOne((r) => r.url.includes('/content/events'))
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });

  it('loads a single alumni event by id', () => {
    const store = TestBed.inject(EventsStore);
    store.loadAlumniEvent('ae-1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/events/ae-1`).flush(alumniEvent);
    expect(store.selectedEvent()).toEqual(alumniEvent);
  });

  it('submits an rsvp and stores the result', (done) => {
    const store = TestBed.inject(EventsStore);
    const rsvp: RsvpDto = {
      id: 'rsvp-1',
      eventId: 'ae-1',
      alumnusId: 'alum-1',
      response: 'Going',
      guestCount: 1,
      respondedAt: '2024-05-01T00:00:00Z',
    };
    store.submitRsvp('ae-1', { response: 'Going', guestCount: 1 }).subscribe(() => {
      expect(store.myRsvp()).toEqual(rsvp);
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/events/ae-1/rsvp`).flush(rsvp);
  });
});
