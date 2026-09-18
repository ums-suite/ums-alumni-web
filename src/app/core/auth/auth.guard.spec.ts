import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TokenStorageService } from '@ums/shared';
import { authGuard, guestGuard } from './auth.guard';

describe('auth.guard', () => {
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  let router: Router;

  beforeEach(() => {
    tokenStorage = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
      'getAccessToken',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: TokenStorageService, useValue: tokenStorage }],
    });
    router = TestBed.inject(Router);
  });

  function setAuthenticated(value: boolean): void {
    (tokenStorage as unknown as { isAuthenticated: () => boolean }).isAuthenticated = () => value;
  }

  describe('authGuard', () => {
    it('allows activation when authenticated', () => {
      setAuthenticated(true);
      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/app/directory' } as never),
      );
      expect(result).toBeTrue();
    });

    it('redirects to login with a returnUrl when not authenticated', () => {
      setAuthenticated(false);
      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/app/directory' } as never),
      );
      expect(result).toEqual(
        router.createUrlTree(['/login'], { queryParams: { returnUrl: '/app/directory' } }),
      );
    });
  });

  describe('guestGuard', () => {
    it('allows activation when not authenticated', () => {
      setAuthenticated(false);
      const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
      expect(result).toBeTrue();
    });

    it('redirects to the authenticated home when already authenticated', () => {
      setAuthenticated(true);
      const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
      expect(result).toEqual(router.createUrlTree(['/app/directory']));
    });
  });
});
