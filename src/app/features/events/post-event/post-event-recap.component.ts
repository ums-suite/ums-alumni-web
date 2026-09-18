import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

/**
 * ALMW-20: post-event content capture (photos, recap) feeding into Success Stories
 * (`requirement-spec.md` §3.6).
 *
 * FLAGGED GAP: confirmed by an exhaustive grep of `ums-core`'s `Alumni` and `Content` modules for
 * "recap"/"photo"/"gallery"/"imageUrl" -- zero relevant hits (the only `ImageUrl` in the whole
 * repo belongs to Content's unrelated `Banner` entity). There is no field, entity, or endpoint
 * anywhere for attaching photos/recap text to an `AlumniEvent`, and nothing for Success Stories
 * to source such content from even if there were. This screen is therefore an honest, clearly
 * labeled "not yet available" placeholder -- not a fabricated persistence layer -- until a
 * backend addition lands (a `AlumniEvent` recap/media sub-resource, most plausibly, mirroring how
 * `LectureMaterial` or `Banner` attach media to their own owning entity).
 */
@Component({
  selector: 'alw-post-event-recap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsEmptyStateComponent, TranslatePipe],
  template: `
    <section class="alw-post-event-recap">
      <h1>{{ 'events.recap.title' | translate }}</h1>
      <ums-empty-state title="{{ 'events.recap.unavailable' | translate }}" />
    </section>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6, 1.5rem);
    }

    h1 {
      font-family: var(--font-family-display, 'Fraunces', serif);
    }
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- purely template-driven placeholder, no members needed yet.
export class PostEventRecapComponent {}
