import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DonationHistoryStore } from './donation-history.store';
import type { DonationDto } from '../donations.types';

describe('DonationHistoryStore', () => {
  let store: InstanceType<typeof DonationHistoryStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const donation: DonationDto = {
    id: 'd1',
    alumnusId: 'a1',
    campaignId: 'c1',
    amount: 500,
    currency: 'BDT',
    isAnonymous: false,
    recurrenceInterval: 'Monthly',
    recurrenceStatus: 'Paused',
    seriesRootDonationId: 'd1',
    status: 'Confirmed',
    invoiceId: 'inv1',
    createdAt: '2026-01-01T00:00:00Z',
    confirmedAt: '2026-01-01T00:05:00Z',
    nextChargeAt: '2026-02-01T00:00:00Z',
    version: 2,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    store = TestBed.inject(DonationHistoryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the caller donation history', () => {
    store.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([donation]);
    expect(store.items()).toEqual([donation]);
  });

  it('surfaces an error on a failed load', () => {
    store.load();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });

  it('resumeRecurring updates the matching item in place', () => {
    store.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([donation]);

    store.resumeRecurring('d1');
    expect(store.mutatingId()).toBe('d1');
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1/resume-recurring`)
      .flush({ ...donation, recurrenceStatus: 'Active' });

    expect(store.mutatingId()).toBeNull();
    expect(store.items()[0].recurrenceStatus).toBe('Active');
  });

  it('cancelRecurring updates the matching item in place', () => {
    store.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([donation]);

    store.cancelRecurring('d1');
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1/cancel-recurring`)
      .flush({ ...donation, recurrenceStatus: 'Cancelled' });

    expect(store.items()[0].recurrenceStatus).toBe('Cancelled');
  });

  it('surfaces an error and clears mutatingId on a failed cancelRecurring', () => {
    store.load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([donation]);

    store.cancelRecurring('d1');
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1/cancel-recurring`)
      .flush(null, { status: 409, statusText: 'Conflict' });

    expect(store.mutatingId()).toBeNull();
    expect(store.error()).toBeTruthy();
    expect(store.items()[0].recurrenceStatus).toBe('Paused');
  });
});
