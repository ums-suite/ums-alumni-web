import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { CampaignsStore, isCampaignActive } from './campaigns.store';
import type { DonationCampaignDto } from '../donations.types';

describe('CampaignsStore', () => {
  let store: InstanceType<typeof CampaignsStore>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const campaign: DonationCampaignDto = {
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    store = TestBed.inject(CampaignsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadAll populates items', () => {
    store.loadAll();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/donation-campaigns/'))
      .flush({ items: [campaign], skip: 0, take: 50 });
    expect(store.items()).toEqual([campaign]);
  });

  it('loadAll surfaces an error', () => {
    store.loadAll();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/donation-campaigns/'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });

  it('loadOne populates selected', () => {
    store.loadOne('c1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`).flush(campaign);
    expect(store.selected()).toEqual(campaign);
  });

  it('loadOne surfaces an error', () => {
    store.loadOne('c1');
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/donation-campaigns/c1`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(store.error()).toBeTruthy();
  });
});

describe('isCampaignActive', () => {
  const base = {
    id: 'c1',
    name: 'X',
    description: null,
    goalAmount: 1000,
    currency: 'BDT',
    createdAt: '2020-01-01T00:00:00Z',
  };

  it('is active when now falls within the window and not closed early', () => {
    const campaign = {
      ...base,
      startsAt: '2020-01-01T00:00:00Z',
      endsAt: '2099-01-01T00:00:00Z',
      closedEarly: false,
    };
    expect(isCampaignActive(campaign, new Date('2026-01-01T00:00:00Z'))).toBeTrue();
  });

  it('is not active before the start date', () => {
    const campaign = {
      ...base,
      startsAt: '2099-01-01T00:00:00Z',
      endsAt: '2100-01-01T00:00:00Z',
      closedEarly: false,
    };
    expect(isCampaignActive(campaign, new Date('2026-01-01T00:00:00Z'))).toBeFalse();
  });

  it('is not active after the end date', () => {
    const campaign = {
      ...base,
      startsAt: '2000-01-01T00:00:00Z',
      endsAt: '2001-01-01T00:00:00Z',
      closedEarly: false,
    };
    expect(isCampaignActive(campaign, new Date('2026-01-01T00:00:00Z'))).toBeFalse();
  });

  it('is not active when closedEarly is true, even inside the date window', () => {
    const campaign = {
      ...base,
      startsAt: '2020-01-01T00:00:00Z',
      endsAt: '2099-01-01T00:00:00Z',
      closedEarly: true,
    };
    expect(isCampaignActive(campaign, new Date('2026-01-01T00:00:00Z'))).toBeFalse();
  });
});
