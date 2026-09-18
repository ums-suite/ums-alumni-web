import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'alw-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="alw-site-footer">
      <p>© {{ year }} University Alumni Association</p>
    </footer>
  `,
  styles: `
    :host {
      display: block;
    }
    .alw-site-footer {
      padding: var(--space-6, 1.5rem);
      text-align: center;
      color: var(--color-text-muted, var(--color-text));
      font-size: var(--type-caption-font-size, 0.875rem);
    }
  `,
})
export class SiteFooterComponent {
  protected readonly year = new Date().getFullYear();
}
