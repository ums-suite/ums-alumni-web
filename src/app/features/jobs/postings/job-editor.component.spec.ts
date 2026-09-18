import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { JobEditorComponent } from './job-editor.component';
import type { JobPostingDto } from '../jobs.types';

describe('JobEditorComponent', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  const apiBaseUrl = 'http://localhost:5000';

  const job: JobPostingDto = {
    id: 'j1',
    posterUserId: 'u1',
    posterIsAlumnus: true,
    posterAlumnusId: 'a1',
    title: 'Backend Engineer',
    company: 'Acme',
    description: 'Build things',
    location: 'Dhaka',
    contactMethod: 'email',
    expiresAt: '2027-01-01T00:00:00Z',
    status: 'Published',
    moderationReason: null,
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  async function setup(jobId: string | null): Promise<ComponentFixture<JobEditorComponent>> {
    await TestBed.configureTestingModule({
      imports: [JobEditorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(jobId ? { jobId } : {}) } },
        },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    return TestBed.createComponent(JobEditorComponent);
  }

  afterEach(() => httpMock.verify());

  it('create mode: does not load an existing posting', async () => {
    const fixture = await setup(null);
    fixture.detectChanges();
    expect(fixture.componentInstance['isEditMode']()).toBeFalse();
    httpMock.expectNone((r) => r.url.includes('/alumni/jobs/j1'));
  });

  it('create mode: posts a new job and navigates to its detail page', async () => {
    const fixture = await setup(null);
    fixture.detectChanges();
    fixture.componentInstance['title'].set('New Role');
    fixture.componentInstance['company'].set('Acme');
    fixture.componentInstance['description'].set('desc');
    fixture.componentInstance['location'].set('Dhaka');
    fixture.componentInstance['contactMethod'].set('email');
    fixture.componentInstance['expiresAt'].set('2027-01-01');
    fixture.componentInstance['save']();

    const createReq = httpMock.expectOne(
      (r) => r.url.endsWith('/alumni/jobs/') && r.method === 'POST',
    );
    createReq.flush(job);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.endsWith('/alumni/jobs/')).flush([job]);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/jobs/j1');
  });

  it('edit mode: loads and pre-fills the existing posting', async () => {
    const fixture = await setup('j1');
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();
    expect(fixture.componentInstance['title']()).toBe('Backend Engineer');
  });

  it('edit mode: re-checks moderation status at save time and blocks a save on a removed posting', async () => {
    const fixture = await setup('j1');
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();

    fixture.componentInstance['save']();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush({ ...job, status: 'Removed' });

    expect(fixture.componentInstance['errorMessage']()).toContain('removed by moderation');
    httpMock.expectNone((r) => r.method === 'PATCH');
  });

  it('edit mode: saves via PATCH with the freshly re-fetched version and navigates on success', async () => {
    const fixture = await setup('j1');
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();

    fixture.componentInstance['save']();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush({ ...job, version: 3 });

    const patchReq = httpMock.expectOne(
      (r) => r.url === `${apiBaseUrl}/api/v1/alumni/jobs/j1` && r.method === 'PATCH',
    );
    expect(patchReq.request.body.version).toBe(3);
    patchReq.flush(job);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/jobs/j1');
  });

  it('edit mode: surfaces a specific message on a 409 concurrency conflict', async () => {
    const fixture = await setup('j1');
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    fixture.detectChanges();

    fixture.componentInstance['save']();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush(job);
    httpMock
      .expectOne((r) => r.method === 'PATCH')
      .flush(null, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance['errorMessage']()).toContain('changed elsewhere');
  });
});
