import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { AlumnusContextService } from '../../../core/auth/alumnus-context.service';
import { AUTH_ROUTES } from '../../../core/auth/auth-routes.constants';

/**
 * ALMW-7: "registration linking a new Alumnus to their originating Student record."
 *
 * FLAGGED GAP, confirmed against the real `ums-core` source: there is no HTTP endpoint for this
 * at all. `AlumnusService.CreateFromStudentGraduationAsync` exists only as an internal method
 * invoked by a background outbox-poller consuming Student's own `StudentGraduated` domain event
 * -- an Alumnus record is created automatically, server-side, the moment Student emits
 * graduation, never by a POST this app could call. There is therefore no "submit a registration
 * form" action to build here; what this screen does instead is the honest equivalent: explain
 * that linking happens automatically once graduation is processed, let the alumnus re-check
 * (`AlumnusContextService.ensureLoaded(true)`) without a full page reload, and route someone who
 * believes they already have an account (the duplicate-registration edge case, `edge-cases.md`)
 * to the recovery screen -- since duplicate detection itself also only exists inside that same
 * internal, unreachable-from-the-frontend code path (a DB unique constraint on `student_id_ref`),
 * this app cannot detect a duplicate directly either; recovery is a support hand-off, not a
 * self-service resolution.
 */
@Component({
  selector: 'alw-registration-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsButtonComponent],
  templateUrl: './registration-link.component.html',
  styleUrl: './registration-link.component.scss',
})
export class RegistrationLinkComponent {
  protected readonly context = inject(AlumnusContextService);
  private readonly router = inject(Router);

  constructor() {
    this.context.load();

    effect(() => {
      if (this.context.loaded() && !this.context.notLinked() && this.context.profile()) {
        void this.router.navigateByUrl(AUTH_ROUTES.authenticatedHome);
      }
    });
  }

  protected recheck(): void {
    this.context.load(true);
  }
}
