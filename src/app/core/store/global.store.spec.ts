import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LOCALE_COOKIE_NAME } from '../i18n/locale-cookie.util';
import { APP_CONFIG } from '../config/app-config';
import { GlobalStore } from './global.store';

describe('GlobalStore', () => {
  let store: InstanceType<typeof GlobalStore>;

  beforeEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl: 'http://localhost:5000' } },
      ],
    });
    store = TestBed.inject(GlobalStore);
  });

  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it('defaults to the English locale', () => {
    expect(store.locale()).toBe('en');
  });

  it('setLocale updates the reactive locale signal', () => {
    store.setLocale('bn');
    expect(store.locale()).toBe('bn');
  });

  it('setThemeMode updates the reactive theme mode signal', () => {
    store.setThemeMode('dark');
    expect(store.themeMode()).toBe('dark');
  });

  it('starts with no alumnus profile loaded and not pending verification', () => {
    expect(store.alumnusProfile()).toBeNull();
    expect(store.alumnusNotLinked()).toBeFalse();
    expect(store.isPendingVerification()).toBeFalse();
  });
});
