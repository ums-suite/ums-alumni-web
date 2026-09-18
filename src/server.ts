import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 *
 * ALMW-1: The build's `security.allowedHosts` (angular.json) is `["*"]` since no production
 * hostname is decided yet -- a real deployment should instead set the `NG_ALLOWED_HOSTS` env var
 * (comma-separated), which @angular/ssr reads ahead of this static list, to the actual public
 * hostname(s). An EMPTY array here (the Angular CLI's own scaffold default) is a deny-ALL for
 * @angular/ssr's SSRF-prevention check, not an allow-all -- this bit ums-public-web (Flow #27)
 * for real: `ng build` succeeds either way, but every request to the compiled server 500s with
 * "Header 'host' with value '...' is not allowed" until this is set. Never leave the scaffold
 * default in place on an app whose SSR server will actually be run standalone.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: Error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
