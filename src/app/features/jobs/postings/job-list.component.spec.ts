import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { JobListComponent } from './job-list.component';
import type { JobPostingDto } from '../jobs.types';

describe('JobListComponent', () => {
  let fixture: ComponentFixture<JobListComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiBaseUrl = 'http://localhost:5000';

  const jobs: JobPostingDto[] = [
    {
      id: 'j1',
      posterUserId: 'u1',
      posterIsAlumnus: false,
      posterAlumnusId: null,
      title: 'Backend Engineer',
      company: 'Acme',
      description: 'd',
      location: 'Dhaka',
      contactMethod: 'email',
      expiresAt: '2027-01-01T00:00:00Z',
      status: 'Published',
      moderationReason: null,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 'j2',
      posterUserId: 'u2',
      posterIsAlumnus: true,
      posterAlumnusId: 'a2',
      title: 'Mentor Wanted',
      company: 'Beta',
      description: 'd',
      location: 'Chittagong',
      contactMethod: 'email',
      expiresAt: '2027-01-01T00:00:00Z',
      status: 'Published',
      moderationReason: null,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(JobListComponent);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  afterEach(() => httpMock.verify());

  it('loads Published postings on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/alumni/jobs/'));
    expect(req.request.params.get('status')).toBe('Published');
    req.flush(jobs);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Backend Engineer');
  });

  it('shows a verified-employer badge only for non-alumnus posters', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/jobs/')).flush(jobs);
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('ums-badge');
    expect(badges.length).toBe(1);
  });

  it('filters the already-fetched list client-side by query text', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/jobs/')).flush(jobs);
    fixture.componentInstance['query'].set('mentor');
    fixture.detectChanges();
    expect(fixture.componentInstance['filtered']().length).toBe(1);
    expect(fixture.componentInstance['filtered']()[0].id).toBe('j2');
  });

  it('navigates to the job detail on card click', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/jobs/')).flush(jobs);
    fixture.componentInstance['viewJob']('j1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/jobs/j1');
  });
});
