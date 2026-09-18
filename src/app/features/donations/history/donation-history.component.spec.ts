import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DonationHistoryComponent } from './donation-history.component';
import type { DonationDto } from '../donations.types';

describe('DonationHistoryComponent', () => {
  let fixture: ComponentFixture<DonationHistoryComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const confirmed: DonationDto = {
    id: 'd1',
    alumnusId: 'a1',
    campaignId: 'c1',
    amount: 500,
    currency: 'BDT',
    isAnonymous: false,
    recurrenceInterval: 'None',
    recurrenceStatus: null,
    seriesRootDonationId: null,
    status: 'Confirmed',
    invoiceId: 'inv1',
    createdAt: '2026-01-01T00:00:00Z',
    confirmedAt: '2026-01-01T00:05:00Z',
    nextChargeAt: null,
    version: 1,
  };

  const pausedRecurring: DonationDto = {
    id: 'd2',
    alumnusId: 'a1',
    campaignId: 'c1',
    amount: 1000,
    currency: 'BDT',
    isAnonymous: false,
    recurrenceInterval: 'Monthly',
    recurrenceStatus: 'Paused',
    seriesRootDonationId: 'd2',
    status: 'Confirmed',
    invoiceId: 'inv2',
    createdAt: '2026-01-01T00:00:00Z',
    confirmedAt: '2026-01-01T00:05:00Z',
    nextChargeAt: null,
    version: 3,
  };

  const activeRecurring: DonationDto = {
    ...pausedRecurring,
    id: 'd3',
    recurrenceStatus: 'Active',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationHistoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DonationHistoryComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads and renders the donation history', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([confirmed]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('500 BDT');
    expect(fixture.nativeElement.textContent).toContain('receipt has been generated');
  });

  it('shows the pause-and-notify state with a resume action for a Paused recurring donation', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([pausedRecurring]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Payment method needs updating');
    expect(fixture.nativeElement.querySelector('.alw-history__paused')).toBeTruthy();
  });

  it('resume action calls resumeRecurring on the store', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([pausedRecurring]);
    fixture.detectChanges();

    const spy = spyOn(fixture.componentInstance['store'], 'resumeRecurring');
    const resumeButton: HTMLElement = fixture.nativeElement.querySelector(
      '.alw-history__paused ums-button',
    );
    resumeButton.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledWith('d2');
  });

  it('shows a cancel action for an Active recurring donation, and it calls cancelRecurring', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([activeRecurring]);
    fixture.detectChanges();

    const spy = spyOn(fixture.componentInstance['store'], 'cancelRecurring');
    const cancelButton: HTMLElement = fixture.nativeElement.querySelector('ums-button');
    cancelButton.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledWith('d3');
  });

  it('does not show recurring management controls for a one-time donation', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([confirmed]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alw-history__paused')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('ums-button')).toBeFalsy();
  });

  it('statusVariant maps every real DonationStatus to its badge tone', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([]);
    const instance = fixture.componentInstance;
    expect(instance['statusVariant']('Confirmed')).toBe('success');
    expect(instance['statusVariant']('Failed')).toBe('danger');
    expect(instance['statusVariant']('Pending')).toBe('warning');
  });

  it('renders a Pending donation with its warning-toned status badge', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush([{ ...confirmed, id: 'd4', status: 'Pending' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pending');
  });

  it('renders a Failed donation without a receipt note', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush([{ ...confirmed, id: 'd5', status: 'Failed' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('receipt has been generated');
  });

  it('isRecurringSeriesRoot is false for a one-time donation and true for a recurring one', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([]);
    const instance = fixture.componentInstance;
    expect(instance['isRecurringSeriesRoot'](confirmed)).toBeFalse();
    expect(instance['isRecurringSeriesRoot'](pausedRecurring)).toBeTrue();
  });

  it('shows an empty state when there is no donation history', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("haven't made any donations");
  });
});
