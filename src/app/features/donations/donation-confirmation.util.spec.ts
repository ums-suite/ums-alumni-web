import {
  generateIdempotencyKey,
  isConfirmedDonationStatus,
  isFailedDonationStatus,
  isTerminalDonationStatus,
} from './donation-confirmation.util';
import type { DonationStatus } from './donations.types';

describe('donation-confirmation.util', () => {
  describe('isTerminalDonationStatus', () => {
    it('is true for Confirmed', () => {
      expect(isTerminalDonationStatus('Confirmed')).toBeTrue();
    });
    it('is true for Failed', () => {
      expect(isTerminalDonationStatus('Failed')).toBeTrue();
    });
    it('is false for Pending', () => {
      expect(isTerminalDonationStatus('Pending')).toBeFalse();
    });
  });

  describe('isConfirmedDonationStatus -- Domain Invariant #2', () => {
    it('is true ONLY for Confirmed', () => {
      const statuses: DonationStatus[] = ['Pending', 'Confirmed', 'Failed'];
      const confirmed = statuses.filter(isConfirmedDonationStatus);
      expect(confirmed).toEqual(['Confirmed']);
    });

    it('is false for Failed -- a terminal-but-unsuccessful outcome is never treated as confirmed', () => {
      expect(isConfirmedDonationStatus('Failed')).toBeFalse();
    });

    it('is false for Pending', () => {
      expect(isConfirmedDonationStatus('Pending')).toBeFalse();
    });
  });

  describe('isFailedDonationStatus', () => {
    it('is true only for Failed', () => {
      expect(isFailedDonationStatus('Failed')).toBeTrue();
      expect(isFailedDonationStatus('Confirmed')).toBeFalse();
      expect(isFailedDonationStatus('Pending')).toBeFalse();
    });
  });

  describe('generateIdempotencyKey', () => {
    it('uses crypto.randomUUID when available', () => {
      spyOn(crypto, 'randomUUID').and.returnValue('11111111-1111-1111-1111-111111111111');
      expect(generateIdempotencyKey()).toBe('11111111-1111-1111-1111-111111111111');
    });

    it('produces a different key on each call', () => {
      const a = generateIdempotencyKey();
      const b = generateIdempotencyKey();
      expect(a).not.toBe(b);
    });

    it('falls back to a timestamp+random key when crypto.randomUUID is unavailable', () => {
      const original = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
      // A plain `delete crypto.randomUUID` silently no-ops (the property isn't configurable via
      // delete on some engines) -- Object.defineProperty is the reliable way to override a real
      // browser API for one test, mirroring the platform's own established `navigator.
      // serviceWorker` override pattern for the same class of problem.
      Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
      try {
        const key = generateIdempotencyKey();
        expect(key.startsWith('idempotency-')).toBeTrue();
      } finally {
        if (original) {
          Object.defineProperty(crypto, 'randomUUID', original);
        }
      }
    });
  });
});
