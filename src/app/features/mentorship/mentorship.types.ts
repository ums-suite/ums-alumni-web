/**
 * Hand-typed against the real `ums-core` source (`UMS.Modules.Alumni.Api.Endpoints.
 * MentorshipEndpoints`, `Application.Mentorship.MentorshipOptInDto`/`MentorshipMatchDto`,
 * `Domain.Mentorship.MentorshipMatchStatus`/`MentorshipRole`) -- confirmed directly, not guessed.
 *
 * FLAGGED GAP #1 (ALMW-17, "browsing and search by industry/program overlap"): there is no
 * list/browse endpoint for mentor or mentee opt-ins anywhere in the module
 * (`IMentorshipOptInRepository` confirmed source-level: only a single-person `GetAsync(personId,
 * role)` lookup exists, no `ListActive`/`Search` method). A prospective mentee cannot browse
 * mentors, and this app (Alumnus-only per `requirement-spec.md` §1 -- Students use
 * `ums-student-web`, not this one) never plays the mentee side anyway. "Browsing" here is
 * therefore scoped to the one real, honest thing an Alumnus can browse: their OWN mentor opt-in
 * profile plus their own list of proposed/active/past `MentorshipMatch` rows
 * (`GET /mentorship/matches`, which -- because every caller of this app resolves as an Alumnus,
 * never a Student -- always returns the mentor-side list).
 *
 * FLAGGED GAP #2 (ALMW-18, "request/accept flow"): `POST /mentorship/matches` (the only way a
 * `MentorshipMatch` is created) is coordinator/Admin-permission-gated
 * (`AlumniPermissions.MentorshipCoordinate`), never self-service. An Alumnus cannot request a
 * specific mentee here -- matching is proposed by a coordinator, and this app's real, buildable
 * action is limited to the mentor's own two-sided ACCEPT (`POST .../accept`, resolved server-side
 * by comparing the caller's Alumnus id to `MentorAlumnusId`) and ending an Active match
 * (`POST .../end`, either party). "This mentor is at capacity" is nonetheless a REAL, live
 * mechanism -- `MentorshipOptIn.CapacityLimit`/`ActiveCount` is enforced with an atomic
 * conditional write at match-propose time -- surfaced here as the rejection a coordinator's
 * proposal would hit, not as a client-facing action this app itself performs.
 *
 * FLAGGED GAP #3 (auto-expire/notify on an unanswered request): no such mechanism exists
 * server-side -- a `Proposed` match sits indefinitely until a coordinator rejects it or both
 * sides accept. This app never fabricates a client-side expiry timer implying server enforcement
 * that isn't there; a `Proposed` card instead shows a plain, honest "pending since {date}"
 * duration, computed client-side for display only.
 *
 * FLAGGED GAP #4 (contact-detail exchange after mutual acceptance): `MentorshipMatchDto` carries
 * no contact fields at all, and this app never consumes the Student module (`requirement-spec.md`
 * §6) -- there is no way to resolve or display the mentee's contact details from here. What IS
 * real and buildable: once a match is `Active`, this app shows the mentor their OWN
 * per-field-visibility-filtered contact channels (via `core/visibility`'s `applyFieldVisibility`,
 * viewed as a non-owner would see them) -- i.e. "this is what your mentee can now see," which is
 * the mentor-side half of Domain Invariant #6 this app can actually implement honestly. No
 * preview is shown for a still-`Proposed` match, since mutual acceptance hasn't happened yet.
 */
export type MentorshipRole = 'Mentor' | 'Mentee';

export type MentorshipMatchStatus = 'Proposed' | 'Active' | 'Completed' | 'Ended';

export interface MentorshipOptInDto {
  readonly id: string;
  readonly personId: string;
  readonly role: MentorshipRole;
  readonly expertiseAreas: string;
  readonly capacityLimit: number;
  readonly activeCount: number;
  readonly availability: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface OptInRequest {
  readonly role: MentorshipRole;
  readonly expertiseAreas: string;
  readonly capacityLimit: number;
  readonly availability: string | null;
}

export interface MentorshipMatchDto {
  readonly id: string;
  readonly mentorAlumnusId: string;
  readonly menteeStudentId: string;
  readonly status: MentorshipMatchStatus;
  readonly proposedAt: string;
  readonly mentorAcceptedAt: string | null;
  readonly menteeAcceptedAt: string | null;
  readonly activatedAt: string | null;
  readonly endedAt: string | null;
  readonly endedReason: string | null;
}

export interface EndMatchRequest {
  readonly reason: string;
}
