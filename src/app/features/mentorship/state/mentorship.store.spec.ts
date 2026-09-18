import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { MentorshipStore } from './mentorship.store';
import type { MentorshipMatchDto, MentorshipOptInDto } from '../mentorship.types';

describe('MentorshipStore', () => {
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const optIn: MentorshipOptInDto = {
    id: 'optin-1',
    personId: 'alum-1',
    role: 'Mentor',
    expertiseAreas: 'Engineering',
    capacityLimit: 2,
    activeCount: 0,
    availability: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const match: MentorshipMatchDto = {
    id: 'match-1',
    mentorAlumnusId: 'alum-1',
    menteeStudentId: 'stu-1',
    status: 'Proposed',
    proposedAt: '2024-01-01T00:00:00Z',
    mentorAcceptedAt: null,
    menteeAcceptedAt: null,
    activatedAt: null,
    endedAt: null,
    endedReason: null,
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

  it('loads the caller’s own matches', () => {
    const store = TestBed.inject(MentorshipStore);
    store.loadMatches();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches`).flush([match]);
    expect(store.matches()).toEqual([match]);
    expect(store.isLoading()).toBe(false);
  });

  it('records a load error', () => {
    const store = TestBed.inject(MentorshipStore);
    store.loadMatches();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches`)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });

  it('opts in and stores the resulting profile', (done) => {
    const store = TestBed.inject(MentorshipStore);
    store
      .optIn({
        role: 'Mentor',
        expertiseAreas: 'Engineering',
        capacityLimit: 2,
        availability: null,
      })
      .subscribe(() => {
        expect(store.myOptIn()).toEqual(optIn);
        done();
      });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/opt-in`).flush(optIn);
  });

  it('accepts a match and replaces it in state', (done) => {
    const store = TestBed.inject(MentorshipStore);
    store.loadMatches();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches`).flush([match]);

    const active = {
      ...match,
      status: 'Active' as const,
      mentorAcceptedAt: 'x',
      menteeAcceptedAt: 'y',
    };
    store.acceptMatch('match-1').subscribe(() => {
      expect(store.matches()).toEqual([active]);
      done();
    });
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches/match-1/accept`)
      .flush(active);
  });

  it('ends a match and replaces it in state', (done) => {
    const store = TestBed.inject(MentorshipStore);
    store.loadMatches();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches`).flush([match]);

    const ended = { ...match, status: 'Ended' as const, endedReason: 'done' };
    store.endMatch('match-1', { reason: 'done' }).subscribe(() => {
      expect(store.matches()).toEqual([ended]);
      done();
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/mentorship/matches/match-1/end`).flush(ended);
  });
});
