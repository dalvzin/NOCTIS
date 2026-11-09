import type { Work } from '../types/catalog.ts';

export function safeExternalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {
    /* Campo inválido: não vira link. */
  }
}

export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function deduplicate(items: Work[]): Work[] {
  const ids = new Set<string>();
  const identities = new Set<string>();
  return items.filter((item) => {
    // Edições/provedores distintos da mesma obra são agrupados pela identidade editorial.
    const authorPrefix = normalizeText(item.creator.split(',')[0]) + ' s ';
    const normalizedTitle = normalizeText(item.title.split(/[:;]/)[0]);
    const title = normalizedTitle.startsWith(authorPrefix)
      ? normalizedTitle.slice(authorPrefix.length)
      : normalizedTitle;
    const surname = normalizeText(item.creator.split(',')[0]).split(' ').at(-1);
    const key = `${item.source.kind === 'demo' ? 'demo:' : ''}${item.category}:${title}:${surname}`;
    if (ids.has(item.id) || identities.has(key)) return false;
    ids.add(item.id);
    identities.add(key);
    return true;
  });
}

export function matchesQuery(work: Work, query: string) {
  const text = normalizeText([work.title, work.creator, work.description, ...work.tags].join(' '));
  return normalizeText(query)
    .split(' ')
    .filter(Boolean)
    .every((word) => text.includes(word));
}

export function filterWorks(items: Work[], params: URLSearchParams, query = '') {
  return items.filter(
    (item) =>
      matchesQuery(item, query) &&
      (!params.get('category') || params.get('category') === item.category) &&
      (!params.get('format') ||
        params.get('format') === 'All' ||
        item.format === params.get('format')) &&
      (!params.get('creator') ||
        normalizeText(item.creator).includes(normalizeText(params.get('creator')!))) &&
      (!params.get('tag') || item.tags.includes(params.get('tag')!)) &&
      (!params.get('year') ||
        (item.year !== null && Math.floor(item.year / 10) * 10 === Number(params.get('year')))) &&
      (!params.get('source') ||
        params.get('source') === 'all' ||
        (params.get('source') === 'demo'
          ? item.source.kind === 'demo'
          : item.source.kind !== 'demo')),
  );
}

export function validReturnTo(value: unknown, fallback: string) {
  if (typeof value !== 'string' || value.startsWith('//') || value.includes('\\')) return fallback;
  const path = value.split(/[?#]/)[0];
  return /^\/(books|films|games|music|photography|art|discover(?:\/after-hours)?|search|my-archive|albums\/[a-zA-Z0-9_-]+)$/.test(
    path,
  )
    ? value
    : fallback;
}

/** Only bundled artwork paths may be relative; external destinations remain HTTPS-only. */
export function safeArtworkUrl(value: unknown): string | undefined {
  return typeof value === 'string' && /^\/artworks\/[a-z0-9-]+\.jpg$/.test(value)
    ? value
    : safeExternalUrl(value);
}
