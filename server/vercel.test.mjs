// @vitest-environment node
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import handler from '../api/catalog.mjs';

class Response extends EventEmitter {
  statusCode = 200;
  headers = {};
  body = '';
  setHeader(name, value) {
    this.headers[name] = value;
  }
  end(body) {
    this.body = body;
    this.emit('finish');
  }
}
async function invoke(req) {
  const res = new Response();
  await handler({ method: 'GET', ...req }, res);
  return res;
}
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const spa = new RegExp(`^${config.rewrites.at(-1).source}$`);
describe('Vercel production preparation', () => {
  it.each([
    '/discover',
    '/search',
    '/archive',
    '/my-archive',
    '/books/gutenberg:books:84',
    '/albums/local-id',
  ])('serves the SPA fallback for %s', (path) => {
    expect(spa.test(path)).toBe(true);
    expect(config.rewrites.at(-1).destination).toBe('/index.html');
  });
  it.each([
    '/api',
    '/api/catalog/status',
    '/api/catalog/search',
    '/api/unknown',
    '/assets/missing.js',
    '/artworks/missing.jpg',
  ])('does not turn %s into HTML', (path) => expect(spa.test(path)).toBe(false));
  it('builds dist and routes the API before the SPA', () => {
    expect(config.outputDirectory).toBe('dist');
    expect(config.installCommand).toBe('npm ci');
    expect(config.rewrites[0]).toEqual({
      source: '/api/catalog/:path*',
      destination: '/api/catalog?__noctis_route=:path*',
    });
  });
  it('returns JSON status through the original request URL', async () => {
    const res = await invoke({ url: '/api/catalog/status' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toMatch(/application\/json/);
    expect(JSON.parse(res.body)).toHaveLength(6);
  });
  it('preserves search parameters when Vercel supplies a rewritten URL', async () => {
    const res = await invoke({
      url: '/api/catalog?__noctis_route=search&q=fixture&category=films',
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).statuses[0].category).toBe('films');
  });
  it('also accepts routing and search parameters in the Vercel query object', async () => {
    const res = await invoke({
      url: '/api/catalog',
      query: { __noctis_route: ['search'], q: 'fixture', category: 'films' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).statuses[0].category).toBe('films');
  });
  it('keeps validation, unsupported methods and unknown endpoints in JSON', async () => {
    for (const [req, status] of [
      [{ url: '/api/catalog/search?q=a' }, 400],
      [{ url: '/api/catalog/status', method: 'POST' }, 405],
      [{ url: '/api/catalog/unknown' }, 404],
      [{ url: '/api/catalog' }, 404],
    ]) {
      const res = await invoke(req);
      expect(res.statusCode).toBe(status);
      expect(JSON.parse(res.body).error).toBeTruthy();
    }
  });
  it('preserves nested item routes and normalizes provider metadata', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new globalThis.Response(
        JSON.stringify({ key: '/works/OL123W', title: 'Publication fixture', covers: [123] }),
      ),
    );
    const res = await invoke({ url: '/api/catalog?__noctis_route=item%2Fopenlibrary%2FOL123W' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).item.title).toBe('Publication fixture');
  });
});
