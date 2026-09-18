import { Injectable, inject } from '@angular/core';
import { IdentityApiService, TokenStorageService, type UmsTokenPair } from '@ums/shared';
import { Observable, tap } from 'rxjs';

/**
 * ALMW-4: thin app-specific facade over `@ums/shared`'s shared token/session primitive
 * (`TokenStorageService`, `authInterceptor`, the single-flight refresh coordinator) -- the same
 * primitive every other ums-*-web app consumes (ADR-0005 "one login, shared SSO"). This app adds
 * no domain-specific permission layer on top the way `ums-admin-web` does: Alumni-facing actions
 * here are gated by ownership (does this session resolve to an Alumnus record at all -- see
 * `AlumnusContextService`) rather than an RBAC permission catalog, matching how `ums-core`'s own
 * Alumni module endpoints are secured (`.RequireLiveSession()` + inline ownership checks, not
 * `.RequirePermission()`, for every self-service action).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly identityApi = inject(IdentityApiService);
  private readonly tokenStorage = inject(TokenStorageService);

  login(identifier: string, password: string): Observable<UmsTokenPair> {
    return (
      this.identityApi.apiV1IdentityAuthLoginPost({
        identifier,
        password,
      }) as Observable<UmsTokenPair>
    ).pipe(tap((pair) => this.tokenStorage.setTokens(pair)));
  }

  logout(): Observable<unknown> {
    return this.identityApi
      .apiV1IdentityAuthLogoutPost()
      .pipe(tap({ next: () => this.tokenStorage.clear(), error: () => this.tokenStorage.clear() }));
  }
}
