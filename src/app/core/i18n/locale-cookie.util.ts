export const LOCALE_COOKIE_NAME = 'almw_locale';

/** One year, matching the "language state consistent across a single visit" invariant with headroom. */
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Parses a `Cookie:` request header (server) or `document.cookie` (client) -- both share the exact
 * same `k=v; k2=v2` wire format, so one parser serves both call sites (ALMW-5).
 */
export function readCookieValue(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = part.slice(0, separatorIndex).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }

  return null;
}

/**
 * Builds a `document.cookie`-assignable string. `SameSite=Lax` + no `Secure` flag hardcoded here
 * (left to the hosting layer's own HTTPS termination) keeps this usable in local HTTP dev.
 */
export function buildLocaleCookie(value: string): string {
  return `${LOCALE_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
