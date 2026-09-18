import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder for a route whose real feature ticket hasn't landed yet in this incremental build. */
@Component({
  selector: 'alw-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="alw-coming-soon">
      <h1>{{ title() }}</h1>
      <p>This section is under construction.</p>
    </section>
  `,
  styles: `
    .alw-coming-soon {
      padding: var(--space-10, 3rem);
      text-align: center;
    }
  `,
})
export class ComingSoonComponent {
  readonly title = input('Coming soon');
}
