import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { MyApplicationsStore } from './my-applications.store';
import type { JobPostingDto } from '../jobs.types';

const STORAGE_KEY = 'ums-alumni-web:job-applications';

describe('MyApplicationsStore', () => {
  let store: InstanceType<typeof MyApplicationsStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const posting: JobPostingDto = {
    id: 'j1',
    posterUserId: 'u1',
    posterIsAlumnus: false,
    posterAlumnusId: null,
    title: 'Engineer',
    company: 'Acme',
    description: 'd',
    location: 'Dhaka',
    contactMethod: 'email',
    expiresAt: '2020-01-01T00:00:00Z',
    status: 'Expired',
    moderationReason: null,
    createdAt: '2019-01-01T00:00:00Z',
    publishedAt: '2019-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    store = TestBed.inject(MyApplicationsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('starts empty when nothing is stored', () => {
    expect(store.byJobId()).toEqual({});
  });

  it('apply() records the application and persists it to localStorage', () => {
    store.apply('j1', { note: 'hire me', resumeArtifactId: null }).subscribe();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1/apply`).flush({
      id: 'app1',
      jobPostingId: 'j1',
      applicantUserId: 'u2',
      applicantIsAlumnus: true,
      note: 'hire me',
      resumeArtifactId: null,
      submittedAt: '2026-01-01T00:00:00Z',
    });

    expect(store.hasApplied('j1')).toBeTrue();
    expect(store.submitting()).toBeFalse();
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.j1.id).toBe('app1');
  });

  it('hasApplied is false for an unknown job', () => {
    expect(store.hasApplied('unknown')).toBeFalse();
  });

  it('clears submitting on a failed apply', () => {
    store.apply('j1', { note: null, resumeArtifactId: null }).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1/apply`)
      .flush(null, { status: 409, statusText: 'Conflict' });
    expect(store.submitting()).toBeFalse();
    expect(store.hasApplied('j1')).toBeFalse();
  });

  it('refreshPostingStatuses fetches the real, current posting for each tracked application', () => {
    store.apply('j1', { note: null, resumeArtifactId: null }).subscribe();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1/apply`).flush({
      id: 'app1',
      jobPostingId: 'j1',
      applicantUserId: 'u2',
      applicantIsAlumnus: true,
      note: null,
      resumeArtifactId: null,
      submittedAt: '2026-01-01T00:00:00Z',
    });

    store.refreshPostingStatuses();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(posting);

    expect(store.byJobId()['j1'].posting?.status).toBe('Expired');
  });

  it('refreshPostingStatuses leaves the tracked application intact if the posting lookup fails', () => {
    store.apply('j1', { note: null, resumeArtifactId: null }).subscribe();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1/apply`).flush({
      id: 'app1',
      jobPostingId: 'j1',
      applicantUserId: 'u2',
      applicantIsAlumnus: true,
      note: null,
      resumeArtifactId: null,
      submittedAt: '2026-01-01T00:00:00Z',
    });

    store.refreshPostingStatuses();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`)
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(store.byJobId()['j1'].application.id).toBe('app1');
  });
});
