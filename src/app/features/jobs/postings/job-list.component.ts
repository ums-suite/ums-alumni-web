import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  UmsBadgeComponent,
  UmsButtonComponent,
  UmsEmptyStateComponent,
  UmsInputComponent,
} from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { JobsStore } from '../state/jobs.store';

/**
 * ALMW-12: job posting search/list with a prominent "verified employer" badge.
 *
 * FLAGGED GAP: `requirement-spec.md` §3.3 asks for filtering "by role, location, industry" -- the
 * real `GET /jobs/` query surface (confirmed against source) only accepts `status`,
 * `posterUserId`, `skip`, `take`; there is no server-side role/location/industry filter at all.
 * This screen fetches the current page of `Published` postings and applies a client-side
 * substring filter over title/company/location on top of it -- an honest, clearly-scoped stopgap
 * rather than a fabricated server capability, sufficient for the single page this app requests.
 */
@Component({
  selector: 'alw-job-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UmsBadgeComponent,
    UmsButtonComponent,
    UmsEmptyStateComponent,
    UmsInputComponent,
    TranslatePipe,
  ],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent {
  protected readonly store = inject(JobsStore);
  private readonly router = inject(Router);

  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return this.store.items();
    }
    return this.store
      .items()
      .filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q),
      );
  });

  constructor() {
    this.store.search({ status: 'Published', take: 100 });
  }

  protected isVerifiedEmployer(posterIsAlumnus: boolean): boolean {
    // Published + non-alumnus poster means it passed Admin moderation -- see jobs.types.ts's
    // FLAGGED GAP #1 for why this stands in for a real Employer-verification flag.
    return !posterIsAlumnus;
  }

  protected viewJob(id: string): void {
    void this.router.navigateByUrl(`/app/jobs/${id}`);
  }

  protected postJob(): void {
    void this.router.navigateByUrl('/app/jobs/new');
  }
}
