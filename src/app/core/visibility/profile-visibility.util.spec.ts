import {
  applyFieldVisibility,
  isEligibleForDirectorySearch,
  resolveConnectChannels,
  toDirectoryVisibleEntry,
} from './profile-visibility.util';
import type { VisibilityControlledProfile } from './profile-visibility.types';

function makeProfile(
  overrides: Partial<VisibilityControlledProfile> = {},
): VisibilityControlledProfile {
  return {
    contactEmail: 'alum@example.edu',
    contactPhone: '+880123456789',
    currentEmployer: 'Acme Corp',
    location: 'Dhaka',
    hideCurrentEmployer: false,
    hideContactDetails: false,
    profileVisibility: 'Public',
    ...overrides,
  };
}

describe('profile-visibility.util', () => {
  describe('isEligibleForDirectorySearch', () => {
    it('is eligible when Public and viewer is an anonymous stranger', () => {
      expect(isEligibleForDirectorySearch(makeProfile({ profileVisibility: 'Public' }))).toBeTrue();
    });

    it('is NOT eligible when Private and viewer is a stranger', () => {
      expect(
        isEligibleForDirectorySearch(makeProfile({ profileVisibility: 'Private' })),
      ).toBeFalse();
    });

    it('is always eligible for the profile owner, even when Private', () => {
      expect(
        isEligibleForDirectorySearch(makeProfile({ profileVisibility: 'Private' }), {
          isOwnProfile: true,
          isPrivileged: false,
        }),
      ).toBeTrue();
    });

    it('is always eligible for a privileged viewer, even when Private', () => {
      expect(
        isEligibleForDirectorySearch(makeProfile({ profileVisibility: 'Private' }), {
          isOwnProfile: false,
          isPrivileged: true,
        }),
      ).toBeTrue();
    });

    it('defaults the viewer context to an anonymous stranger when omitted', () => {
      expect(
        isEligibleForDirectorySearch(makeProfile({ profileVisibility: 'Private' })),
      ).toBeFalse();
    });
  });

  describe('applyFieldVisibility', () => {
    it('shows every field to a stranger when nothing is hidden', () => {
      const result = applyFieldVisibility(makeProfile());
      expect(result).toEqual({
        contactEmail: 'alum@example.edu',
        contactPhone: '+880123456789',
        currentEmployer: 'Acme Corp',
        location: 'Dhaka',
      });
    });

    it('redacts both email and phone for a stranger when hideContactDetails is set', () => {
      const result = applyFieldVisibility(makeProfile({ hideContactDetails: true }));
      expect(result.contactEmail).toBeNull();
      expect(result.contactPhone).toBeNull();
    });

    it('redacts current employer for a stranger when hideCurrentEmployer is set', () => {
      const result = applyFieldVisibility(makeProfile({ hideCurrentEmployer: true }));
      expect(result.currentEmployer).toBeNull();
    });

    it('never redacts location (no server-side field exists to hide it)', () => {
      const result = applyFieldVisibility(
        makeProfile({ hideContactDetails: true, hideCurrentEmployer: true }),
      );
      expect(result.location).toBe('Dhaka');
    });

    it('shows everything to the profile owner regardless of hide flags', () => {
      const result = applyFieldVisibility(
        makeProfile({ hideContactDetails: true, hideCurrentEmployer: true }),
        { isOwnProfile: true, isPrivileged: false },
      );
      expect(result).toEqual({
        contactEmail: 'alum@example.edu',
        contactPhone: '+880123456789',
        currentEmployer: 'Acme Corp',
        location: 'Dhaka',
      });
    });

    it('shows everything to a privileged viewer regardless of hide flags', () => {
      const result = applyFieldVisibility(
        makeProfile({ hideContactDetails: true, hideCurrentEmployer: true }),
        { isOwnProfile: false, isPrivileged: true },
      );
      expect(result.contactEmail).toBe('alum@example.edu');
      expect(result.currentEmployer).toBe('Acme Corp');
    });

    it('handles a null location gracefully', () => {
      const result = applyFieldVisibility(makeProfile({ location: null }));
      expect(result.location).toBeNull();
    });
  });

  describe('resolveConnectChannels', () => {
    it('exposes both channels when nothing is hidden', () => {
      const channels = resolveConnectChannels(makeProfile());
      expect(channels).toEqual({
        email: 'alum@example.edu',
        phone: '+880123456789',
        hasAnyChannel: true,
      });
    });

    it('hides all channels and reports hasAnyChannel=false when contact details are hidden', () => {
      const channels = resolveConnectChannels(makeProfile({ hideContactDetails: true }));
      expect(channels.email).toBeNull();
      expect(channels.phone).toBeNull();
      expect(channels.hasAnyChannel).toBeFalse();
    });

    it('reports hasAnyChannel=true even if the underlying data only ever had one channel populated', () => {
      const channels = resolveConnectChannels(makeProfile({ contactPhone: null }));
      expect(channels.hasAnyChannel).toBeTrue();
      expect(channels.email).toBe('alum@example.edu');
      expect(channels.phone).toBeNull();
    });

    it('never routes through a hidden channel even for a connect action from a stranger', () => {
      const channels = resolveConnectChannels(
        makeProfile({ hideContactDetails: true, contactEmail: 'secret@example.edu' }),
      );
      expect(channels.email).toBeNull();
      expect(channels.hasAnyChannel).toBeFalse();
    });

    it('respects owner/privileged bypass, matching applyFieldVisibility', () => {
      const channels = resolveConnectChannels(makeProfile({ hideContactDetails: true }), {
        isOwnProfile: true,
        isPrivileged: false,
      });
      expect(channels.hasAnyChannel).toBeTrue();
    });
  });

  describe('toDirectoryVisibleEntry', () => {
    it('returns null (excluded) for a Private profile viewed by a stranger', () => {
      const entry = toDirectoryVisibleEntry({
        ...makeProfile({ profileVisibility: 'Private' }),
        id: 'a1',
      });
      expect(entry).toBeNull();
    });

    it('returns a redacted entry for a Public profile with hidden fields', () => {
      const entry = toDirectoryVisibleEntry({
        ...makeProfile({ hideContactDetails: true }),
        id: 'a1',
      });
      expect(entry).not.toBeNull();
      expect(entry?.id).toBe('a1');
      expect(entry?.contactEmail).toBeNull();
      expect(entry?.currentEmployer).toBe('Acme Corp');
    });

    it('includes a Private profile for its own owner, unredacted', () => {
      const entry = toDirectoryVisibleEntry(
        { ...makeProfile({ profileVisibility: 'Private', hideContactDetails: true }), id: 'a1' },
        { isOwnProfile: true, isPrivileged: false },
      );
      expect(entry).not.toBeNull();
      expect(entry?.contactEmail).toBe('alum@example.edu');
    });

    it('includes a Private profile for a privileged (e.g. admin/moderator) viewer', () => {
      const entry = toDirectoryVisibleEntry(
        { ...makeProfile({ profileVisibility: 'Private' }), id: 'a1' },
        { isOwnProfile: false, isPrivileged: true },
      );
      expect(entry).not.toBeNull();
    });
  });
});
