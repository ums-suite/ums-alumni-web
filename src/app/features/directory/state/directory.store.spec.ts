import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DirectoryStore } from './directory.store';

describe('DirectoryStore', () => {
  let store: InstanceType<typeof DirectoryStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const entry = {
    id: 'a1',
    graduationYear: 2020,
    programId: 'p1',
    departmentId: 'd1',
    currentEmployer: 'Acme',
    location: 'Dhaka',
    contactEmail: 'a@example.edu',
    contactPhone: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    store = TestBed.inject(DirectoryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('searches and populates items', () => {
    store.search({ graduationYear: 2020 });
    expect(store.isLoading()).toBeTrue();

    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({ items: [entry], skip: 0, take: 24 });

    expect(store.isLoading()).toBeFalse();
    expect(store.items()).toEqual([entry]);
  });

  it('surfaces an error message on a failed search', () => {
    store.search({});
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeTruthy();
  });

  it('loadMore appends to the existing items using the last filter', () => {
    store.search({ location: 'Dhaka' });
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({ items: [entry], skip: 0, take: 24 });

    store.loadMore();
    const req = httpMock.expectOne((r) => r.url.includes('/alumni/directory'));
    expect(req.request.params.get('location')).toBe('Dhaka');
    expect(req.request.params.get('skip')).toBe('24');
    req.flush({ items: [{ ...entry, id: 'a2' }], skip: 24, take: 24 });

    expect(store.items().length).toBe(2);
  });

  it('loadMore surfaces an error without clearing existing items', () => {
    store.search({});
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({ items: [entry], skip: 0, take: 24 });

    store.loadMore();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.error()).toBeTruthy();
    expect(store.items()).toEqual([entry]);
  });
});
