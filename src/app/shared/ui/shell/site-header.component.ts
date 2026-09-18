import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TokenStorageService } from '@ums/shared';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { GlobalStore } from '../../../core/store/global.store';

/**
 * ALMW-6: the shared nav shell wrapping both the public SSR route group and the authenticated
 * CSR shell -- one visual brand, per requirement-spec.md §7 ("themed banner/accent within the
 * single brand," generalized here to the whole app rather than just chapter pages).
 */
@Component({
  selector: 'alw-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UmsButtonComponent, TranslatePipe],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly globalStore = inject(GlobalStore);

  protected readonly isAuthenticated = computed(() => this.tokenStorage.isAuthenticated());

  protected toggleLocale(): void {
    this.globalStore.setLocale(this.globalStore.locale() === 'en' ? 'bn' : 'en');
  }

  protected goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }

  protected logout(): void {
    this.authService.logout().subscribe({
      complete: () => void this.router.navigateByUrl('/'),
      error: () => void this.router.navigateByUrl('/'),
    });
  }
}
