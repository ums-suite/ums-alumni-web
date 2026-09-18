import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UmsBadgeComponent,
  UmsButtonComponent,
  UmsEmptyStateComponent,
  UmsInputComponent,
  UmsSelectComponent,
  UmsTextareaComponent,
  type SelectOption,
} from '@ums/design-system';
import { applyFieldVisibility } from '../../../core/visibility/profile-visibility.util';
import { AlumnusProfileApi } from '../../../core/http/alumnus-profile.api';
import type { AlumnusDto } from '../../../core/http/alumnus-profile.types';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MentorshipStore } from '../state/mentorship.store';
import type { MentorshipMatchDto, MentorshipMatchStatus } from '../mentorship.types';

const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'Proposed', label: 'Pending your acceptance' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Ended', label: 'Ended' },
];

/**
 * ALMW-17/18: this app's Alumnus-side mentorship surface -- manage a mentor opt-in profile, and
 * browse/search/act on the caller's own `MentorshipMatch` list (mentor-side only; see
 * `mentorship.types.ts` for the confirmed backend gaps this design works honestly around).
 *
 * Domain Invariant #6 ("contact details exchange only after mutual acceptance"): a still-Proposed
 * match never shows a contact-visibility preview at all; only once a match reaches `Active` does
 * this component show, via {@link applyFieldVisibility}, exactly the contact channels the
 * mentee will now be able to see on the mentor's own profile -- the one contact-exchange
 * mechanism this app can honestly implement without a Student-module profile lookup (gap #4).
 */
@Component({
  selector: 'alw-mentorship-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UmsBadgeComponent,
    UmsButtonComponent,
    UmsEmptyStateComponent,
    UmsInputComponent,
    UmsSelectComponent,
    UmsTextareaComponent,
    TranslatePipe,
  ],
  templateUrl: './mentorship-browse.component.html',
  styleUrl: './mentorship-browse.component.scss',
})
export class MentorshipBrowseComponent {
  protected readonly store = inject(MentorshipStore);
  private readonly profileApi = inject(AlumnusProfileApi);

  protected readonly statusOptions = STATUS_FILTER_OPTIONS;
  protected readonly statusFilter = signal('');

  protected readonly expertiseAreas = signal('');
  protected readonly capacityLimit = signal('3');
  protected readonly availability = signal('');
  protected readonly optInError = signal<string | null>(null);
  protected readonly isOptingIn = signal(false);

  protected readonly endingMatchId = signal<string | null>(null);
  protected readonly acceptingMatchId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  private readonly myProfile = signal<AlumnusDto | null>(null);

  protected readonly filteredMatches = computed<readonly MentorshipMatchDto[]>(() => {
    const status = this.statusFilter();
    const matches = this.store.matches();
    return status ? matches.filter((match) => match.status === status) : matches;
  });

  protected readonly hasCapacity = computed(() => {
    const optIn = this.store.myOptIn();
    return optIn ? optIn.activeCount < optIn.capacityLimit : true;
  });

  constructor() {
    this.store.loadMatches();
    this.profileApi.getMyProfile().subscribe({ next: (profile) => this.myProfile.set(profile) });
  }

  protected submitOptIn(): void {
    const capacity = Number(this.capacityLimit());
    if (!this.expertiseAreas().trim() || Number.isNaN(capacity) || capacity < 0) {
      this.optInError.set('Enter your areas of expertise and a valid, non-negative capacity.');
      return;
    }

    this.optInError.set(null);
    this.isOptingIn.set(true);
    this.store
      .optIn({
        role: 'Mentor',
        expertiseAreas: this.expertiseAreas().trim(),
        capacityLimit: capacity,
        availability: this.availability().trim() || null,
      })
      .subscribe({
        next: () => this.isOptingIn.set(false),
        error: (error: { message: string }) => {
          this.isOptingIn.set(false);
          this.optInError.set(error.message);
        },
      });
  }

  protected acceptMatch(match: MentorshipMatchDto): void {
    this.actionError.set(null);
    this.acceptingMatchId.set(match.id);
    this.store.acceptMatch(match.id).subscribe({
      next: () => this.acceptingMatchId.set(null),
      error: (error: { message: string }) => {
        this.acceptingMatchId.set(null);
        this.actionError.set(error.message);
      },
    });
  }

  protected endMatch(match: MentorshipMatchDto): void {
    this.actionError.set(null);
    this.endingMatchId.set(match.id);
    this.store.endMatch(match.id, { reason: 'Ended by mentor' }).subscribe({
      next: () => this.endingMatchId.set(null),
      error: (error: { message: string }) => {
        this.endingMatchId.set(null);
        this.actionError.set(error.message);
      },
    });
  }

  /** Whether the CALLER (always the mentor in this app) still needs to accept this match. */
  protected awaitingMyAcceptance(match: MentorshipMatchDto): boolean {
    return match.status === 'Proposed' && match.mentorAcceptedAt === null;
  }

  protected pendingSince(match: MentorshipMatchDto): string {
    return new Date(match.proposedAt).toLocaleDateString();
  }

  /**
   * Domain Invariant #6 / core/visibility reuse: the contact channels a mentee can now see on the
   * mentor's own profile, once this match is genuinely `Active` -- never shown for a still-Proposed
   * match, since mutual acceptance hasn't happened yet.
   */
  protected visibleContactPreview(
    match: MentorshipMatchDto,
  ): { email: string | null; phone: string | null } | null {
    const profile = this.myProfile();
    if (match.status !== 'Active' || !profile) {
      return null;
    }
    const fields = applyFieldVisibility(profile);
    return { email: fields.contactEmail, phone: fields.contactPhone };
  }

  protected badgeVariant(
    status: MentorshipMatchStatus,
  ): 'success' | 'warning' | 'neutral' | 'danger' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Proposed':
        return 'warning';
      case 'Ended':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
