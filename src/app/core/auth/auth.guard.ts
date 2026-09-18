import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '@ums/shared';
import { AUTH_ROUTES, RETURN_URL_QUERY_PARAM } from './auth-routes.constants';

/** Guards every route under the authenticated CSR shell (ALMW-6). */
export const authGuard: CanActivateFn = (_route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([AUTH_ROUTES.login], {
    queryParams: { [RETURN_URL_QUERY_PARAM]: state.url },
  });
};

export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([AUTH_ROUTES.authenticatedHome]);
};
