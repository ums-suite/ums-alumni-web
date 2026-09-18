import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '@ums/shared';
import { AUTH_ROUTES, RETURN_URL_QUERY_PARAM } from './auth-routes.constants';

/** Reacts to a genuine session expiry (refresh token expired/reused/revoked) from anywhere in the app. */
@Injectable({ providedIn: 'root' })
export class SessionExpiryService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  constructor() {
    this.tokenStorage.sessionExpired$.subscribe(() => {
      void this.router.navigate([AUTH_ROUTES.login], {
        queryParams: { [RETURN_URL_QUERY_PARAM]: this.router.url },
      });
    });
  }
}
