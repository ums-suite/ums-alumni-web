import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import {
  authInterceptor,
  correlationIdInterceptor,
  localeInterceptor,
  provideApi,
  UMS_AUTH_CONFIG,
} from '@ums/shared';
import { environment } from '../../../environments/environment';
import { APP_CONFIG, DEFAULT_APP_CONFIG } from '../config/app-config';

/**
 * ALMW-3/ALMW-4: wires this app's HTTP layer -- `@ums/shared`'s shared interceptor chain
 * (correlation id -> locale -> auth, order load-bearing: auth is last since it's the one that
 * clones/retries on 401) plus `provideApi` for the (stale, Identity/Organization/Audit-only)
 * generated client, mirroring `ums-admin-web`'s `provide-core-http.ts` exactly.
 */
export function provideCoreHttp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useValue: { ...DEFAULT_APP_CONFIG, apiBaseUrl: environment.apiBaseUrl },
    },
    provideHttpClient(
      withInterceptors([correlationIdInterceptor, localeInterceptor, authInterceptor]),
    ),
    {
      provide: UMS_AUTH_CONFIG,
      useFactory: () => ({ baseUrl: inject(APP_CONFIG).apiBaseUrl }),
    },
    provideApi({ basePath: environment.apiBaseUrl }),
  ]);
}
