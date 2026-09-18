import {
  DEFAULT_VIEWER_CONTEXT,
  type ConnectChannels,
  type ProfileViewerContext,
  type VisibilityControlledProfile,
  type VisibleProfileFields,
} from './profile-visibility.types';

/**
 * ALMW-10 / requirement-spec.md §8 Domain Invariant #1: "Per-field visibility is honored
 * everywhere a profile surfaces -- directory search results, mentorship cards, success-story
 * bylines, job-applicant contact info -- never just on the main profile page."
 *
 * This is the ONE reusable filtering utility every current and future surface that renders an
 * Alumnus's contact-shaped fields is required to route through -- built once here (not as a
 * directory-specific one-off) specifically so ALMW-17/18 (mentorship cards) and ALMW-22
 * (success-story bylines) can reuse it identically rather than re-implementing the same
 * redaction rules with a subtly different bug each time.
 *
 * Two independent concerns, deliberately not collapsed into one function:
 *  - {@link isEligibleForDirectorySearch}: the GLOBAL, all-or-nothing "hide my profile from
 *    directory search" toggle (`ProfileVisibility.Private`, requirement-spec.md §9's directory-
 *    opt-out edge case) -- governs LISTING eligibility, and only for directory-search-shaped
 *    surfaces specifically (a Private profile can still appear on a mentorship card the alumnus
 *    themself opted into, or a success-story byline Content staff chose to publish -- those are
 *    different consent surfaces than "search for me in the directory").
 *  - {@link applyFieldVisibility} / {@link resolveConnectChannels}: the PER-FIELD controls
 *    (email, phone, employer, location) -- these apply unconditionally, everywhere, regardless of
 *    which surface is rendering the profile. This is the part §8 invariant #1 is actually most
 *    worried about, since it's the one a future feature is most likely to forget to re-apply.
 *
 * IMPORTANT: this is a client-side convenience/defense-in-depth layer, not the actual security
 * boundary -- requirement-spec.md §5 is explicit that per-field visibility "is enforced
 * server-side on every response that could include a profile ... the UI reflects the setting, it
 * does not itself act as the only guard against a field leaking through." The real Alumni
 * directory endpoint already nulls `currentEmployer`/`contactEmail`/`contactPhone` server-side
 * for a non-privileged, non-owner caller (confirmed in `AlumnusRepository`/`AlumnusService`
 * source) -- this utility exists for surfaces that receive a less-redacted DTO (e.g. a caller's
 * own profile echoed back, or a future surface with no server-side redaction yet) and must not
 * accidentally render a hidden field just because the server happened to include it.
 */
export function isEligibleForDirectorySearch(
  profile: Pick<VisibilityControlledProfile, 'profileVisibility'>,
  viewer: ProfileViewerContext = DEFAULT_VIEWER_CONTEXT,
): boolean {
  if (viewer.isOwnProfile || viewer.isPrivileged) {
    return true;
  }
  return profile.profileVisibility === 'Public';
}

export function applyFieldVisibility(
  profile: VisibilityControlledProfile,
  viewer: ProfileViewerContext = DEFAULT_VIEWER_CONTEXT,
): VisibleProfileFields {
  const showAll = viewer.isOwnProfile || viewer.isPrivileged;

  return {
    // FLAGGED GAP: requirement-spec.md §3.2 asks for independent email/phone toggles, but the
    // real `Alumnus` entity (confirmed against ums-core source) exposes only ONE combined
    // `hideContactDetails` flag covering both -- there is no server-side field to hide email
    // without also hiding phone or vice versa. Until a backend split lands, both are gated by
    // the same flag; this is documented here rather than fabricated as two independent toggles
    // the API would silently ignore.
    contactEmail: showAll || !profile.hideContactDetails ? profile.contactEmail : null,
    contactPhone: showAll || !profile.hideContactDetails ? profile.contactPhone : null,
    currentEmployer: showAll || !profile.hideCurrentEmployer ? profile.currentEmployer : null,
    // FLAGGED GAP: `Alumnus` has no `hideLocation` field at all (confirmed against source) -- the
    // real API always returns `location` to any live session. Location is therefore always
    // passed through unredacted here; a real per-field location toggle needs a backend addition
    // before this utility can honor one.
    location: profile.location ?? null,
  };
}

/**
 * ALMW-10: "a 'connect' action routes through visible contact channels only" -- built directly on
 * {@link applyFieldVisibility} so a connect affordance can never surface a channel the alumnus has
 * hidden, and so a card with zero visible channels can suppress the action entirely rather than
 * showing a "Connect" button that leads nowhere.
 */
export function resolveConnectChannels(
  profile: VisibilityControlledProfile,
  viewer: ProfileViewerContext = DEFAULT_VIEWER_CONTEXT,
): ConnectChannels {
  const fields = applyFieldVisibility(profile, viewer);
  return {
    email: fields.contactEmail,
    phone: fields.contactPhone,
    hasAnyChannel: fields.contactEmail !== null || fields.contactPhone !== null,
  };
}

/**
 * Convenience one-shot combining both checks, for a directory-style listing that needs to decide,
 * per entry, both "should this even be in the results" and "which fields may I render."  Returns
 * `null` when the entry should be excluded entirely (mirrors what a fully-correct server-side
 * directory query would already do) so a caller can `.filter(Boolean)` a list in one pass.
 */
export function toDirectoryVisibleEntry<T extends VisibilityControlledProfile>(
  profile: T,
  viewer: ProfileViewerContext = DEFAULT_VIEWER_CONTEXT,
): (Omit<T, keyof VisibleProfileFields> & VisibleProfileFields) | null {
  if (!isEligibleForDirectorySearch(profile, viewer)) {
    return null;
  }
  return { ...profile, ...applyFieldVisibility(profile, viewer) };
}
