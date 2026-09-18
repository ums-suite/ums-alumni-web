import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UmsBadgeComponent, UmsButtonComponent, UmsTextareaComponent } from '@ums/design-system';
import { CurrentUserService, type UmsApiError } from '@ums/shared';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { JobsStore } from '../state/jobs.store';
import { MyApplicationsStore } from '../state/my-applications.store';

/**
 * ALMW-12/ALMW-13: job posting detail, "verified employer" badge, and in-app application
 * submission. A closed/expired posting never accepts a new application -- the real backend
 * enforces this at INSERT time (`TryInsertIfPostingAcceptsApplicationsAsync`, 409
 * `jobposting.not_accepting_applications`) rather than this component trusting its own
 * page-load-time `status`/`expiresAt` snapshot, mirroring the platform's own
 * re-validate-at-point-of-mutation posture for the analogous donation-campaign case.
 */
@Component({
  selector: 'alw-job-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsBadgeComponent, UmsButtonComponent, UmsTextareaComponent, TranslatePipe],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent {
  protected readonly store = inject(JobsStore);
  protected readonly applications = inject(MyApplicationsStore);
  private readonly currentUser = inject(CurrentUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly jobId = this.route.snapshot.paramMap.get('jobId') ?? '';
  protected readonly note = signal('');
  protected readonly applyError = signal<string | null>(null);

  protected readonly isOwner = computed(
    () => this.store.selected()?.posterUserId === this.currentUser.userId(),
  );

  protected readonly isVerifiedEmployer = computed(() => {
    const job = this.store.selected();
    return !!job && !job.posterIsAlumnus;
  });

  protected readonly canApply = computed(() => {
    const job = this.store.selected();
    if (!job) {
      return false;
    }
    return job.status === 'Published' && new Date(job.expiresAt).getTime() > Date.now();
  });

  protected readonly alreadyApplied = computed(() => this.applications.hasApplied(this.jobId));

  constructor() {
    this.store.loadOne(this.jobId);
  }

  protected apply(): void {
    this.applyError.set(null);
    this.applications
      .apply(this.jobId, { note: this.note() || null, resumeArtifactId: null })
      .subscribe({
        error: (error: UmsApiError) => {
          this.applyError.set(
            error.status === 409
              ? 'This posting is no longer accepting applications -- it may have just closed.'
              : error.message || 'Could not submit your application.',
          );
        },
      });
  }

  protected editJob(): void {
    void this.router.navigateByUrl(`/app/jobs/${this.jobId}/edit`);
  }
}
