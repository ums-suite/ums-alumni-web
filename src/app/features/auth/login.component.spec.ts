import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('does not submit when fields are empty', () => {
    fixture.componentInstance['submit']();
    httpMock.expectNone(`${apiBaseUrl}/api/v1/identity/auth/login`);
    expect(fixture.componentInstance['submitting']()).toBeFalse();
  });

  it('navigates to the authenticated home on a successful login', () => {
    fixture.componentInstance['identifier'].set('alum@example.edu');
    fixture.componentInstance['password'].set('correct-horse');
    fixture.componentInstance['submit']();

    const req = httpMock.expectOne((r) => r.url.includes('/identity/auth/login'));
    req.flush({ accessToken: 'a', refreshToken: 'r', expiresAt: new Date().toISOString() });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/directory');
  });

  it('surfaces an error message on a failed login', () => {
    fixture.componentInstance['identifier'].set('alum@example.edu');
    fixture.componentInstance['password'].set('wrong');
    fixture.componentInstance['submit']();

    const req = httpMock.expectOne((r) => r.url.includes('/identity/auth/login'));
    req.flush({ title: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance['errorMessage']()).toBeTruthy();
  });
});
