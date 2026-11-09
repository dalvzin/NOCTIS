import type { CategorySlug, Destination, DestinationKind, Work } from '../types/catalog.ts';
import { safeExternalUrl } from './catalogUtils.ts';

const labels: Record<DestinationKind, string> = {
  spotify: 'Listen on Spotify',
  musicbrainz: 'View on MusicBrainz',
  'book-details': 'View Book Details',
  publisher: 'View Publisher Page',
  bookstore: 'View Bookstore Page',
  official: 'Visit Official Website',
  storefront: 'View Store Page',
  streaming: 'Visit Streaming Destination',
  distributor: 'Visit Distributor Website',
  tmdb: 'View on TMDB',
  'film-details': 'View Film Details',
  'game-details': 'View Game Details',
  photograph: 'View Original Photograph',
  'photo-context': 'View Photography Source',
  museum: 'View Museum Collection',
  discography: 'View Artist Discography',
};
const allowed: Record<CategorySlug, DestinationKind[]> = {
  books: ['publisher', 'bookstore', 'book-details'],
  music: ['spotify', 'musicbrainz', 'discography'],
  films: ['streaming', 'distributor', 'tmdb', 'film-details'],
  games: ['official', 'storefront', 'game-details'],
  photography: ['photograph', 'photo-context'],
  art: ['museum'],
};
const uuid = '[a-f\\d]{8}(?:-[a-f\\d]{4}){3}-[a-f\\d]{12}';

export function destinationLabel(destination: Destination) {
  return labels[destination.kind];
}
export function destinationNote(destination: Destination) {
  if (destination.kind === 'book-details')
    return `Catalog/book information on ${new URL(destination.url).hostname}. This is not a purchase link.`;
  if (destination.kind === 'musicbrainz')
    return 'MusicBrainz catalog record — not a listening or playback link.';
  if (destination.kind === 'tmdb') return 'TMDB title information — not a streaming link.';
  if (['spotify', 'streaming'].includes(destination.kind))
    return 'External service; availability and access conditions may vary.';
  if (['bookstore', 'storefront'].includes(destination.kind))
    return 'External store page; price and availability are not verified by NOCTIS.';
  return 'Information or official source page — not a promise of purchase, streaming or playback.';
}

export function validateDestination(
  value: unknown,
  category: CategorySlug,
): Destination | undefined {
  if (!value || typeof value !== 'object') return;
  const candidate = value as Partial<Destination>;
  if (
    !candidate.kind ||
    !allowed[category].includes(candidate.kind) ||
    !['provider', 'curator'].includes(candidate.verifiedBy ?? '')
  )
    return;
  let provided = candidate.url;
  try {
    const parsed = new URL(provided ?? '');
    if (
      parsed.protocol === 'http:' &&
      [
        'open.spotify.com',
        'musicbrainz.org',
        'openlibrary.org',
        'www.themoviedb.org',
        'themoviedb.org',
      ].includes(parsed.hostname)
    ) {
      parsed.protocol = 'https:';
      provided = parsed.href;
    }
  } catch {
    return;
  }
  const safe = safeExternalUrl(provided);
  if (!safe) return;
  const url = new URL(safe);
  const knownKinds: Record<string, DestinationKind[]> = {
    'openlibrary.org': ['book-details'],
    'www.gutenberg.org': ['book-details'],
    'books.google.com': ['book-details'],
    'musicbrainz.org': ['musicbrainz'],
    'open.spotify.com': ['spotify'],
    'www.themoviedb.org': ['tmdb'],
    'themoviedb.org': ['tmdb'],
    'rawg.io': ['game-details'],
    'www.artic.edu': ['museum'],
  };
  if (knownKinds[url.hostname] && !knownKinds[url.hostname].includes(candidate.kind)) return;
  const specificGoogleBook =
    candidate.kind === 'book-details' &&
    url.hostname === 'books.google.com' &&
    url.pathname === '/books' &&
    !!url.searchParams.get('id');
  if (
    url.port ||
    (!specificGoogleBook &&
      [...url.searchParams.keys()].some((key) =>
        ['q', 'query', 'search', 'search_query'].includes(key),
      )) ||
    /\/(search|results)(\/|$)/i.test(url.pathname)
  )
    return;
  if (
    candidate.kind === 'spotify' &&
    (url.hostname !== 'open.spotify.com' ||
      !/^\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:album|track)\/[A-Za-z\d]{22}\/?$/i.test(
        url.pathname,
      ))
  )
    return;
  if (
    candidate.kind === 'musicbrainz' &&
    (url.hostname !== 'musicbrainz.org' ||
      !new RegExp(`^/(release-group|release|recording)/${uuid}/?$`, 'i').test(url.pathname))
  )
    return;
  if (
    candidate.kind === 'tmdb' &&
    (!['www.themoviedb.org', 'themoviedb.org'].includes(url.hostname) ||
      !/^\/(movie|tv)\/\d+(?:-[^/]+)?\/?$/.test(url.pathname))
  )
    return;
  return { kind: candidate.kind, url: safe, verifiedBy: candidate.verifiedBy! };
}

export function mergeDestinations(
  category: CategorySlug,
  ...groups: (unknown[] | undefined)[]
): Destination[] {
  const seen = new Set<string>();
  return groups
    .flatMap((group) => group ?? [])
    .flatMap((value) => {
      const valid = validateDestination(value, category);
      if (!valid) return [];
      const parsed = new URL(valid.url);
      const key = `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}${parsed.search}${parsed.hash}`;
      if (seen.has(key)) return [];
      seen.add(key);
      return [valid];
    });
}

function sourceDestination(work: Work): Destination | undefined {
  if (work.source.kind === 'demo') return;
  const source = work.source,
    url = safeExternalUrl(source.url);
  if (!url) return;
  const host = new URL(url).hostname;
  let kind: DestinationKind;
  switch (work.category) {
    case 'books':
      kind = 'book-details';
      break;
    case 'music':
      if (host !== 'musicbrainz.org' && source.provider !== 'brianeno') return;
      kind = host === 'musicbrainz.org' ? 'musicbrainz' : 'discography';
      break;
    case 'films':
      kind = ['www.themoviedb.org', 'themoviedb.org'].includes(host) ? 'tmdb' : 'film-details';
      break;
    case 'games':
      kind = ['thatgamecompany', 'camposanto'].includes(source.provider)
        ? 'official'
        : 'game-details';
      break;
    case 'photography':
      kind =
        source.provider === 'unsplash' &&
        host === 'unsplash.com' &&
        /^\/photos\/[^/]+/.test(new URL(url).pathname)
          ? 'photograph'
          : 'photo-context';
      break;
    case 'art':
      if (
        source.provider !== 'aic' ||
        host !== 'www.artic.edu' ||
        !/^\/artworks\/\d+/.test(new URL(url).pathname)
      )
        return;
      kind = 'museum';
      break;
  }
  return validateDestination(
    { kind, url, verifiedBy: source.kind === 'live' ? 'provider' : 'curator' },
    work.category,
  );
}

export function getDestinations(work: Work): Destination[] {
  if (work.source.kind === 'demo') return [];
  const fallback = sourceDestination(work);
  return mergeDestinations(work.category, work.destinations, fallback ? [fallback] : []).sort(
    (a, b) => allowed[work.category].indexOf(a.kind) - allowed[work.category].indexOf(b.kind),
  );
}

// Relações de URL do próprio registro, nunca URLs fabricadas a partir de título/autor.
export function musicDestinations(relations: unknown): Destination[] {
  if (!Array.isArray(relations)) return [];
  return mergeDestinations(
    'music',
    relations.flatMap((relation) => {
      if (!relation || typeof relation !== 'object') return [];
      const row = relation as Record<string, unknown>;
      if (
        row.ended === true ||
        !['streaming', 'free streaming', 'streaming music'].includes(String(row.type))
      )
        return [];
      const url =
        row.url && typeof row.url === 'object'
          ? (row.url as Record<string, unknown>).resource
          : undefined;
      return [{ kind: 'spotify', url, verifiedBy: 'provider' }];
    }),
  );
}

export function bookDestinations(links: unknown): Destination[] {
  if (!Array.isArray(links)) return [];
  return mergeDestinations(
    'books',
    links.flatMap((link) => {
      if (!link || typeof link !== 'object') return [];
      const url = safeExternalUrl((link as Record<string, unknown>).url);
      if (!url) return [];
      const parsed = new URL(url);
      if (
        ['www.amazon.com', 'amazon.com'].includes(parsed.hostname) &&
        /\/(?:dp|gp\/product)\/[A-Z\d]{10}(?:\/|$)/i.test(parsed.pathname)
      )
        return [{ kind: 'bookstore', url, verifiedBy: 'provider' }];
      if (
        parsed.hostname === 'books.google.com' &&
        parsed.pathname === '/books' &&
        parsed.searchParams.has('id')
      )
        return [{ kind: 'book-details', url, verifiedBy: 'provider' }];
      return []; // Uma resenha ou link sem tipo verificado não vira loja/editora por heurística.
    }),
  );
}
