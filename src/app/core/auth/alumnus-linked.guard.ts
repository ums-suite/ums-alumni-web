import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AUTH_ROUTES } from './auth-routes.constants';
import { AlumnusContextService } from './alumnus-context.service';

/**
 * ALMW-7: guards every authenticated route that needs a real linked Alumnus record (directory,
 * job application, donations, profile edit) -- a session that resolves to no Alumnus at all
 * (never registered, or the link genuinely doesn't exist) is routed to the registration/recovery
 * flow instead of hitting a 404 deep inside a feature screen.
 */
export const alumnusLinkedGuard: CanActivateFn = () => {
  const context = inject(AlumnusContextService);
  const router = inject(Router);

  return context
    .ensureLoaded()
    .pipe(
      map(() =>
        context.notLinked() ? router.createUrlTree([AUTH_ROUTES.registrationRecovery]) : true,
      ),
    );
};
