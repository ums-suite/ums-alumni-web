import { Injectable, computed, inject, signal } from '@angular/core';
import type { UmsApiError } from '@ums/shared';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AlumnusProfileApi } from '../http/alumnus-profile.api';
import type { AlumnusDto } from '../http/alumnus-profile.types';

/**
 * ALMW-4: the Alumni-scoped authorization boundary this app's own session is held to.
 *
 * Domain Invariant #5 ("SSO shares login, never authorization scope") is enforced structurally
 * here, not by a permission catalog: this app never calls anything but Alumni-module endpoints,
 * and every one of those endpoints resolves the caller's own `Alumnus` record server-side from
 * the live session (`CallerAlumnusResolver`) -- a person who is simultaneously Faculty and Alumni
 * gets exactly the same Alumni-scoped response either way, and this app has no code path that
 * could reach into `ums-faculty-web`'s data even if it wanted to (there is no shared client for
 * it). What THIS service adds on top is the app-level question every authenticated feature
 * (profile, directory, jobs, donations, mentorship) needs answered once: does this session
 * resolve to an Alumnus record at all, and if not, is that because they've never linked one
 * (route to registration/recovery, ALMW-7) or because the profile call itself failed.
 */
@Injectable({ providedIn: 'root' })
export class AlumnusContextService {
  private readonly api = inject(AlumnusProfileApi);

  private readonly profileInternal = signal<AlumnusDto | null>(null);
  private readonly loadingInternal = signal(false);
  private readonly loadedInternal = signal(false);
  private readonly notLinkedInternal = signal(false);
  private readonly errorInternal = signal<string | null>(null);

  readonly profile = this.profileInternal.asReadonly();
  readonly loading = this.loadingInternal.asReadonly();
  readonly loaded = this.loadedInternal.asReadonly();
  /** True once a load has resolved a 404 `alumnus.not_found` -- caller has no linked Alumnus record. */
  readonly notLinked = this.notLinkedInternal.asReadonly();
  readonly error = this.errorInternal.asReadonly();

  /** Client-side interim proxy for "pending verification" -- see `alumnus-profile.types.ts`'s FLAGGED GAP doc. */
  readonly isPendingVerification = computed(
    () => this.profileInternal()?.profileVisibility === 'Private',
  );

  /** Fire-and-forget trigger for components that don't need to await the result (e.g. app init). */
  load(force = false): void {
    this.ensureLoaded(force).subscribe();
  }

  /** Awaitable variant for guards that must know the outcome before letting navigation proceed. */
  ensureLoaded(force = false): Observable<void> {
    if (this.loadedInternal() && !force) {
      return of(undefined);
    }

    this.loadingInternal.set(true);
    this.errorInternal.set(null);
    this.notLinkedInternal.set(false);

    return this.api.getMyProfile().pipe(
      tap((profile) => {
        this.profileInternal.set(profile);
        this.loadingInternal.set(false);
        this.loadedInternal.set(true);
      }),
      map(() => undefined),
      catchError((rawError: unknown) => {
        // `AlumnusProfileApi.getMyProfile()` already normalizes via `AlumniApiBase.
        // normalizeErrors` (`toUmsApiError`), so `rawError` here IS ALREADY a `UmsApiError` plain
        // object, not an `HttpErrorResponse` -- calling `toUmsApiError` on it a second time would
        // hit its "not an HttpErrorResponse" fallback branch and silently lose the real status
        // (this was a real bug caught by this service's own test suite: a 404 was reported as
        // status 0 / "An unknown error occurred." instead of being recognized at all).
        const error = rawError as UmsApiError;
        this.loadingInternal.set(false);
        this.loadedInternal.set(true);
        if (error.status === 404) {
          this.notLinkedInternal.set(true);
          this.profileInternal.set(null);
        } else {
          this.errorInternal.set(error.message ?? null);
        }
        return of(undefined);
      }),
    );
  }

  applyUpdatedProfile(profile: AlumnusDto): void {
    this.profileInternal.set(profile);
    this.notLinkedInternal.set(false);
  }

  reset(): void {
    this.profileInternal.set(null);
    this.loadingInternal.set(false);
    this.loadedInternal.set(false);
    this.notLinkedInternal.set(false);
    this.errorInternal.set(null);
  }
}
