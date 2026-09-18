import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOCALE_COOKIE_NAME } from './locale-cookie.util';
import { LocaleService } from './locale.service';

describe('LocaleService', () => {
  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it('defaults to English when no cookie/request is present (browser platform)', () => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('en');
  });

  it('reads an existing document.cookie value on the browser platform', () => {
    document.cookie = `${LOCALE_COOKIE_NAME}=bn; path=/`;
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('bn');
  });

  it('reads locale from the REQUEST Cookie header when present (server render)', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: REQUEST,
          useValue: { headers: new Headers({ cookie: `${LOCALE_COOKIE_NAME}=bn` }) },
        },
      ],
    });
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('bn');
  });

  it('falls back to the default locale on a server render with no REQUEST (prerender) without touching document.cookie', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('en');
  });

  it('setLocale updates the signal, the <html lang> attribute, and the cookie', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const service = TestBed.inject(LocaleService);
    service.setLocale('bn');
    expect(service.locale()).toBe('bn');
    expect(document.documentElement.lang).toBe('bn');
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=bn`);
  });

  it('setLocale on a non-browser platform does not throw and still updates the signal', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(LocaleService);
    expect(() => service.setLocale('bn')).not.toThrow();
    expect(service.locale()).toBe('bn');
  });
});
