import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { CampaignListComponent } from './campaign-list.component';

describe('CampaignListComponent', () => {
  let fixture: ComponentFixture<CampaignListComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CampaignListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads campaigns on init', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/donation-campaigns/'))
      .flush({
        items: [
          {
            id: 'c1',
            name: 'Scholarship Fund',
            description: 'Help fund scholarships',
            goalAmount: 100000,
            currency: 'BDT',
            startsAt: '2020-01-01T00:00:00Z',
            endsAt: '2099-01-01T00:00:00Z',
            closedEarly: false,
            createdAt: '2020-01-01T00:00:00Z',
          },
        ],
        skip: 0,
        take: 50,
      });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Scholarship Fund');
  });

  it('never renders an invented progress number -- shows the honest unavailable note instead', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/donation-campaigns/'))
      .flush({
        items: [
          {
            id: 'c1',
            name: 'Scholarship Fund',
            description: null,
            goalAmount: 100000,
            currency: 'BDT',
            startsAt: '2020-01-01T00:00:00Z',
            endsAt: '2099-01-01T00:00:00Z',
            closedEarly: false,
            createdAt: '2020-01-01T00:00:00Z',
          },
        ],
        skip: 0,
        take: 50,
      });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toMatch(/%|raised/i);
    expect(fixture.nativeElement.textContent).toContain('not yet available');
  });

  it('shows a Closed badge for a campaign outside its active window', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/donation-campaigns/'))
      .flush({
        items: [
          {
            id: 'c1',
            name: 'Old Drive',
            description: null,
            goalAmount: 1000,
            currency: 'BDT',
            startsAt: '2000-01-01T00:00:00Z',
            endsAt: '2001-01-01T00:00:00Z',
            closedEarly: false,
            createdAt: '2000-01-01T00:00:00Z',
          },
        ],
        skip: 0,
        take: 50,
      });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ums-badge')).toBeTruthy();
  });
});
