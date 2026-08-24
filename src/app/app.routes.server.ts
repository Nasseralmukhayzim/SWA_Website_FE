import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Content is fetched from a live API and changes independently of deploys,
    // so every route renders per-request instead of being prerendered at build time.
    renderMode: RenderMode.Server,
  },
];
