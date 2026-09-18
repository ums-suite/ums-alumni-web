import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DonationFlowStore } from './donation-flow.store';
import type { DonationDto } from '../donations.types';

describe('DonationFlowStore', () => {
  let store: InstanceType<typeof DonationFlowStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const donation: DonationDto = {
    id: 'd1',
    alumnusId: 'a1',
    campaignId: 'c1',
    amount: 500,
    currency: 'BDT',
    isAnonymous: false,
    recurrenceInterval: 'None',
    recurrenceStatus: null,
    seriesRootDonationId: null,
    status: 'Pending',
    invoiceId: 'inv1',
    createdAt: '2026-01-01T00:00:00Z',
    confirmedAt: null,
    nextChargeAt: null,
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
    store = TestBed.inject(DonationFlowStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function request() {
    return {
      campaignId: 'c1',
      amount: 500,
      currency: 'BDT',
      isAnonymous: false,
      recurrenceInterval: 'None' as const,
    };
  }

  it('creates the donation, then initiates payment with a fresh Idempotency-Key header, then redirects', () => {
    const onRedirect = jasmine.createSpy('onRedirect');
    store.startDonation(request(), onRedirect);

    const donationReq = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`);
    expect(donationReq.request.body.campaignId).toBe('c1');
    donationReq.flush(donation);

    const paymentReq = httpMock.expectOne(`${apiBaseUrl}/api/v1/finance/payments/`);
    expect(paymentReq.request.body.invoiceId).toBe('inv1');
    expect(paymentReq.request.headers.get('Idempotency-Key')).toBeTruthy();
    paymentReq.flush({ payment: { id: 'p1' }, redirectUrl: 'https://gateway.example/pay/p1' });

    expect(onRedirect).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 'd1' }),
      'https://gateway.example/pay/p1',
    );
    expect(store.submitting()).toBeFalse();
  });

  it('routes to the confirming screen (empty redirect) on a pure idempotency replay with no fresh redirect', () => {
    const onRedirect = jasmine.createSpy('onRedirect');
    store.startDonation(request(), onRedirect);

    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush(donation);
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/finance/payments/`)
      .flush({ payment: { id: 'p1' }, redirectUrl: null });

    expect(onRedirect).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'd1' }), '');
  });

  it('marks campaignClosed and surfaces the specific error on a donationcampaign.not_active rejection', () => {
    let capturedError: unknown;
    let capturedClosed = false;
    store.startDonation(
      request(),
      () => undefined,
      (error, closed) => {
        capturedError = error;
        capturedClosed = closed;
      },
    );

    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush(
        { title: 'This campaign has closed', code: 'donationcampaign.not_active' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(capturedClosed).toBeTrue();
    expect(store.campaignClosed()).toBeTrue();
    expect((capturedError as { code?: string }).code).toBe('donationcampaign.not_active');
  });

  it('does not mark campaignClosed for an unrelated donation-creation failure', () => {
    store.startDonation(request(), () => undefined);
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.campaignClosed()).toBeFalse();
    expect(store.error()).toBeTruthy();
  });

  it('surfaces an error if payment initiation fails after the donation was created', () => {
    let capturedClosed: boolean | null = null;
    store.startDonation(
      request(),
      () => undefined,
      (_error, closed) => (capturedClosed = closed),
    );

    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush(donation);
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/finance/payments/`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.error()).toBeTruthy();
    expect(capturedClosed).toBeFalse();
  });

  it('does not call Finance at all if the created donation has no invoiceId', () => {
    store.startDonation(request(), () => undefined);
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush({ ...donation, invoiceId: null });
    httpMock.expectNone(`${apiBaseUrl}/api/v1/finance/payments/`);
    expect(store.error()).toBeTruthy();
  });

  it('ignores a second concurrent startDonation call while one is already in flight', () => {
    store.startDonation(request(), () => undefined);
    store.startDonation(request(), () => undefined);
    const requests = httpMock.match(`${apiBaseUrl}/api/v1/alumni/donations/`);
    expect(requests.length).toBe(1);
    requests[0].flush(donation);
    httpMock.expectOne(`${apiBaseUrl}/api/v1/finance/payments/`).flush({
      payment: { id: 'p1' },
      redirectUrl: 'https://gateway.example/pay/p1',
    });
  });
});
