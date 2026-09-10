/**
 * Serveur Express Angular SSR.
 *
 * ⚠️ NON UTILISÉ EN PRODUCTION.
 *
 * Ce fichier existe uniquement parce que le CLI Angular en a besoin pendant le
 * pipeline de build (pour orchestrer le prerender). Le projet est configuré en
 * `outputMode: "static"` : au build, TOUTES les pages sont figées en HTML
 * statique et servies directement par Nginx/Vercel — aucun processus Node ne
 * tourne côté serveur.
 *
 * Si un jour tu veux passer en vrai SSR runtime (rendu à la volée à chaque
 * requête au lieu de prerender), tu passeras `outputMode` à `"server"` dans
 * angular.json et ce fichier deviendra ton entry point serveur en prod.
 */
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
 * Emplacement pour d'éventuels endpoints d'API Express custom.
 * Actuellement inutilisé (le site n'a pas de backend).
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => { ... });
 * ```
 */

/** Sert les assets statiques du dossier /browser avec cache 1 an (fingerprintés). */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/** Toutes les autres requêtes → Angular les rend via SSR. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Démarre le serveur si ce module est l'entry point (ou lancé via PM2).
 * Port : variable d'env `PORT`, sinon 4000 par défaut.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Handler utilisé par le CLI Angular pendant le dev-server et le build. */
export const reqHandler = createNodeRequestHandler(app);
