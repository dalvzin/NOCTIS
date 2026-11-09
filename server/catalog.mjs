import {
  normalizeResponse,
  normalizeAic,
  normalizeOpenLibrary,
  normalizeMusicBrainz,
  musicArtwork,
  object,
} from '../src/services/providers.ts';

// Somente este módulo roda no servidor. Nenhuma variável privada é importada pelo React.
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const labels = {
  openlibrary: 'Open Library',
  aic: 'Art Institute of Chicago',
  musicbrainz: 'MusicBrainz',
};
const categories = { openlibrary: 'books', aic: 'art', musicbrainz: 'music' };
const disabled = [
  {
    category: 'films',
    label: 'TMDB',
    state: 'unavailable',
    message:
      'Live film search is not connected: API credentials and approved branding are required. Local selections remain searchable.',
  },
  {
    category: 'games',
    label: 'RAWG',
    state: 'unavailable',
    message:
      'Live game search is not connected: API credentials and applicable plan terms must be confirmed. Local selections remain searchable.',
  },
  {
    category: 'photography',
    label: 'Unsplash',
    state: 'unavailable',
    message:
      'Live photography search is not connected: an approved API application and credentials are required. Local selections remain searchable.',
  },
];
export function providerStatuses(contact = process.env.NOCTIS_CONTACT) {
  return [
    ...Object.keys(labels).map((provider) => ({
      category: categories[provider],
      label: labels[provider],
      state: provider === 'musicbrainz' && !contact ? 'unavailable' : 'ready',
      message:
        provider === 'musicbrainz' && !contact
          ? 'Live music search needs a real application contact on the server. Local selections remain searchable.'
          : 'Available for on-demand metadata lookup.',
    })),
    ...disabled,
  ];
}

const aicFields =
  'id,title,artist_title,artist_display,date_start,date_display,medium_display,classification_title,is_public_domain,image_id,thumbnail,description,style_titles';
export function upstreamUrl(provider, query, id) {
  if (provider === 'openlibrary') {
    if (id) {
      if (!/^OL\d+W$/.test(id)) throw new Error('Invalid identifier');
      return `https://openlibrary.org/works/${id}.json`;
    }
    const url = new URL('https://openlibrary.org/search.json');
    url.search =
      new URLSearchParams({ q: query, limit: '12' }).toString() +
      '&fields=key,title,author_name,first_publish_year,subject,cover_i,cover_edition_key';
    return url.href;
  }
  if (provider === 'aic') {
    if (id && !/^\d+$/.test(id)) throw new Error('Invalid identifier');
    const url = new URL(`https://api.artic.edu/api/v1/artworks/${id || 'search'}`);
    url.search =
      (id ? '' : new URLSearchParams({ q: query, limit: '12' }).toString() + '&') +
      `fields=${aicFields}`;
    return url.href;
  }
  if (provider === 'musicbrainz') {
    if (id && !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id))
      throw new Error('Invalid identifier');
    const url = new URL(`https://musicbrainz.org/ws/2/release-group/${id || ''}`);
    url.search = new URLSearchParams(
      id
        ? { fmt: 'json', inc: 'artist-credits+tags+url-rels' }
        : { query: `releasegroup:"${query.replace(/["\\]/g, ' ')}"`, limit: '12', fmt: 'json' },
    ).toString();
    return url.href;
  }
  throw new Error('Provider not supported');
}

export function createCatalogService({
  fetcher = fetch,
  contact = process.env.NOCTIS_CONTACT,
  now = Date.now,
} = {}) {
  const cache = new Map();
  const pending = new Map();
  const nextRequest = new Map();
  const cooldown = new Map();
  const artworkCache = new Map();
  let nextArtwork = 0;
  async function releaseArtwork(id) {
    const hit = artworkCache.get(id);
    if (hit && hit.expires > now()) return hit.image;
    if (now() < nextArtwork) return undefined;
    nextArtwork = now() + 1100;
    try {
      const response = await fetcher(`https://coverartarchive.org/release-group/${id}`, {
        headers: { Accept: 'application/json', 'User-Agent': `NOCTIS/0.4.1 (${contact})` },
        signal: AbortSignal.timeout(2500),
      });
      const image = response.ok ? musicArtwork(await response.json()) : undefined;
      artworkCache.set(id, { image, expires: now() + 600000 });
      if (artworkCache.size > 100) artworkCache.delete(artworkCache.keys().next().value);
      return image;
    } catch {
      return undefined;
    } // Falta de capa nunca derruba os metadados.
  }
  async function request(provider, query = '', id) {
    if (provider === 'musicbrainz' && !contact) throw new Error('Provider not configured');
    const url = upstreamUrl(provider, query, id);
    const hit = cache.get(url);
    if (hit && hit.expires > now()) return hit.payload;
    if (pending.has(url)) return pending.get(url);
    if ((cooldown.get(provider) ?? 0) > now()) throw new Error('Provider cooling down');
    const wait = Math.max(0, (nextRequest.get(provider) ?? 0) - now());
    if (wait > 2200) throw new Error('Too many requests');
    nextRequest.set(provider, now() + wait + 1100);
    const task = (async () => {
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      try {
        const headers = {
          Accept: 'application/json',
          'User-Agent': `NOCTIS/0.3.0${contact ? ` (${contact})` : ''}`,
        };
        if (provider === 'aic') headers['AIC-User-Agent'] = headers['User-Agent'];
        const response = await fetcher(url, { headers, signal: AbortSignal.timeout(6500) });
        if (response.status === 404 && id) return { notFound: true };
        if (!response.ok) {
          if (response.status === 429 || response.status === 503)
            cooldown.set(provider, now() + 30000);
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (!id) normalizeResponse(provider, payload); // Não armazenar uma resposta malformada no cache.
        cache.set(url, { payload, expires: now() + 600000 });
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return payload;
      } catch (error) {
        const reason = /^HTTP \d{3}$/.test(error.message)
          ? error.message
          : error.name === 'TimeoutError'
            ? 'Request timed out'
            : error.cause?.code === 'ENOTFOUND'
              ? 'DNS lookup failed'
              : 'Network or provider response unavailable';
        throw new Error(reason);
      } finally {
        pending.delete(url);
      }
    })();
    pending.set(url, task);
    return task;
  }
  return {
    async search(query, category = '') {
      const statuses = providerStatuses(contact);
      const supported = Object.keys(labels).filter(
        (provider) =>
          (!category || categories[provider] === category) &&
          statuses.find((status) => status.category === categories[provider]).state === 'ready',
      );
      const groups = await Promise.all(
        supported.map(async (provider) => {
          const status = statuses.find((value) => value.category === categories[provider]);
          try {
            const items = normalizeResponse(provider, await request(provider, query));
            status.state = 'success';
            status.message = `Searched ${labels[provider]} (up to 12 results).`;
            return items;
          } catch (error) {
            status.state = 'error';
            status.message = `${labels[provider]} could not be reached (${error.message}). Local results are still available. Retry later.`;
            return [];
          }
        }),
      );
      return {
        items: groups.flat(),
        statuses: category ? statuses.filter((status) => status.category === category) : statuses,
      };
    },
    async detail(provider, id) {
      const payload = await request(provider, '', id),
        data = object(payload);
      if (data.notFound) return null;
      if (provider === 'aic') return normalizeAic(data.data, object(data.config).iiif_url);
      if (provider === 'musicbrainz') {
        const work = normalizeMusicBrainz({ ...data, relations: data.relations ?? [] });
        if (work) work.image = await releaseArtwork(id);
        return work;
      }
      return normalizeOpenLibrary({ ...data, key: `/works/${id}`, links: data.links ?? [] });
    },
  };
}

export function catalogMiddleware(service = createCatalogService()) {
  return (req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/catalog/')) return next();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
    (async () => {
      if (url.pathname === '/api/catalog/status')
        return res.end(JSON.stringify(providerStatuses()));
      if (url.pathname === '/api/catalog/search') {
        const q = (url.searchParams.get('q') || '').trim(),
          category = url.searchParams.get('category') || '';
        if (
          q.length < 2 ||
          q.length > 120 ||
          (category &&
            !Object.values(categories).concat(['films', 'games', 'photography']).includes(category))
        ) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid query' }));
        }
        return res.end(JSON.stringify(await service.search(q, category)));
      }
      const match = url.pathname.match(
        /^\/api\/catalog\/item\/(openlibrary|aic|musicbrainz)\/([a-zA-Z\d-]+)$/,
      );
      if (!match) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Record not found' }));
      }
      const item = await service.detail(match[1], match[2]);
      res.statusCode = item ? 200 : 404;
      res.end(JSON.stringify({ item }));
    })().catch(() => {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'The external catalog is unavailable. Try again later.' }));
    });
  };
}
