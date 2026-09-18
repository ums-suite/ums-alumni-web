import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { SuccessStoriesListComponent } from './success-stories-list.component';
import type { NoticeDto } from '../success-stories.types';

describe('SuccessStoriesListComponent', () => {
  let fixture: ComponentFixture<SuccessStoriesListComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const story: NoticeDto = {
    id: 'n1',
    title: 'From Campus to Career',
    body: 'It all started here. This is the rest of the story.',
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessStoriesListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SuccessStoriesListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows an empty state with no published stories', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/content/notices'))
      .flush({ items: [], totalCount: 0, skip: 0, take: 30 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No success stories');
  });

  it('renders each story with a real-body-derived excerpt', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/content/notices'))
      .flush({ items: [story], totalCount: 1, skip: 0, take: 30 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('From Campus to Career');
    expect(fixture.nativeElement.textContent).toContain('It all started here.');
  });
});
