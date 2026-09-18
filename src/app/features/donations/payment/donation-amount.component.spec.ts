import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { DonationAmountComponent } from './donation-amount.component';

describe('DonationAmountComponent', () => {
  let fixture: ComponentFixture<DonationAmountComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiBaseUrl = 'http://localhost:5000';

  const campaign = {
    id: 'c1',
    name: 'Scholarship Fund',
    description: 'Funds real scholarships',
    goalAmount: 100000,
    currency: 'BDT',
    startsAt: '2020-01-01T00:00:00Z',
    endsAt: '2099-01-01T00:00:00Z',
    closedEarly: false,
    createdAt: '2020-01-01T00:00:00Z',
  };

  const donation = {
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
    await TestBed.configureTestingModule({
      imports: [DonationAmountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ campaignId: 'c1' }) } },
        },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(DonationAmountComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('shows a loading message before the campaign resolves', async () => {
    await TestBed.configureTestingModule({
      imports: [DonationAmountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ campaignId: 'c1' }) } },
        },
      ],
    }).compileComponents();
    const localHttpMock = TestBed.inject(HttpTestingController);
    const localFixture = TestBed.createComponent(DonationAmountComponent);
    localFixture.detectChanges();
    expect(localFixture.nativeElement.textContent).toContain('Loading');
    localHttpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
  });

  it('shows an error message when the campaign fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [DonationAmountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ campaignId: 'c1' }) } },
        },
      ],
    }).compileComponents();
    const localHttpMock = TestBed.inject(HttpTestingController);
    const localFixture = TestBed.createComponent(DonationAmountComponent);
    localFixture.detectChanges();
    localHttpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    localFixture.detectChanges();
    expect(localFixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('loads the campaign and shows its own description as the impact framing', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('Funds real scholarships');
  });

  it('selectPreset updates the chosen amount', async () => {
    await setup();
    fixture.componentInstance['selectPreset'](2500);
    expect(fixture.componentInstance['amount']()).toBe(2500);
  });

  it('submits a one-time donation and redirects to the gateway on success', async () => {
    await setup();
    const navSpy = spyOn(
      fixture.componentInstance as unknown as { navigateToGateway: (u: string) => void },
      'navigateToGateway',
    );
    fixture.componentInstance['submit']();

    const donationReq = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`);
    expect(donationReq.request.body.recurrenceInterval).toBe('None');
    expect(donationReq.request.body.isAnonymous).toBeFalse();
    donationReq.flush(donation);

    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/finance/payments/`)
      .flush({ payment: { id: 'p1' }, redirectUrl: 'https://gateway.example/pay/p1' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/donations/d1/confirming');
    expect(navSpy).toHaveBeenCalledWith('https://gateway.example/pay/p1');
  });

  it('submits a recurring, anonymous donation with the chosen interval', async () => {
    await setup();
    spyOn(
      fixture.componentInstance as unknown as { navigateToGateway: (u: string) => void },
      'navigateToGateway',
    );
    fixture.componentInstance['isRecurring'].set(true);
    fixture.componentInstance['recurrenceInterval'].set('Quarterly');
    fixture.componentInstance['isAnonymous'].set(true);
    fixture.componentInstance['submit']();

    const donationReq = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`);
    expect(donationReq.request.body.recurrenceInterval).toBe('Quarterly');
    expect(donationReq.request.body.isAnonymous).toBeTrue();
    donationReq.flush({ ...donation, recurrenceInterval: 'Quarterly', isAnonymous: true });

    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/finance/payments/`)
      .flush({ payment: { id: 'p1' }, redirectUrl: 'https://gateway.example/pay/p1' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/donations/d1/confirming');
  });

  it('never redirects to a gateway when the campaign has just closed -- shows the closed message instead', async () => {
    await setup();
    fixture.componentInstance['submit']();

    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush(
        { title: 'closed', code: 'donationcampaign.not_active' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(fixture.componentInstance['campaignClosed']()).toBeTrue();
    httpMock.expectNone(`${apiBaseUrl}/api/v1/finance/payments/`);
    expect(fixture.nativeElement.textContent).toContain('closed');
  });

  it('surfaces a generic error for a non-campaign-closed failure', async () => {
    await setup();
    fixture.componentInstance['submit']();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donations/`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(fixture.componentInstance['errorMessage']()).toBeTruthy();
    expect(fixture.componentInstance['campaignClosed']()).toBeFalse();
  });

  it('clicking a preset amount button updates the selected amount via the real DOM', async () => {
    await setup();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.alw-donation-amount__preset',
    );
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance['amount']()).toBe(1000);
    expect(buttons[1].classList).toContain('alw-donation-amount__preset--selected');
  });

  it('checking the recurring checkbox reveals the interval selector in the template', async () => {
    await setup();
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      '.alw-donation-amount__check input[type="checkbox"]',
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance['isRecurring']()).toBeTrue();
    expect(fixture.nativeElement.querySelector('ums-select')).toBeTruthy();
  });

  it('checking the anonymous checkbox updates the signal via the real DOM', async () => {
    await setup();
    const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.alw-donation-amount__check input[type="checkbox"]',
    );
    const anonymousCheckbox = checkboxes[checkboxes.length - 1];
    anonymousCheckbox.checked = true;
    anonymousCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance['isAnonymous']()).toBeTrue();
  });

  it('does not submit when the amount is zero or less', async () => {
    await setup();
    fixture.componentInstance['amount'].set(0);
    fixture.componentInstance['submit']();
    httpMock.expectNone(`${apiBaseUrl}/api/v1/alumni/donations/`);
    expect(fixture.componentInstance['flow'].submitting()).toBeFalse();
  });
});
