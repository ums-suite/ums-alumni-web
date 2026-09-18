import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UmsAvatarComponent,
  UmsButtonComponent,
  UmsEmptyStateComponent,
  UmsInputComponent,
} from '@ums/design-system';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import type { AlumniDirectoryEntryDto } from '../../core/http/alumnus-profile.types';
import { DirectoryStore } from './state/directory.store';

interface ClassYearGroup {
  readonly year: number;
  readonly entries: readonly AlumniDirectoryEntryDto[];
}

/**
 * ALMW-9: searchable/filterable alumni directory, "Class of ____" grouping with
 * campus-crest-style avatar framing (requirement-spec.md §7).
 *
 * FLAGGED GAP: `requirement-spec.md` §3.2 asks for filtering by "graduation year, program,
 * location, industry." The real `AlumniDirectoryFilter` (confirmed against ums-core source)
 * supports graduation year, program id, department id, employer, and location -- there is no
 * "industry" concept anywhere in the Alumni module. Program/department filtering is exposed here
 * as raw id fields (labelled accordingly) rather than a friendly picker, since building a real
 * Program/Department picker would require wiring `@ums/shared`'s `OrganizationApiService`
 * against unverified response shapes for this ticket -- left as a follow-up rather than guessed.
 *
 * ALMW-10 note: `AlumniDirectoryEntryDto` (confirmed shape) carries NO `hideCurrentEmployer`/
 * `hideContactDetails`/`profileVisibility` fields at all -- the server has already redacted
 * `currentEmployer`/`contactEmail`/`contactPhone` per-entry before this component ever sees them
 * (confirmed in `AlumnusService`/`AlumnusRepository` source), so there is nothing left for the
 * shared `applyFieldVisibility` utility to do on THIS surface -- it is reserved here for surfaces
 * that receive a less-redacted DTO (the caller's own profile, `ProfileEditComponent`'s preview
 * panel) or a future surface with no server-side redaction of its own. The "connect" action here
 * simply reflects whichever contact fields the server already chose to include.
 */
@Component({
  selector: 'alw-directory-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UmsAvatarComponent,
    UmsButtonComponent,
    UmsEmptyStateComponent,
    UmsInputComponent,
    TranslatePipe,
  ],
  templateUrl: './directory-search.component.html',
  styleUrl: './directory-search.component.scss',
})
export class DirectorySearchComponent {
  protected readonly store = inject(DirectoryStore);

  protected readonly graduationYear = signal('');
  protected readonly programId = signal('');
  protected readonly departmentId = signal('');
  protected readonly location = signal('');
  protected readonly employer = signal('');

  protected readonly groups = computed<readonly ClassYearGroup[]>(() => {
    const byYear = new Map<number, AlumniDirectoryEntryDto[]>();
    for (const entry of this.store.items()) {
      const list = byYear.get(entry.graduationYear) ?? [];
      list.push(entry);
      byYear.set(entry.graduationYear, list);
    }
    return [...byYear.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, entries]) => ({ year, entries }));
  });

  constructor() {
    this.store.search({});
  }

  protected search(): void {
    this.store.search({
      graduationYear: this.graduationYear() ? Number(this.graduationYear()) : undefined,
      programId: this.programId() || undefined,
      departmentId: this.departmentId() || undefined,
      location: this.location() || undefined,
      employer: this.employer() || undefined,
    });
  }

  protected hasContactChannel(entry: AlumniDirectoryEntryDto): boolean {
    return entry.contactEmail !== null || entry.contactPhone !== null;
  }
}
