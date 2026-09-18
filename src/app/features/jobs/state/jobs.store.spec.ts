import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { JobsStore } from './jobs.store';
import type { JobPostingDto } from '../jobs.types';

describe('JobsStore', () => {
  let store: InstanceType<typeof JobsStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const posting: JobPostingDto = {
    id: 'j1',
    posterUserId: 'u1',
    posterIsAlumnus: true,
    posterAlumnusId: 'a1',
    title: 'Software Engineer',
    company: 'Acme',
    description: 'Build things',
    location: 'Dhaka',
    contactMethod: 'email: hr@acme.com',
    expiresAt: '2027-01-01T00:00:00Z',
    status: 'Published',
    moderationReason: null,
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    store = TestBed.inject(JobsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('searches and populates items', () => {
    store.search({});
    httpMock.expectOne((r) => r.url.includes('/alumni/jobs/')).flush([posting]);
    expect(store.items()).toEqual([posting]);
    expect(store.isLoading()).toBeFalse();
  });

  it('surfaces an error on a failed search', () => {
    store.search({});
    httpMock
      .expectOne((r) => r.url.includes('/alumni/jobs/'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });

  it('loadOne populates selected', () => {
    store.loadOne('j1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(posting);
    expect(store.selected()).toEqual(posting);
  });

  it('create posts and reloads the list', () => {
    store
      .create({
        title: 'X',
        company: 'Y',
        description: 'Z',
        location: 'Dhaka',
        contactMethod: 'email',
        expiresAt: '2027-01-01T00:00:00Z',
      })
      .subscribe();

    httpMock
      .expectOne((r) => r.url.includes('/alumni/jobs/') && r.method === 'POST')
      .flush(posting);
    httpMock
      .expectOne((r) => r.url.includes('/alumni/jobs/') && r.method === 'GET')
      .flush([posting]);
    expect(store.items()).toEqual([posting]);
  });

  it('update PATCHes and stores the result as selected', () => {
    store
      .update('j1', {
        title: 'X',
        company: 'Y',
        description: 'Z',
        location: 'Dhaka',
        contactMethod: 'email',
        expiresAt: '2027-01-01T00:00:00Z',
        version: 1,
      })
      .subscribe();

    const req = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...posting, title: 'X' });
    expect(store.selected()?.title).toBe('X');
  });

  it('withdraw DELETEs and reloads the list', () => {
    store.withdraw('j1', { reason: 'filled', version: 1 }).subscribe();
    const deleteReq = httpMock.expectOne(
      (r) => r.url === `${apiBaseUrl}/api/v1/alumni/jobs/j1` && r.method === 'DELETE',
    );
    deleteReq.flush(null);
    httpMock.expectOne((r) => r.url.includes('/alumni/jobs/') && r.method === 'GET').flush([]);
    expect(store.items()).toEqual([]);
  });
});
