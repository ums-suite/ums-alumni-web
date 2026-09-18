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
      // `crypto.randomUUID` is inherited from `Crypto.prototype`, not an own property of the
      // `crypto` instance -- `Object.getOwnPropertyDescriptor(crypto, 'randomUUID')` returns
      // `undefined`, so there is no "original own descriptor" to restore. Overriding it with
      // `Object.defineProperty` (a plain `delete` silently no-ops on some engines for this exact
      // reason) shadows the prototype method with an own property for this test only; `delete`ing
      // that own property afterward naturally re-exposes the real prototype method again. This
      // was a real bug caught by this exact test suite: an earlier draft tried to restore a
      // (non-existent) own descriptor instead of deleting the shadowing override, which
      // permanently broke `crypto.randomUUID` for every test running after this one.
      Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
      try {
        const key = generateIdempotencyKey();
        expect(key.startsWith('idempotency-')).toBeTrue();
      } finally {
        delete (crypto as { randomUUID?: unknown }).randomUUID;
      }
    });
  });
});
