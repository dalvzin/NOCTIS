import { catalogMiddleware } from '../server/catalog.mjs';

const catalog = catalogMiddleware();
// Keep the existing catalog service and relative browser URLs. The explicit
// rewrite parameter also works when Vercel provides the destination pathname.
export default function handler(req, res) {
  const url = new URL(req.url || '/', 'https://noctis.invalid');
  if (!url.pathname.startsWith('/api/catalog/')) {
    const route = req.query?.__noctis_route ?? url.searchParams.get('__noctis_route');
    const path = Array.isArray(route) ? route.join('/') : route;
    if (typeof path === 'string' && path) {
      const query = new URLSearchParams(url.search);
      // Vercel exposes the original query separately in some runtimes.
      for (const [key, value] of Object.entries(req.query ?? {})) {
        if (key === '__noctis_route' || query.has(key)) continue;
        for (const item of Array.isArray(value) ? value : [value]) query.append(key, String(item));
      }
      query.delete('__noctis_route');
      req.url = `/api/catalog/${path}?${query}`;
    }
  }
  // The middleware finishes asynchronously. Keep the function alive until the
  // response ends, rather than returning before provider requests complete.
  return new Promise((resolve, reject) => {
    res.once('finish', resolve);
    res.once('close', resolve);
    res.once('error', reject);
    catalog(req, res, () => {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ error: 'Catalog endpoint not found' }));
    });
  });
}
