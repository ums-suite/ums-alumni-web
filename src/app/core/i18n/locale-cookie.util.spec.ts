import { buildLocaleCookie, LOCALE_COOKIE_NAME, readCookieValue } from './locale-cookie.util';

describe('locale-cookie.util', () => {
  describe('readCookieValue', () => {
    it('returns null for an empty/missing header', () => {
      expect(readCookieValue(null, LOCALE_COOKIE_NAME)).toBeNull();
      expect(readCookieValue(undefined, LOCALE_COOKIE_NAME)).toBeNull();
      expect(readCookieValue('', LOCALE_COOKIE_NAME)).toBeNull();
    });

    it('finds the named cookie among several', () => {
      const header = `foo=bar; ${LOCALE_COOKIE_NAME}=bn; baz=qux`;
      expect(readCookieValue(header, LOCALE_COOKIE_NAME)).toBe('bn');
    });

    it('decodes URI-encoded values', () => {
      const header = `${LOCALE_COOKIE_NAME}=${encodeURIComponent('bn')}`;
      expect(readCookieValue(header, LOCALE_COOKIE_NAME)).toBe('bn');
    });

    it('returns null when the named cookie is absent', () => {
      expect(readCookieValue('foo=bar', LOCALE_COOKIE_NAME)).toBeNull();
    });

    it('ignores malformed segments with no "="', () => {
      const header = `garbage; ${LOCALE_COOKIE_NAME}=en`;
      expect(readCookieValue(header, LOCALE_COOKIE_NAME)).toBe('en');
    });
  });

  describe('buildLocaleCookie', () => {
    it('builds a cookie assignment string with the expected attributes', () => {
      const cookie = buildLocaleCookie('bn');
      expect(cookie).toContain(`${LOCALE_COOKIE_NAME}=bn`);
      expect(cookie).toContain('path=/');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('max-age=');
    });
  });
});
