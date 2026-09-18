import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TokenStorageService } from '@ums/shared';
import { APP_CONFIG } from '../../../core/config/app-config';
import { CampaignDetailComponent } from './campaign-detail.component';

describe('CampaignDetailComponent', () => {
  let fixture: ComponentFixture<CampaignDetailComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  const apiBaseUrl = 'http://localhost:5000';

  const campaign = {
    id: 'c1',
    name: 'Scholarship Fund',
    description: 'Help fund scholarships',
    goalAmount: 100000,
    currency: 'BDT',
    startsAt: '2020-01-01T00:00:00Z',
    endsAt: '2099-01-01T00:00:00Z',
    closedEarly: false,
    createdAt: '2020-01-01T00:00:00Z',
  };

  async function setup(): Promise<void> {
    tokenStorage = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
      'getAccessToken',
    ]);
    await TestBed.configureTestingModule({
      imports: [CampaignDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        { provide: TokenStorageService, useValue: tokenStorage },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ campaignId: 'c1' }) } },
        },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(CampaignDetailComponent);
  }

  function setAuthenticated(value: boolean): void {
    (tokenStorage as unknown as { isAuthenticated: () => boolean }).isAuthenticated = () => value;
  }

  afterEach(() => httpMock.verify());

  it('loads the campaign by route param', async () => {
    await setup();
    setAuthenticated(false);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Scholarship Fund');
  });

  it('donate() sends an unauthenticated visitor to login with a returnUrl', async () => {
    await setup();
    setAuthenticated(false);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
    fixture.detectChanges();

    fixture.componentInstance['donate']();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/app/donations/new/c1' },
    });
  });

  it('donate() sends an authenticated alumnus straight to the amount-selection screen', async () => {
    await setup();
    setAuthenticated(true);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
    fixture.detectChanges();

    fixture.componentInstance['donate']();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/donations/new/c1');
  });

  it('shows the closed message and no Donate button for an inactive campaign', async () => {
    await setup();
    setAuthenticated(true);
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`)
      .flush({ ...campaign, closedEarly: true });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('closed');
    expect(fixture.nativeElement.querySelector('ums-button')).toBeFalsy();
  });
});
