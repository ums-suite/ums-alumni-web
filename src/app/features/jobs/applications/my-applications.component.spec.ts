import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { MyApplicationsComponent } from './my-applications.component';

const STORAGE_KEY = 'ums-alumni-web:job-applications';

describe('MyApplicationsComponent', () => {
  let fixture: ComponentFixture<MyApplicationsComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  async function setup(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [MyApplicationsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MyApplicationsComponent);
  }

  it('shows an empty state when nothing has been applied to', async () => {
    await setup();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("haven't applied");
  });

  it('shows a tracked application with the posting marked closed rather than removing it', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        j1: {
          id: 'app1',
          jobPostingId: 'j1',
          applicantUserId: 'u1',
          applicantIsAlumnus: true,
          note: null,
          resumeArtifactId: null,
          submittedAt: '2026-01-01T00:00:00Z',
        },
      }),
    );
    await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/jobs/j1`).flush({
      id: 'j1',
      posterUserId: 'u2',
      posterIsAlumnus: false,
      posterAlumnusId: null,
      title: 'Backend Engineer',
      company: 'Acme',
      description: 'd',
      location: 'Dhaka',
      contactMethod: 'email',
      expiresAt: '2020-01-01T00:00:00Z',
      status: 'Expired',
      moderationReason: null,
      createdAt: '2019-01-01T00:00:00Z',
      publishedAt: '2019-01-01T00:00:00Z',
      version: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Backend Engineer');
    expect(fixture.nativeElement.textContent).toContain('Posting closed');
  });
});
