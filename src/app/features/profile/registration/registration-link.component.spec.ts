import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { RegistrationLinkComponent } from './registration-link.component';

describe('RegistrationLinkComponent', () => {
  let fixture: ComponentFixture<RegistrationLinkComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiBaseUrl = 'http://localhost:5000';

  const dto = {
    id: 'a1',
    studentIdRef: 's1',
    graduationYear: 2020,
    programId: 'p1',
    departmentId: 'd1',
    profileVisibility: 'Public',
    currentEmployer: null,
    bio: null,
    location: null,
    contactEmail: null,
    contactPhone: null,
    hideCurrentEmployer: false,
    hideContactDetails: false,
    createdAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationLinkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  afterEach(() => httpMock.verify());

  it('loads the alumnus context on init and shows pending-link copy when not yet linked', () => {
    fixture = TestBed.createComponent(RegistrationLinkComponent);
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ title: 'alumnus.not_found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Linking your alumni account');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates to the authenticated home once a profile resolves', () => {
    fixture = TestBed.createComponent(RegistrationLinkComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush(dto);
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/directory');
  });

  it('recheck() triggers a forced reload of the alumnus context', () => {
    fixture = TestBed.createComponent(RegistrationLinkComponent);
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/profile`)
      .flush({ title: 'alumnus.not_found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    fixture.componentInstance['recheck']();
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/profile`).flush(dto);
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/directory');
  });
});
