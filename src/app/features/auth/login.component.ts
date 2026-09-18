import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UmsButtonComponent, UmsFormFieldComponent, UmsInputComponent } from '@ums/design-system';
import type { UmsApiError } from '@ums/shared';
import { AuthService } from '../../core/auth/auth.service';
import { RETURN_URL_QUERY_PARAM } from '../../core/auth/auth-routes.constants';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/** ALMW-4: single shared SSO login screen for this app (BFF-held tokens, ADR-0005). */
@Component({
  selector: 'alw-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UmsButtonComponent,
    UmsFormFieldComponent,
    UmsInputComponent,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly identifier = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.submitting() || !this.identifier() || !this.password()) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.identifier(), this.password()).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get(RETURN_URL_QUERY_PARAM);
        void this.router.navigateByUrl(returnUrl || '/app/directory');
      },
      error: (error: UmsApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message || 'Invalid credentials.');
      },
    });
  }
}
