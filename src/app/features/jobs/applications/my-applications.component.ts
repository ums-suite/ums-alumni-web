import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { MyApplicationsStore } from '../state/my-applications.store';

/**
 * ALMW-13: "if a posting expires mid-review, the application stays visible to the applicant with
 * the posting marked closed, rather than disappearing." Realized here against real data: every
 * locally-tracked application (see `MyApplicationsStore`'s own FLAGGED GAP doc) stays listed
 * regardless of what the refreshed posting status turns out to be -- closed/expired postings are
 * shown with a "closed" label next to the application, never removed from the list.
 */
@Component({
  selector: 'alw-my-applications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, UmsEmptyStateComponent],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
})
export class MyApplicationsComponent {
  protected readonly store = inject(MyApplicationsStore);

  protected readonly entries = computed(() =>
    Object.entries(this.store.byJobId()).map(([jobId, tracked]) => ({ jobId, ...tracked })),
  );

  constructor() {
    this.store.refreshPostingStatuses();
  }

  protected isClosed(status: string | undefined): boolean {
    return status !== undefined && status !== 'Published';
  }
}
