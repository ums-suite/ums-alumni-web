import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { alumnusLinkedGuard } from './alumnus-linked.guard';

describe('alumnusLinkedGuard', () => {
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
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /**
   * `alumnusLinkedGuard` returns a cold Observable (never subscribed until the router -- or this
   * test -- subscribes). `firstValueFrom(...)` must be CALLED (which subscribes synchronously,
   * synchronously dispatching the underlying `HttpClient.get()` against the TestingBackend)
   * before `httpMock.expectOne(...)` runs, or the expectation fails with "found none" since no
   * request was ever made yet. This was a real bug in this test's first draft.
   */
  function resolveGuard(): Promise<unknown> {
    const guardResult = TestBed.runInInjectionContext(() =>
      alumnusLinkedGuard({} as never, { url: '/app/directory' } as never),
    );
    return isObservable(guardResult) ? firstValueFrom(guardResult) : Promise.resolve(guardResult);
  }

  it('allows activation when the caller has a linked Alumnus record', async () => {
    const resultPromise = resolveGuard();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush({
      id: 'a1',
      studentIdRef: 's1',
      graduationYear: 2020,
      programId: 'p1',
      departmentId: 'd1',
      profileVisibility: 'Public',
      currentEmployer: null,
      bio: null,
      location: null,
      contactEmail: null,
      contactPhone: null,
      hideCurrentEmployer: false,
      hideContactDetails: false,
      createdAt: '2026-01-01T00:00:00Z',
      version: 1,
    });

    expect(await resultPromise).toBeTrue();
  });

  it('redirects to registration recovery when no Alumnus record is linked', async () => {
    const router = TestBed.inject(Router);
    const resultPromise = resolveGuard();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ title: 'alumnus.not_found' }, { status: 404, statusText: 'Not Found' });

    expect(await resultPromise).toEqual(router.createUrlTree(['/register/recovery']));
  });
});
