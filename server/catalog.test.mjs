// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createCatalogService, upstreamUrl, providerStatuses, catalogMiddleware } from './catalog.mjs';

describe('Catalog server (synthetic fixtures, no live network)', () => {
  it('does not enable credential-bearing or unidentified integrations', () => {
    const statuses = providerStatuses('');
    for (const category of ['films', 'games', 'photography', 'music']) expect(statuses.find(s => s.category === category).state).toBe('unavailable');
  });
  it('builds only fixed provider URLs and rejects untrusted IDs', () => {
    expect(upstreamUrl('aic', 'a&b')).toContain('q=a%26b');
    expect(() => upstreamUrl('aic', '', 'https://attacker.invalid')).toThrow();
    expect(() => upstreamUrl('unknown', 'test')).toThrow();
    expect(new URL(upstreamUrl('musicbrainz', '', '11111111-2222-3333-4444-555555555555')).searchParams.get('inc')).toContain('url-rels');
  });
  it('coalesces and caches identical requests', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ docs: [{ key: '/works/OL123W', title: 'Fixture book' }] })));
    const service = createCatalogService({ fetcher, contact: '' });
    const [a, b] = await Promise.all([service.search('fixture', 'books'), service.search('fixture', 'books')]);
    expect(fetcher).toHaveBeenCalledTimes(1); expect(a.items).toEqual(b.items); expect(a.statuses[0].state).toBe('success');
    await service.search('fixture', 'books'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('reports rate limiting honestly and does not retry immediately', async () => {
    const fetcher = vi.fn(async () => new Response('{}', { status: 429 }));
    const service = createCatalogService({ fetcher, contact: '' });
    const result = await service.search('fixture', 'art');
    expect(result.items).toEqual([]); expect(result.statuses[0].state).toBe('error');
    await service.search('another', 'art'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('handles malformed provider JSON without claiming a successful search', async () => {
    const service = createCatalogService({ fetcher: async () => new Response('{bad json'), contact: '' });
    expect((await service.search('fixture', 'books')).statuses[0].state).toBe('error');
  });
  it('sets application identification on MusicBrainz and leaves artwork absent', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ 'release-groups': [] })));
    const service = createCatalogService({ fetcher, contact: 'https://example.org/contact' });
    await service.search('fixture', 'music');
    expect(fetcher.mock.calls[0][1].headers['User-Agent']).toBe('NOCTIS/0.3.0 (https://example.org/contact)');
  });
  it('uses the AIC identification header with bounded normalized results', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [{ id: 123, title: 'Fixture painting', is_public_domain: false }] })));
    const service = createCatalogService({ fetcher, contact: '' });
    const result = await service.search('fixture', 'art');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].image).toBeUndefined();
    expect(fetcher.mock.calls[0][1].headers['AIC-User-Agent']).toBe('NOCTIS/0.3.0');
  });
  it('requests cover identifiers in book search and preserves them in normalization', async () => {
    expect(new URL(upstreamUrl('openlibrary','fixture')).searchParams.get('fields')).toContain('cover_edition_key');
    const service=createCatalogService({fetcher:async()=>new Response(JSON.stringify({docs:[{key:'/works/OL123W',title:'Book',cover_i:456,cover_edition_key:'OL789M'}]})),contact:''});
    const result=await service.search('fixture','books');expect(result.items[0].image.sourceUrl).toBe('https://openlibrary.org/books/OL789M');
  });
  it('uses CAA artwork only on demand and keeps a release-specific source',async()=>{
    const id='11111111-2222-3333-4444-555555555555';
    const fetcher=vi.fn(async url=>new Response(JSON.stringify(String(url).includes('coverartarchive.org')?{release:`https://musicbrainz.org/release/${id}`,images:[{front:true,approved:true,image:`https://coverartarchive.org/release/${id}/123.jpg`}]}:{id,title:'Release group',relations:[]})));
    const service=createCatalogService({fetcher,contact:'https://example.org/contact'});
    const work=await service.detail('musicbrainz',id);expect(work.image.sourceUrl).toBe(`https://musicbrainz.org/release/${id}`);expect(fetcher).toHaveBeenCalledTimes(2);
    await service.detail('musicbrainz',id);expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not fail a music record if CAA has no image',async()=>{
    const id='11111111-2222-3333-4444-555555555555';
    const service=createCatalogService({fetcher:async url=>String(url).includes('coverartarchive.org')?new Response('{}',{status:404}):new Response(JSON.stringify({id,title:'No cover',relations:[]})),contact:'https://example.org/contact'});
    const work=await service.detail('musicbrainz',id);expect(work.title).toBe('No cover');expect(work.image).toBeUndefined();
  });
  it('returns 400 for invalid queries and 405 for unsupported methods', () => {
    for (const [req, expected] of [[{ url: '/api/catalog/search?q=a', method: 'GET' }, 400], [{ url: '/api/catalog/search?q=ab', method: 'POST' }, 405]]) {
      const res = { statusCode: 200, setHeader: vi.fn(), end: vi.fn() };
      catalogMiddleware()(req, res, vi.fn()); expect(res.statusCode).toBe(expected);
    }
  });
});
