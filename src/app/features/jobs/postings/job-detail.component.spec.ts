import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { JobDetailComponent } from './job-detail.component';
import type { JobPostingDto } from '../jobs.types';

describe('JobDetailComponent', () => {
  let fixture: ComponentFixture<JobDetailComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const job: JobPostingDto = {
    id: 'j1',
    posterUserId: 'other-user',
    posterIsAlumnus: false,
    posterAlumnusId: null,
    title: 'Backend Engineer',
    company: 'Acme',
    description: 'Build things',
    location: 'Dhaka',
    contactMethod: 'email: hr@acme.com',
    expiresAt: '2099-01-01T00:00:00Z',
    status: 'Published',
    moderationReason: null,
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  async function setup(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [JobDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ jobId: 'j1' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(JobDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('loads the posting by route param', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Backend Engineer');
  });

  it('shows a verified-employer badge for a non-alumnus poster', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ums-badge')).toBeTruthy();
  });

  it('shows the apply form when the posting is open and not yet applied to', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('shows a closed message and hides the apply form for a non-Published posting', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush({ ...job, status: 'Expired' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeFalsy();
    expect(fixture.componentInstance['canApply']()).toBeFalse();
  });

  it('submits an application and surfaces a specific message on a 409 (posting just closed)', async () => {
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();

    fixture.componentInstance['apply']();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1/apply`)
      .flush(null, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance['applyError']()).toContain('no longer accepting');
  });

  it('navigates to the edit route via editJob()', async () => {
    await setup();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();

    fixture.componentInstance['editJob']();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/jobs/j1/edit');
  });
});
