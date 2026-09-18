import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ChapterListComponent } from './chapter-list.component';
import type { ChapterDto } from '../chapters.types';

describe('ChapterListComponent', () => {
  let fixture: ComponentFixture<ChapterListComponent>;
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
      imports: [ChapterListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChapterListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows an empty state when no chapters exist', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/chapters')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No chapters');
  });

  it('renders each chapter with its member count', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/chapters')).flush([chapter]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dhaka Chapter');
    expect(fixture.nativeElement.textContent).toContain('10');
  });

  it('assigns a deterministic accent class per chapter', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/chapters')).flush([]);

    expect(fixture.componentInstance['accentClass']('c1')).toBe(
      fixture.componentInstance['accentClass']('c1'),
    );
  });
});
