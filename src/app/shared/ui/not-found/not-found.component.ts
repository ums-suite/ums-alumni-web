import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'alw-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="alw-not-found">
      <h1>Page not found</h1>
      <p><a routerLink="/">Return home</a></p>
    </section>
  `,
  styles: `
    .alw-not-found {
      text-align: center;
      padding: var(--space-10, 3rem);
    }
  `,
})
export class NotFoundComponent {
  protected readonly homePath = '/';
}
