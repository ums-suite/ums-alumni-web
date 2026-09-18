import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { toUmsApiError } from '@ums/shared';
import { Observable, catchError, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

/**
 * ALMW-3: base class for every hand-written `<module>.api.ts` in this app.
 *
 * `@ums/shared`'s generated OpenAPI client (`contracts/ums-core.v1.json`) is a stale one-time
 * snapshot taken back when only Identity/Audit/Organization existed (~41 paths) -- it carries no
 * coverage for Alumni or Finance at all (confirmed directly against the published tarball's own
 * `types/ums-shared.d.ts`: only `IdentityApiService`/`OrganizationApiService`/`AuditApiService`
 * exist). Every Alumni/Finance call in this app is therefore written by hand against the real
 * `ums-core` C# source (`UMS.Modules.Alumni`/`UMS.Modules.Finance`), following the same two-tier
 * pattern `ums-admin-web` already established for this exact situation: a thin per-module
 * `HttpClient`-based service extending this base, targeting `{apiBaseUrl}/api/v1/{path}`
 * directly rather than routing through the generated client at all.
 */
export abstract class AlumniApiBase {
  protected readonly http = inject(HttpClient);
  protected readonly appConfig = inject(APP_CONFIG);

  protected apiUrl(path: string): string {
    const trimmed = path.replace(/^\/+/, '');
    return `${this.appConfig.apiBaseUrl}/api/v1/${trimmed}`;
  }

  protected normalizeErrors<T>(source: Observable<T>): Observable<T> {
    return source.pipe(catchError((error: unknown) => throwError(() => toUmsApiError(error))));
  }
}
