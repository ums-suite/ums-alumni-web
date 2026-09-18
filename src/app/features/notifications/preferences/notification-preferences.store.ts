import { Injectable, signal } from '@angular/core';
import type { DigestCategory, DigestPreferences } from '../notifications.types';
import { DEFAULT_DIGEST_PREFERENCES } from '../notifications.types';

const STORAGE_KEY = 'alw.notifications.digestPreferences';

/**
 * ALMW-23: UI-only email-digest preference toggles -- see `notifications.types.ts`'s flagged
 * gap: there is no real backend endpoint for this at all. Persists to this browser's own
 * `localStorage` only (never synced across devices, never actually consulted by the
 * `Notifications` module's real delivery pipeline) -- an honest, clearly-labeled placeholder for
 * this sprint, not a fabricated backend contract.
 */
@Injectable({ providedIn: 'root' })
export class NotificationPreferencesStore {
  private readonly state = signal<DigestPreferences>(this.readFromStorage());

  readonly preferences = this.state.asReadonly();

  toggle(category: DigestCategory): void {
    const next = { ...this.state(), [category]: !this.state()[category] };
    this.state.set(next);
    this.writeToStorage(next);
  }

  private readFromStorage(): DigestPreferences {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw
        ? { ...DEFAULT_DIGEST_PREFERENCES, ...(JSON.parse(raw) as DigestPreferences) }
        : DEFAULT_DIGEST_PREFERENCES;
    } catch {
      return DEFAULT_DIGEST_PREFERENCES;
    }
  }

  private writeToStorage(preferences: DigestPreferences): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      }
    } catch {
      // Best-effort only -- a private-browsing/storage-blocked context simply doesn't persist across reloads.
    }
  }
}
