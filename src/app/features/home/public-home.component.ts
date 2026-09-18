import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * ALMW-1/ALMW-6: the public, anonymous, SSR-rendered landing page -- proves the hybrid SSR/CSR
 * route split end-to-end (this route renders via `RenderMode.Server`, per `app.routes.server.ts`).
 * A later ticket batch (ALMW-22, Success Stories) replaces this with the full editorial landing;
 * for now this is the real entry point into the public campaign-browsing surface (ALMW-14).
 */
@Component({
  selector: 'alw-public-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsButtonComponent, TranslatePipe],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.scss',
})
export class PublicHomeComponent {
  protected readonly campaignsPath = '/campaigns';
}
