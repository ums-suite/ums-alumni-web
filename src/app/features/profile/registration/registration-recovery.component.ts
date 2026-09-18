import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * ALMW-7: "duplicate-registration detection routed to account recovery."
 *
 * FLAGGED GAP: duplicate detection is enforced only by a DB-level UNIQUE constraint on
 * `Alumnus.student_id_ref`, reachable exclusively from the internal graduation-event consumer --
 * there is no API surface for this app to call that could confirm or deny a duplicate. This
 * screen is therefore a support hand-off (contact channel), not a self-service lookup/merge flow;
 * building a fake "check for duplicates" button here would imply a capability that doesn't exist
 * server-side.
 */
@Component({
  selector: 'alw-registration-recovery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './registration-recovery.component.html',
  styleUrl: './registration-recovery.component.scss',
})
export class RegistrationRecoveryComponent {
  protected readonly supportEmail = 'alumni@university.edu';
}
