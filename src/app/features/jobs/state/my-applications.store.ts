import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { tap } from 'rxjs';
import { JobsApi } from '../jobs.api';
import type { ApplyToJobRequest, JobApplicationDto, JobPostingDto } from '../jobs.types';

const STORAGE_KEY = 'ums-alumni-web:job-applications';

interface TrackedApplication {
  readonly application: JobApplicationDto;
  /** Refreshed from the real posting on each `refreshPostingStatuses()` call. */
  readonly posting: JobPostingDto | null;
}

interface MyApplicationsState {
  readonly byJobId: Readonly<Record<string, TrackedApplication>>;
  readonly submitting: boolean;
  readonly error: string | null;
}

function readStored(): Record<string, JobApplicationDto> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, JobApplicationDto>) : {};
  } catch {
    return {};
  }
}

function writeStored(applications: Record<string, JobApplicationDto>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    // Best-effort only, matching the platform's established localStorage-fallback posture.
  }
}

function initialStateFromStorage(): MyApplicationsState {
  const stored = readStored();
  const byJobId: Record<string, TrackedApplication> = {};
  for (const [jobId, application] of Object.entries(stored)) {
    byJobId[jobId] = { application, posting: null };
  }
  return { byJobId, submitting: false, error: null };
}

/**
 * ALMW-13: "in-app application submission with status tracking ... an applicant sees whether
 * their application was viewed, not just a silent void."
 *
 * FLAGGED GAP, confirmed against `ums-core` source: `JobApplication` has no viewed/reviewed
 * status field at all, and there is no endpoint for an applicant to list their own submitted
 * applications (`GET /jobs/{id}/applications` requires `alumni.job.moderate`, not ownership).
 * This store's honest interim treatment: remember each successful application locally (this
 * browser only, mirroring `ums-admission-web`'s own established localStorage pattern for an
 * analogous payment-tracking gap), and refresh the associated JobPosting's real, current status
 * on demand -- so the "posting expires mid-review" edge case is handled with REAL data (the
 * posting really did move to `Expired`), while a "viewed by employer" flag is never fabricated.
 */
export const MyApplicationsStore = signalStore(
  { providedIn: 'root' },
  // A FACTORY (not a plain value) -- `withState` evaluates a plain-object argument exactly ONCE,
  // at module-evaluation time, which would permanently bake in whatever localStorage happened to
  // contain the first time this module was ever imported (e.g. by an earlier test in the same
  // Karma run) for every subsequent store instance. Caught for real by this store's own test
  // suite: a later test's `localStorage.setItem` was invisible to a freshly-injected store until
  // this was switched to the factory overload, which @ngrx/signals calls fresh per instantiation.
  withState<MyApplicationsState>(() => initialStateFromStorage()),
  withMethods((store, api = inject(JobsApi)) => ({
    apply(jobId: string, request: ApplyToJobRequest) {
      patchState(store, { submitting: true, error: null });
      return api.apply(jobId, request).pipe(
        tap({
          next: (application: JobApplicationDto) => {
            const byJobId = { ...store.byJobId(), [jobId]: { application, posting: null } };
            patchState(store, { byJobId, submitting: false });
            writeStored(
              Object.fromEntries(
                Object.entries(byJobId).map(([id, tracked]) => [id, tracked.application]),
              ),
            );
          },
          error: () => patchState(store, { submitting: false }),
        }),
      );
    },

    hasApplied(jobId: string): boolean {
      return jobId in store.byJobId();
    },

    /** Re-fetches the live posting status for every tracked application (call on the "my applications" screen). */
    refreshPostingStatuses(): void {
      for (const [jobId, tracked] of Object.entries(store.byJobId())) {
        api.getById(jobId).subscribe({
          next: (posting) => {
            patchState(store, {
              byJobId: { ...store.byJobId(), [jobId]: { ...tracked, posting } },
            });
          },
          error: () => {
            // A withdrawn/removed-and-purged posting may 404 -- leave the last-known (null) state
            // rather than dropping the applicant's own application record.
          },
        });
      }
    },
  })),
);
