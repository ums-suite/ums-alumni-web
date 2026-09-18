import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { SuccessStoriesStore } from './success-stories.store';
import type { NoticeDto } from '../success-stories.types';

describe('SuccessStoriesStore', () => {
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const story: NoticeDto = {
    id: 'n1',
    title: 'From Campus to Career',
    body: 'It all started here. This is the full story of a graduate who made it big.',
    languageCode: 'en',
    audience: ['Public'],
    organizationNodeId: null,
    isUrgent: false,
    status: 'Published',
    publishAt: null,
    expireAt: null,
    publishedAt: '2024-01-01T00:00:00Z',
    archivedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    hasBengaliTranslation: false,
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
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the published list', () => {
    const store = TestBed.inject(SuccessStoriesStore);
    store.loadList({ take: 30 });
    httpMock
      .expectOne((r) => r.url.includes('/content/notices'))
      .flush({ items: [story], totalCount: 1, skip: 0, take: 30 });
    expect(store.items()).toEqual([story]);
  });

  it('loads a single story', () => {
    const store = TestBed.inject(SuccessStoriesStore);
    store.loadOne('n1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/content/notices/n1`).flush(story);
    expect(store.selected()).toEqual(story);
  });

  it('records a load error', () => {
    const store = TestBed.inject(SuccessStoriesStore);
    store.loadList({});
    httpMock
      .expectOne((r) => r.url.includes('/content/notices'))
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(store.error()).toBeTruthy();
  });
});
