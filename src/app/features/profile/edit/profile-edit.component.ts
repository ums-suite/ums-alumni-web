import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UmsButtonComponent,
  UmsFormFieldComponent,
  UmsInputComponent,
  UmsTextareaComponent,
  UmsToastService,
} from '@ums/design-system';
import type { UmsApiError } from '@ums/shared';
import { AlumnusContextService } from '../../../core/auth/alumnus-context.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslateService } from '../../../core/i18n/translate.service';
import { applyFieldVisibility } from '../../../core/visibility/profile-visibility.util';
import { DEFAULT_VIEWER_CONTEXT } from '../../../core/visibility/profile-visibility.types';

/**
 * ALMW-8: profile editing (bio, current employer, location, contact fields, graduation
 * year/program shown read-only since they come from the Student record, not a self-asserted
 * claim -- confirmed the real `UpdateOwnProfileRequest` has no field for either).
 *
 * ALMW-10: per-field visibility controls (email+phone combined -- see FLAGGED GAP below --
 * and current employer) plus the distinct GLOBAL "hide my profile from directory search" toggle
 * (`ProfileVisibility`), and requirement-spec.md §7's "public view and private edit view, side by
 * side in the same component" -- realized here as a live preview panel built on the SAME reusable
 * `applyFieldVisibility` utility ALMW-9's directory and later mentorship/success-story/job-
 * applicant surfaces are required to share (Domain Invariant #1).
 */
@Component({
  selector: 'alw-profile-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UmsButtonComponent,
    UmsFormFieldComponent,
    UmsInputComponent,
    UmsTextareaComponent,
    TranslatePipe,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent {
  protected readonly context = inject(AlumnusContextService);
  private readonly toast = inject(UmsToastService);
  private readonly translate = inject(TranslateService);

  protected readonly bio = signal('');
  protected readonly currentEmployer = signal('');
  protected readonly location = signal('');
  protected readonly contactEmail = signal('');
  protected readonly contactPhone = signal('');
  protected readonly hideCurrentEmployer = signal(false);
  protected readonly hideContactDetails = signal(false);
  protected readonly isPublic = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** Live, stranger's-eye-view preview -- built on the exact same utility every other surface uses. */
  protected readonly preview = computed(() =>
    applyFieldVisibility(
      {
        contactEmail: this.contactEmail() || null,
        contactPhone: this.contactPhone() || null,
        currentEmployer: this.currentEmployer() || null,
        location: this.location() || null,
        hideCurrentEmployer: this.hideCurrentEmployer(),
        hideContactDetails: this.hideContactDetails(),
        profileVisibility: this.isPublic() ? 'Public' : 'Private',
      },
      DEFAULT_VIEWER_CONTEXT,
    ),
  );

  constructor() {
    effect(() => {
      const profile = this.context.profile();
      if (!profile) {
        return;
      }
      this.bio.set(profile.bio ?? '');
      this.currentEmployer.set(profile.currentEmployer ?? '');
      this.location.set(profile.location ?? '');
      this.contactEmail.set(profile.contactEmail ?? '');
      this.contactPhone.set(profile.contactPhone ?? '');
      this.hideCurrentEmployer.set(profile.hideCurrentEmployer);
      this.hideContactDetails.set(profile.hideContactDetails);
      this.isPublic.set(profile.profileVisibility === 'Public');
    });
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    this.context
      .updateProfile({
        currentEmployer: this.currentEmployer() || null,
        bio: this.bio() || null,
        location: this.location() || null,
        contactEmail: this.contactEmail() || null,
        contactPhone: this.contactPhone() || null,
        hideCurrentEmployer: this.hideCurrentEmployer(),
        hideContactDetails: this.hideContactDetails(),
        visibility: this.isPublic() ? 'Public' : 'Private',
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.show(this.translate.translate('profile.visibility.saved'), {
            variant: 'success',
          });
        },
        error: (error: UmsApiError) => {
          this.saving.set(false);
          this.errorMessage.set(error.message || 'Could not save your profile.');
        },
      });
  }
}
