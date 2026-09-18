import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { SuccessStoriesSeoService } from '../success-stories-seo.service';
import { SuccessStoryDetailComponent } from './success-story-detail.component';
import type { NoticeDto } from '../success-stories.types';

describe('SuccessStoryDetailComponent', () => {
  let fixture: ComponentFixture<SuccessStoryDetailComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const story: NoticeDto = {
    id: 'n1',
    title: 'From Campus to Career',
    body: 'It all started here. The rest of the journey unfolds below in full detail.',
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
      imports: [SuccessStoryDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ storyId: 'n1' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SuccessStoryDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SuccessStoriesSeoService).clear();
  });

  it('renders the story with its title, pull-quote excerpt, and full body', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/content/notices/n1`).flush(story);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('From Campus to Career');
    expect(fixture.nativeElement.querySelector('blockquote').textContent).toContain(
      'It all started here.',
    );
  });

  it('applies SEO metadata once the story loads', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/content/notices/n1`).flush(story);
    fixture.detectChanges();

    expect(document.title).toContain('From Campus to Career');
    expect(document.getElementById('alw-story-jsonld')).toBeTruthy();
  });
});
