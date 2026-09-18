import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ProfileEditComponent } from './profile-edit.component';
import type { AlumnusDto } from '../../../core/http/alumnus-profile.types';

describe('ProfileEditComponent', () => {
  let fixture: ComponentFixture<ProfileEditComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const dto: AlumnusDto = {
    id: 'a1',
    studentIdRef: 's1',
    graduationYear: 2019,
    programId: 'p1',
    departmentId: 'd1',
    profileVisibility: 'Private',
    currentEmployer: 'Acme',
    bio: 'Hello',
    location: 'Dhaka',
    contactEmail: 'a@x.com',
    contactPhone: '+8801000000',
    hideCurrentEmployer: false,
    hideContactDetails: true,
    createdAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileEditComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function loadProfile(overrides: Partial<AlumnusDto> = {}): void {
    fixture.detectChanges();
    fixture.componentInstance['context'].load();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush({ ...dto, ...overrides });
    fixture.detectChanges();
  }

  it('shows a loading state before the profile resolves', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
  });

  it('populates form fields from the loaded profile', () => {
    loadProfile();
    expect(fixture.componentInstance['currentEmployer']()).toBe('Acme');
    expect(fixture.componentInstance['hideContactDetails']()).toBeTrue();
  });

  it('shows the pending-verification banner when profileVisibility is Private', () => {
    loadProfile({ profileVisibility: 'Private' });
    expect(fixture.nativeElement.textContent).toContain('awaiting admin verification');
  });

  it('does not show the pending-verification banner when Public', () => {
    loadProfile({ profileVisibility: 'Public' });
    expect(fixture.nativeElement.textContent).not.toContain('awaiting admin verification');
  });

  it('the live preview hides contact details when hideContactDetails is set', () => {
    loadProfile({ hideContactDetails: true });
    const preview = fixture.componentInstance['preview']();
    expect(preview.contactEmail).toBeNull();
    expect(preview.contactPhone).toBeNull();
    expect(preview.currentEmployer).toBe('Acme');
  });

  it('the live preview reflects a hideCurrentEmployer toggle immediately', () => {
    loadProfile({ hideCurrentEmployer: false });
    expect(fixture.componentInstance['preview']().currentEmployer).toBe('Acme');

    fixture.componentInstance['hideCurrentEmployer'].set(true);
    expect(fixture.componentInstance['preview']().currentEmployer).toBeNull();
  });

  it('saves the form and calls updateMyProfile with the current field values', () => {
    loadProfile();
    fixture.componentInstance['bio'].set('Updated bio');
    fixture.componentInstance['save']();

    const req = httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.bio).toBe('Updated bio');
    req.flush({ ...dto, bio: 'Updated bio' });

    expect(fixture.componentInstance['saving']()).toBeFalse();
  });

  it('surfaces an error message when save fails', () => {
    loadProfile();
    fixture.componentInstance['save']();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(fixture.componentInstance['errorMessage']()).toBeTruthy();
  });

  it('does not allow a second concurrent save while one is in flight', () => {
    loadProfile();
    fixture.componentInstance['save']();
    fixture.componentInstance['save']();
    const requests = httpMock.match(() => true).filter((r) => r.request.method === 'PUT');
    expect(requests.length).toBe(1);
    requests[0].flush(dto);
  });
});
