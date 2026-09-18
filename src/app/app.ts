import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UmsToastContainerComponent } from '@ums/design-system';
import { SessionExpiryService } from './core/auth/session-expiry.service';
import { SiteFooterComponent } from './shared/ui/shell/site-footer.component';
import { SiteHeaderComponent } from './shared/ui/shell/site-header.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, UmsToastContainerComponent, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly sessionExpiry = inject(SessionExpiryService);
}
