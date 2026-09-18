import { TestBed } from '@angular/core/testing';
import { NotificationPreferencesStore } from './notification-preferences.store';
import { DEFAULT_DIGEST_PREFERENCES } from '../notifications.types';

describe('NotificationPreferencesStore', () => {
  beforeEach(() => {
    localStorage.removeItem('alw.notifications.digestPreferences');
    TestBed.configureTestingModule({});
  });

  it('starts with all categories opted in by default', () => {
    const store = TestBed.inject(NotificationPreferencesStore);
    expect(store.preferences()).toEqual(DEFAULT_DIGEST_PREFERENCES);
  });

  it('toggles one category without affecting the others', () => {
    const store = TestBed.inject(NotificationPreferencesStore);
    store.toggle('eventReminders');
    expect(store.preferences()).toEqual({ ...DEFAULT_DIGEST_PREFERENCES, eventReminders: false });
  });

  it('persists across a fresh store instance via localStorage', () => {
    const first = TestBed.inject(NotificationPreferencesStore);
    first.toggle('campaignUpdates');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const second = TestBed.inject(NotificationPreferencesStore);
    expect(second.preferences().campaignUpdates).toBe(false);
  });

  afterEach(() => localStorage.removeItem('alw.notifications.digestPreferences'));
});
