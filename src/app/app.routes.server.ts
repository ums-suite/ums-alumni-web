import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * ALMW-1/ALMW-6: the hybrid SSR/CSR split -- `requirement-spec.md` §2 (Rendering row): SSR for
 * anonymous/public routes (campaign/donation landing pages, and -- as of ALMW-22 -- `/stories`
 * and `/stories/:storyId`), CSR for the authenticated app shell under `/app` and `/login` (no SEO
 * value, and `RenderMode.Client` avoids paying an SSR render cost for a screen that immediately
 * needs a browser-only session anyway). `/stories/**` needs no separate entry here: it's dynamic
 * backend content, not a static route, so the existing `'**' -> RenderMode.Server` catch-all
 * below already covers it -- only routes that need to OPT OUT of that default (the `/app` shell,
 * `/login`, registration) get their own entry.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'app/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register/recovery',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
