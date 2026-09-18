/** Mirrors `@ums/shared`'s own `UmsLocale` union so this app's dictionaries stay in lockstep. */
export type AlmwLocale = 'en' | 'bn';

export const ALMW_DEFAULT_LOCALE: AlmwLocale = 'en';
export const ALMW_SUPPORTED_LOCALES: readonly AlmwLocale[] = ['en', 'bn'];

export function isAlmwLocale(value: string | null | undefined): value is AlmwLocale {
  return value === 'en' || value === 'bn';
}
