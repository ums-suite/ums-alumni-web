import { inject } from '@angular/core';
import { signalStore, withComputed, withMethods } from '@ngrx/signals';
import { CurrentUserService } from '@ums/shared';
import { ThemeService, type ThemeMode } from '@ums/design-system';
import { LocaleService } from '../i18n/locale.service';
import type { AlmwLocale } from '../i18n/locale.types';
import { AlumnusContextService } from '../auth/alumnus-context.service';

/**
 * ALMW-3: the app-wide session/locale/theme facade every feature reads cross-cutting context
 * from -- mirrors `ums-admin-web`'s `GlobalStore` pattern exactly (`withComputed`/`withMethods`
 * only, deliberately no `withState`: this is a thin, always-fresh read-through over already-
 * reactive singleton services, never a duplicated copy of their state).
 */
export const GlobalStore = signalStore(
  { providedIn: 'root' },
  withComputed(
    (
      _store,
      currentUser = inject(CurrentUserService),
      locale = inject(LocaleService),
      theme = inject(ThemeService),
      alumnusContext = inject(AlumnusContextService),
    ) => ({
      userId: currentUser.userId,
      sessionId: currentUser.sessionId,
      roles: currentUser.roles,
      locale: locale.locale,
      themeMode: theme.mode,
      resolvedTheme: theme.resolvedTheme,
      alumnusProfile: alumnusContext.profile,
      alumnusNotLinked: alumnusContext.notLinked,
      isPendingVerification: alumnusContext.isPendingVerification,
    }),
  ),
  withMethods(
    (
      _store,
      locale = inject(LocaleService),
      theme = inject(ThemeService),
      alumnusContext = inject(AlumnusContextService),
    ) => ({
      setLocale(next: AlmwLocale): void {
        locale.setLocale(next);
      },
      setThemeMode(next: ThemeMode): void {
        theme.setMode(next);
      },
      loadAlumnusContext(): void {
        alumnusContext.load();
      },
    }),
  ),
);
