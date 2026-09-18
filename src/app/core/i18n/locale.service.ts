import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, inject, signal } from '@angular/core';
import { buildLocaleCookie, LOCALE_COOKIE_NAME, readCookieValue } from './locale-cookie.util';
import { ALMW_DEFAULT_LOCALE, AlmwLocale, isAlmwLocale } from './locale.types';

/**
 * ALMW-5: this app's own locale mechanism -- deliberately NOT `@ums/shared`'s `LocaleService`.
 *
 * `@ums/shared`'s `LocaleService` persists to `localStorage`, which is unreadable during SSR --
 * every server-rendered response would silently default to English regardless of a returning
 * visitor's actual choice, then flip to their real language only once the client bundle hydrates
 * and reads `localStorage`. That's exactly the "client-only language flash before hydration"
 * this app's own hybrid SSR/CSR split (ALMW-1, ALMW-6) can't tolerate on its public SSR routes
 * (success stories, campaign/chapter landing pages) -- mirroring `ums-public-web`'s own resolved
 * gotcha for the identical reason.
 *
 * Resolution order for the initial value:
 * 1. Server render (`REQUEST` present, `RenderMode.Server` only): parse the incoming `Cookie`
 *    header -- this is what makes the *first* server-rendered byte already correct for a
 *    returning visitor, deep-linked or not.
 * 2. Client (`REQUEST` absent, running in the browser): read `document.cookie` directly, so a
 *    page reload / non-SSR navigation still resolves correctly before this service's own signal
 *    is ever touched.
 * 3. Neither (first-ever visit, OR a `RenderMode.Prerender` route where there is no real
 *    visitor/request at all): {@link ALMW_DEFAULT_LOCALE}, per ADR-0011. `document.cookie` is
 *    deliberately never read outside the browser: `@angular/ssr` only provides `REQUEST` under
 *    `RenderMode.Server`, and a bare Prerender build's server-side DOM shim throws on a bare
 *    `document.cookie` read rather than returning an empty string -- this MUST be gated by
 *    `isPlatformBrowser`, not merely "`REQUEST` is falsy" (confirmed gotcha from `ums-public-web`
 *    PWEB-21).
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });

  readonly locale = signal<AlmwLocale>(this.readInitialLocale());

  constructor() {
    this.document.documentElement.lang = this.locale();
  }

  setLocale(locale: AlmwLocale): void {
    this.locale.set(locale);
    this.document.documentElement.lang = locale;
    this.writeClientCookie(locale);
  }

  private readInitialLocale(): AlmwLocale {
    if (this.request) {
      const stored = readCookieValue(this.request.headers.get('cookie'), LOCALE_COOKIE_NAME);
      return isAlmwLocale(stored) ? stored : ALMW_DEFAULT_LOCALE;
    }

    if (!isPlatformBrowser(this.platformId)) {
      // A RenderMode.Prerender route: no REQUEST, no real visitor, and no real document.cookie
      // to read -- the default is correct here, not a fallback of last resort.
      return ALMW_DEFAULT_LOCALE;
    }

    const stored = readCookieValue(this.document.cookie, LOCALE_COOKIE_NAME);
    return isAlmwLocale(stored) ? stored : ALMW_DEFAULT_LOCALE;
  }

  private writeClientCookie(locale: AlmwLocale): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      this.document.cookie = buildLocaleCookie(locale);
    } catch {
      // Cookie writes can throw under storage-restricted browser settings -- best-effort only.
    }
  }
}
