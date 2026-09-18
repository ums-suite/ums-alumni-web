import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

/**
 * ALMW-6: routing shell -- public SSR route group (root-level routes, rendered per
 * `app.routes.server.ts`'s `RenderMode.Server`) vs. the authenticated CSR shell (`/app/**`,
 * `RenderMode.Client`). Feature routes are added here incrementally as each ticket lands (see
 * `ComingSoonComponent` placeholders below, replaced one at a time by ALMW-7 onward); see
 * `app.routes.server.ts` for the matching render-mode split.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/public-home.component').then((m) => m.PublicHomeComponent),
  },
  {
    path: 'campaigns',
    loadComponent: () =>
      import('./shared/ui/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { title: 'Campaigns' },
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'directory' },
      {
        path: 'directory',
        loadComponent: () =>
          import('./shared/ui/coming-soon/coming-soon.component').then(
            (m) => m.ComingSoonComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/ui/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
