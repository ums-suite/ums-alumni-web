import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DonationConfirmingComponent } from './donation-confirming.component';
import type { DonationDto } from '../donations.types';

describe('DonationConfirmingComponent', () => {
  let fixture: ComponentFixture<DonationConfirmingComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const pending: DonationDto = {
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

  async function setup(): Promise<void> {
    jasmine.clock().install();
    await TestBed.configureTestingModule({
      imports: [DonationConfirmingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ donationId: 'd1' }) } },
        },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DonationConfirmingComponent);
  }

  afterEach(() => {
    httpMock.verify();
    jasmine.clock().uninstall();
  });

  it('queries the donation status immediately on load (the mandatory status-query-on-return)', async () => {
    await setup();
    fixture.detectChanges();
    const req = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`);
    req.flush(pending);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Confirming your payment');
  });

  it('NEVER shows the confirmed state before the minimum confirming-display window elapses, even when the very first poll is already Confirmed', async () => {
    await setup();
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`)
      .flush({ ...pending, status: 'Confirmed' });
    fixture.detectChanges();

    // Domain Invariant #2 / the "never skipped or shortened" design decision: even though the
    // real, authoritative status is ALREADY Confirmed after the very first poll, the UI must
    // still show the confirming state for the minimum window before revealing success.
    expect(fixture.componentInstance['isConfirmed']()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Confirming your payment');

    jasmine.clock().tick(1500);
    fixture.detectChanges();
    expect(fixture.componentInstance['isConfirmed']()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Thank you');
  });

  it('shows the celebratory success state once revealed and never before', async () => {
    await setup();
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`)
      .flush({ ...pending, status: 'Confirmed' });
    jasmine.clock().tick(1500);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alw-confirming--success')).toBeTruthy();
  });

  it('shows the failed state (not confirmed) once revealed for a terminal Failed status', async () => {
    await setup();
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`)
      .flush({ ...pending, status: 'Failed' });
    jasmine.clock().tick(1500);
    fixture.detectChanges();
    expect(fixture.componentInstance['isFailed']()).toBeTrue();
    expect(fixture.componentInstance['isConfirmed']()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('couldn');
  });

  it('keeps polling on an interval while the donation stays Pending, and stops once terminal', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`).flush(pending);

    jasmine.clock().tick(3000);
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`).flush(pending);

    jasmine.clock().tick(3000);
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`)
      .flush({ ...pending, status: 'Confirmed' });

    jasmine.clock().tick(10000);
    httpMock.expectNone(`${apiBaseUrl}/api/v1/alumni/donations/d1`);
    expect(fixture.componentInstance['isConfirmed']()).toBeTrue();
  });

  it('shows a not-found state when the donation lookup itself fails', async () => {
    await setup();
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/d1`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.componentInstance['notFound']()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain("couldn't find");
  });

  it('shows a not-found state immediately when there is no donationId route param at all', async () => {
    jasmine.clock().install();
    await TestBed.configureTestingModule({
      imports: [DonationConfirmingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DonationConfirmingComponent);
    fixture.detectChanges();
    httpMock.expectNone((r) => r.url.includes('/alumni/donations/'));
    expect(fixture.componentInstance['notFound']()).toBeTrue();
  });
});
