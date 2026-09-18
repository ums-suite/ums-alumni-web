import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * ALMW-1/ALMW-6: the hybrid SSR/CSR split -- `requirement-spec.md` §2 (Rendering row): SSR for
 * anonymous/public routes (campaign/donation landing pages here; success stories and chapter
 * pages land in a later ticket batch, ALMW-20..22, and are added to this list then), CSR for the
 * authenticated app shell under `/app` and `/login` (no SEO value, and `RenderMode.Client` avoids
 * paying an SSR render cost for a screen that immediately needs a browser-only session anyway).
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
