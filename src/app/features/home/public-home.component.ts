import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * ALMW-1/ALMW-6: the public, anonymous, SSR-rendered landing page -- proves the hybrid SSR/CSR
 * route split end-to-end (this route renders via `RenderMode.Server`, per `app.routes.server.ts`).
 * ALMW-22 (Success Stories) links out to `/stories` from here rather than replacing this page
 * outright -- a full editorial-landing redesign of the homepage itself is a larger, separate
 * design decision this ticket doesn't force; this remains the entry point into both the public
 * campaign-browsing surface (ALMW-14) and the Success Stories feed.
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
