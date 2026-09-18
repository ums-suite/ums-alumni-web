import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ChapterDetailComponent } from './chapter-detail.component';
import type { ChapterDto } from '../chapters.types';

describe('ChapterDetailComponent', () => {
  let fixture: ComponentFixture<ChapterDetailComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const chapter: ChapterDto = {
    id: 'c1',
    name: 'Dhaka Chapter',
    description: 'For alumni in Dhaka',
    region: 'Dhaka',
    memberCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ chapterId: 'c1' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChapterDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushChapter(): void {
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1`).flush(chapter);
    fixture.detectChanges();
  }

  it('shows the chapter and an honest event-feed unavailable note', () => {
    flushChapter();
    expect(fixture.nativeElement.textContent).toContain('Dhaka Chapter');
    expect(fixture.nativeElement.textContent).toContain('not yet available');
  });

  it('shows a join action when not yet a member', () => {
    flushChapter();
    expect(fixture.nativeElement.textContent).toContain('Join');
  });

  it('switches to a leave action after joining', () => {
    flushChapter();
    fixture.componentInstance['join']();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1/join`)
      .flush({ ...chapter, memberCount: 11 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Leave');
  });
});
