/**
 * Hand-typed against the real `ums-core` source (`UMS.Modules.Alumni.Api.Endpoints.
 * JobEndpoints`, `Application.Jobs.JobPostingDto`/`JobApplicationDto`) -- confirmed directly.
 *
 * FLAGGED GAP #1 (ALMW-11, Employer verification): there is no `Employer` entity, registration
 * endpoint, or verification workflow anywhere in the Alumni module. Moderation instead keys off
 * the poster's own `PosterIsAlumnus` flag: an alumnus-posted job auto-publishes; any other
 * poster's job goes to `PendingModeration` pending Admin approval (`POST /jobs/{id}/moderate`,
 * out of this app's scope per `tickets.md`'s own flagged gap on moderation ownership). This app
 * therefore has no "register as an employer" screen to build -- an Employer poster already
 * authenticates as a normal Identity User (per requirement-spec.md §10 resolved decision #6) and
 * simply posts a job; the "is this employer verified" signal this app CAN show is `Status ===
 * 'Published'` for a non-alumnus poster, since reaching that status required passing moderation.
 *
 * FLAGGED GAP #2 (ALMW-13, application status tracking): `JobApplication` has no status field at
 * all (only Id/JobPostingId/ApplicantUserId/ApplicantIsAlumnus/Note/ResumeArtifactId/SubmittedAt)
 * -- no `Viewed`/`Reviewed` state exists server-side, and there is no endpoint for an applicant to
 * list their OWN submitted applications (`GET /jobs/{id}/applications` is moderator-only). This
 * app's interim treatment: remember the `JobApplicationDto` returned by a successful `POST
 * .../apply` locally (matching `ums-admission-web`'s own established localStorage pattern for an
 * analogous gap), and re-fetch the associated posting's live status to at least honor the
 * "posting expires mid-review, application stays visible with posting marked closed" edge case
 * using REAL data -- never a fabricated viewed/not-viewed flag.
 */
export type JobPostingStatus = 'Draft' | 'PendingModeration' | 'Published' | 'Expired' | 'Removed';

export interface JobPostingDto {
  readonly id: string;
  readonly posterUserId: string;
  readonly posterIsAlumnus: boolean;
  readonly posterAlumnusId: string | null;
  readonly title: string;
  readonly company: string;
  readonly description: string;
  readonly location: string;
  readonly contactMethod: string;
  readonly expiresAt: string;
  readonly status: JobPostingStatus;
  readonly moderationReason: string | null;
  readonly createdAt: string;
  readonly publishedAt: string | null;
  readonly version: number;
}

export interface PostJobRequest {
  readonly title: string;
  readonly company: string;
  readonly description: string;
  readonly location: string;
  readonly contactMethod: string;
  readonly expiresAt: string;
}

export interface EditJobPostingRequest extends PostJobRequest {
  readonly version: number;
}

export interface RemoveJobPostingRequest {
  readonly reason: string;
  readonly version: number;
}

export interface JobApplicationDto {
  readonly id: string;
  readonly jobPostingId: string;
  readonly applicantUserId: string;
  readonly applicantIsAlumnus: boolean;
  readonly note: string | null;
  readonly resumeArtifactId: string | null;
  readonly submittedAt: string;
}

export interface ApplyToJobRequest {
  readonly note: string | null;
  readonly resumeArtifactId: string | null;
}

export interface JobListFilterParams {
  readonly status?: JobPostingStatus;
  readonly posterUserId?: string;
  readonly skip?: number;
  readonly take?: number;
}
