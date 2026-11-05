import { works, workPath } from '../data/works';
import { curatedWorks } from '../data/curated';
import { rooms } from '../data/rooms';
import type { SearchResponse, Work, ProviderStatus, CategorySlug } from '../types/catalog';
import { deduplicate, matchesQuery, safeExternalUrl } from './catalogUtils';
import { mergeDestinations } from './destinations';

export const localCatalog = [...curatedWorks, ...works];
const known = new Map(localCatalog.map(work => [work.id, work]));
const searchCache = new Map<string, { expires: number; result: SearchResponse }>();
let statuses: { expires: number; values: ProviderStatus[] } | undefined;

export function isWork(value: unknown): value is Work {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<Work>;
  const imageValid = row.image === undefined || (!!row.image && !!safeExternalUrl(row.image.url) && !!safeExternalUrl(row.image.sourceUrl) && ['alt', 'credit', 'rights'].every(key => typeof row.image?.[key as 'alt'] === 'string'));
  return imageValid && typeof row.id === 'string' && typeof row.title === 'string' && typeof row.creator === 'string'
    && rooms.some(room => room.slug === row.category) && (row.year === null || typeof row.year === 'number')
    && typeof row.format === 'string' && typeof row.description === 'string' && typeof row.note === 'string'
    && Array.isArray(row.tags) && row.tags.every(tag => typeof tag === 'string')
    && Array.isArray(row.facts) && row.facts.every(fact => Array.isArray(fact) && fact.length === 2 && fact.every(v => typeof v === 'string'))
    && Array.isArray(row.palette) && row.palette.length === 3 && row.palette.every(v => typeof v === 'string')
    && Array.isArray(row.mediaPreviews) && !!row.source && row.source.kind === 'live'
    && (row.source.url === undefined || typeof row.source.url === 'string') && typeof row.source.label === 'string' && typeof row.source.attribution === 'string';
}

function validStatuses(value: unknown): value is ProviderStatus[] {
  return Array.isArray(value) && value.every(status => status && rooms.some(room => room.slug === status.category) && typeof status.label === 'string' && typeof status.message === 'string' && ['ready', 'unavailable', 'error', 'success'].includes(status.state));
}

function requestSignal(signal?: AbortSignal) { return signal ? AbortSignal.any([signal, AbortSignal.timeout(11000)]) : AbortSignal.timeout(11000); }

export function findKnown(category: string, id: string) {
  return [...known.values()].find(work => work.category === category && (work.id === id || work.legacyId === id));
}

export function withKnownArtwork(work: Work): Work {
  const knownImage = findKnown(work.category, work.id)?.image;
  if (!work.image && knownImage) return { ...work, image:knownImage };
  return work.image && knownImage?.url === work.image.url ? { ...work, image:{ ...knownImage, ...work.image } } : work;
}

function remember(item: Work) {
  const previous = known.get(item.id);
  // Ausente = resposta resumida; [] = lista completa sem destinos válidos.
  const destinations = item.destinations === undefined ? previous?.destinations : item.destinations;
  const source = item.source.kind !== 'demo' && previous?.source.kind !== 'demo' && previous?.source && item.source.provider === previous.source.provider && item.source.externalId === previous.source.externalId && item.source.url === undefined
    ? { ...item.source, url: previous.source.url } : item.source;
  // Book summaries and MusicBrainz searches omit artwork fields. Museum
  // omissions must not restore an image whose rights may have changed.
  const keepArtwork = (item.category === 'books' && item.source.provider === 'openlibrary') || (item.category === 'music' && item.source.provider === 'musicbrainz');
  const image = item.image ?? (keepArtwork ? previous?.image : undefined);
  const normalized = { ...item, image, source, destinations: mergeDestinations(item.category, Array.isArray(destinations) ? destinations : []) };
  known.set(item.id, normalized);
  if (known.size > 200) { const key = [...known.keys()].find(id => !localCatalog.some(work => work.id === id)); if (key) known.delete(key); }
  return normalized;
}

function offlineStatuses(category = ''): ProviderStatus[] {
  return rooms.filter(room => !category || room.slug === category).map(room => ({ category: room.slug as CategorySlug, label: room.category, state: 'error', message: 'External catalog service is unavailable. Showing matching local records only.' }));
}

export function localSearch(query: string, category = '') {
  return localCatalog.filter(work => (!category || work.category === category) && matchesQuery(work, query));
}

export async function searchCatalog(query: string, category = '', signal?: AbortSignal): Promise<SearchResponse> {
  const q = query.trim().slice(0, 120), key = `${category}|${q.toLowerCase()}`;
  const hit = searchCache.get(key);
  if (hit && hit.expires > Date.now()) return { ...hit.result, items: hit.result.items.map(item => known.get(item.id) ?? item) };
  const local = localSearch(q, category);
  try {
    if (q.length < 2) {
      if (!statuses || statuses.expires < Date.now()) {
        const response = await fetch('/api/catalog/status', { signal: requestSignal(signal) });
        if (!response.ok) throw new Error('Status unavailable');
        const payload: unknown = await response.json();
        if (!validStatuses(payload)) throw new Error('Invalid status');
        statuses = { expires: Date.now() + 30000, values: payload };
      }
      return { items: local, statuses: statuses.values.filter(status => !category || status.category === category) };
    }
    const response = await fetch(`/api/catalog/search?${new URLSearchParams({ q, category })}`, { signal: requestSignal(signal) });
    if (!response.ok) throw new Error('Search unavailable');
    const payload: unknown = await response.json();
    const result = payload as Partial<SearchResponse>;
    if (!Array.isArray(result?.items) || !validStatuses(result.statuses)) throw new Error('Invalid search');
    const external = result.items.filter(isWork).map(remember);
    const merged = { items: deduplicate([...local, ...external]), statuses: result.statuses };
    if (!merged.statuses.some(status => status.state === 'error')) {
      searchCache.set(key, { expires: Date.now() + 300000, result: merged });
      if (searchCache.size > 40) searchCache.delete(searchCache.keys().next().value!);
    }
    return merged;
  } catch (error) {
    if (signal?.aborted) throw error;
    return { items: local, statuses: offlineStatuses(category) };
  }
}

export async function fetchWork(category: string, id: string, signal?: AbortSignal, refresh = false): Promise<Work | null> {
  const existing = findKnown(category, id);
  if (existing && !refresh) return existing;
  const match = id.match(/^(openlibrary|aic|musicbrainz):(books|art|music):([a-zA-Z\d-]+)$/);
  if (!match || match[2] !== category || ({ openlibrary: 'books', aic: 'art', musicbrainz: 'music' }[match[1]] !== category)) return null;
  const response = await fetch(`/api/catalog/item/${match[1]}/${match[3]}`, { signal: requestSignal(signal) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The source could not be reached.');
  const payload: unknown = await response.json();
  const item = (payload as { item?: unknown })?.item;
  if (!isWork(item) || item.id !== id || item.category !== category) throw new Error('The source returned an incomplete record.');
  // O detalhe de uma obra OL não identifica uma edição. Mantém a edição cuja
  // capa foi selecionada pela busca, em vez de trocá-la por outra ao abrir a ficha.
  const editionImage = existing?.image?.sourceUrl.startsWith('https://openlibrary.org/books/') && item.source.provider === 'openlibrary' && !item.image?.sourceUrl.startsWith('https://openlibrary.org/books/') ? existing.image : undefined;
  const enriched = existing ? { ...item, image: editionImage ?? item.image ?? (item.category === 'music' && item.source.provider === 'musicbrainz' ? existing.image : undefined), creator: item.creator === 'Creator metadata unavailable' ? existing.creator : item.creator, year: item.year ?? existing.year, tags: item.tags.length ? item.tags : existing.tags } : item;
  return remember(enriched);
}

export function knownPageTitle(pathname: string) { return [...known.values()].find(work => workPath(work) === pathname)?.title; }
export function clearCatalogCache() { searchCache.clear(); statuses = undefined; }

