/**
 * Shared shape for anything this app treats as "a profile surfacing somewhere" -- directory
 * results, mentorship cards, success-story bylines, job-applicant contact info (requirement-
 * spec.md §8 invariant #1's own list). Deliberately a minimal structural subset so any DTO with
 * these fields (an `AlumnusDto`, a directory entry, a future mentorship-card projection) can be
 * passed through the same filtering utility without an adapter layer per feature.
 */
export interface VisibilityControlledProfile {
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly currentEmployer: string | null;
  readonly location?: string | null;
  readonly hideCurrentEmployer: boolean;
  readonly hideContactDetails: boolean;
  /** `Private` is this app's real, confirmed field backing the global "hide from directory search" toggle (ALMW-10). */
  readonly profileVisibility: 'Private' | 'Public';
}

/** Who is looking, from the filtering utility's point of view -- never inferred, always passed in explicitly. */
export interface ProfileViewerContext {
  /** The viewer is looking at their own profile -- sees every field unredacted, always. */
  readonly isOwnProfile: boolean;
  /** The viewer holds `alumni.directory.read.private` (or an equivalent admin/moderation grant) -- bypasses redaction, matching the server's own inline bypass check. */
  readonly isPrivileged: boolean;
}

export const DEFAULT_VIEWER_CONTEXT: ProfileViewerContext = {
  isOwnProfile: false,
  isPrivileged: false,
};

export interface VisibleProfileFields {
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly currentEmployer: string | null;
  readonly location: string | null;
}

export interface ConnectChannels {
  readonly email: string | null;
  readonly phone: string | null;
  /** True only when at least one channel above is non-null -- drives whether a "Connect" action is offered at all. */
  readonly hasAnyChannel: boolean;
}
