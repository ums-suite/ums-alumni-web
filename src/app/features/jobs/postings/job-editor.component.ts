import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UmsButtonComponent,
  UmsDatePickerComponent,
  UmsFormFieldComponent,
  UmsInputComponent,
  UmsTextareaComponent,
} from '@ums/design-system';
import type { UmsApiError } from '@ums/shared';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { JobsApi } from '../jobs.api';
import { JobsStore } from '../state/jobs.store';

/**
 * ALMW-12: job posting create/update. Design-decisions.md's "Re-Validate-at-Point-of-Mutation"
 * decision applies here identically to the donation-charge case: on SAVE (not page load), this
 * re-fetches the posting's current moderation status and rejects with a specific message if it
 * was removed by moderation in the meantime, rather than letting a stale edit silently republish
 * over a moderation action.
 */
@Component({
  selector: 'alw-job-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UmsButtonComponent,
    UmsDatePickerComponent,
    UmsFormFieldComponent,
    UmsInputComponent,
    UmsTextareaComponent,
    TranslatePipe,
  ],
  templateUrl: './job-editor.component.html',
  styleUrl: './job-editor.component.scss',
})
export class JobEditorComponent {
  protected readonly store = inject(JobsStore);
  private readonly api = inject(JobsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly jobId = this.route.snapshot.paramMap.get('jobId');
  protected readonly isEditMode = computed(() => this.jobId !== null);

  protected readonly title = signal('');
  protected readonly company = signal('');
  protected readonly description = signal('');
  protected readonly location = signal('');
  protected readonly contactMethod = signal('');
  protected readonly expiresAt = signal('');
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    if (this.jobId) {
      this.store.loadOne(this.jobId);
    }

    effect(() => {
      const selected = this.store.selected();
      if (!selected || !this.jobId) {
        return;
      }
      this.title.set(selected.title);
      this.company.set(selected.company);
      this.description.set(selected.description);
      this.location.set(selected.location);
      this.contactMethod.set(selected.contactMethod);
      this.expiresAt.set(selected.expiresAt.slice(0, 10));
    });
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    const request = {
      title: this.title(),
      company: this.company(),
      description: this.description(),
      location: this.location(),
      contactMethod: this.contactMethod(),
      expiresAt: new Date(this.expiresAt()).toISOString(),
    };

    if (!this.jobId) {
      this.store.create(request).subscribe({
        next: (job) => {
          this.saving.set(false);
          void this.router.navigateByUrl(`/app/jobs/${job.id}`);
        },
        error: (error: UmsApiError) => {
          this.saving.set(false);
          this.errorMessage.set(error.message || 'Could not create this posting.');
        },
      });
      return;
    }

    const jobId = this.jobId;
    this.api.getById(jobId).subscribe({
      next: (current) => {
        if (current.status === 'Removed') {
          this.saving.set(false);
          this.errorMessage.set(
            'This posting was removed by moderation and can no longer be edited.',
          );
          return;
        }

        this.store.update(jobId, { ...request, version: current.version }).subscribe({
          next: () => {
            this.saving.set(false);
            void this.router.navigateByUrl(`/app/jobs/${jobId}`);
          },
          error: (error: UmsApiError) => {
            this.saving.set(false);
            this.errorMessage.set(
              error.status === 409
                ? 'This posting changed elsewhere since you started editing -- please reload and try again.'
                : error.message || 'Could not save this posting.',
            );
          },
        });
      },
      error: (error: UmsApiError) => {
        this.saving.set(false);
        this.errorMessage.set(error.message || 'Could not verify this posting before saving.');
      },
    });
  }
}
