import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { AlumnusContextService } from './alumnus-context.service';
import type { AlumnusDto } from '../http/alumnus-profile.types';

describe('AlumnusContextService', () => {
  let service: AlumnusContextService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const dto: AlumnusDto = {
    id: 'a1',
    studentIdRef: 's1',
    graduationYear: 2020,
    programId: 'p1',
    departmentId: 'd1',
    profileVisibility: 'Private',
    currentEmployer: null,
    bio: null,
    location: null,
    contactEmail: null,
    contactPhone: null,
    hideCurrentEmployer: false,
    hideContactDetails: false,
    createdAt: '2026-01-01T00:00:00Z',
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
    service = TestBed.inject(AlumnusContextService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the caller profile and marks isPendingVerification true when Private', () => {
    service.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush(dto);

    expect(service.profile()).toEqual(dto);
    expect(service.loading()).toBeFalse();
    expect(service.loaded()).toBeTrue();
    expect(service.notLinked()).toBeFalse();
    expect(service.isPendingVerification()).toBeTrue();
  });

  it('isPendingVerification is false once Visibility is Public', () => {
    service.load();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ ...dto, profileVisibility: 'Public' });

    expect(service.isPendingVerification()).toBeFalse();
  });

  it('marks notLinked on a 404 response, without setting a generic error', () => {
    service.load();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ title: 'alumnus.not_found' }, { status: 404, statusText: 'Not Found' });

    expect(service.notLinked()).toBeTrue();
    expect(service.profile()).toBeNull();
    expect(service.error()).toBeNull();
  });

  it('sets a generic error message on a non-404 failure', () => {
    service.load();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(service.notLinked()).toBeFalse();
    expect(service.error()).toBeTruthy();
  });

  it('does not re-fetch on a second load() call unless forced', () => {
    service.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush(dto);
    expect(service.loaded()).toBeTrue();

    service.load();
    httpMock.expectNone(`${apiBaseUrl}/api/v1/alumni/profile`);
    expect(service.profile()).toEqual(dto);

    service.load(true);
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush({ ...dto, bio: 'updated' });
    expect(service.profile()?.bio).toBe('updated');
  });

  it('applyUpdatedProfile replaces the cached profile and clears notLinked', () => {
    service.load();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ title: 'alumnus.not_found' }, { status: 404, statusText: 'Not Found' });
    expect(service.notLinked()).toBeTrue();

    service.applyUpdatedProfile(dto);
    expect(service.notLinked()).toBeFalse();
    expect(service.profile()).toEqual(dto);
  });

  it('reset clears all state back to initial', () => {
    service.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush(dto);
    service.reset();

    expect(service.profile()).toBeNull();
    expect(service.loaded()).toBeFalse();
    expect(service.loading()).toBeFalse();
    expect(service.notLinked()).toBeFalse();
    expect(service.error()).toBeNull();
  });
});
