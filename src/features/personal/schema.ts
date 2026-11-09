import { artworkMetadata } from '../../services/artwork';
import type { Work } from '../../types/catalog';
import { safeExternalUrl, safeArtworkUrl } from '../../services/catalogUtils';
import { mergeDestinations } from '../../services/destinations';
import type { ArchiveData } from './types';

export const STORAGE_KEY = 'noctis.personal.v1';
export const limits = {
  entries: 300,
  albums: 50,
  albumItems: 100,
  history: 100,
  characters: 2_000_000,
};
export function emptyArchive(): ArchiveData {
  return {
    version: 1,
    entries: {},
    albums: [],
    history: [],
    preferences: { historyEnabled: false, motion: 'system' },
  };
}
const categories = ['books', 'films', 'games', 'music', 'photography', 'art'];
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function str(value: unknown, max: number) {
  return typeof value === 'string' && value.length <= max;
}
function date(value: unknown) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}
function unique(values: unknown[]) {
  return new Set(values).size === values.length;
}
export function isRating(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && value >= 0.5 && value <= 5 && Number.isInteger(value * 2))
  );
}

export function compactWork(work: Work): Work {
  return {
    id: work.id,
    legacyId: work.legacyId,
    category: work.category,
    title: work.title.slice(0, 500),
    creator: work.creator.slice(0, 500),
    year: work.year,
    format: work.format.slice(0, 100),
    description: work.description.slice(0, 600),
    note: '',
    facts: work.facts.slice(0, 6).map(([key, value]) => [key.slice(0, 100), value.slice(0, 300)]),
    palette: work.palette,
    tags: work.tags.slice(0, 12).map((tag) => tag.slice(0, 100)),
    source:
      work.source.kind === 'demo'
        ? { kind: 'demo', provider: 'noctis', label: work.source.label.slice(0, 200) }
        : {
            kind: work.source.kind,
            provider: work.source.provider,
            externalId: work.source.externalId,
            label: work.source.label.slice(0, 200),
            url: safeExternalUrl(work.source.url),
            attribution: work.source.attribution.slice(0, 1500),
          },
    destinations: mergeDestinations(work.category, work.destinations).slice(0, 4),
    image:
      work.image && safeArtworkUrl(work.image.url) && safeExternalUrl(work.image.sourceUrl)
        ? {
            ...artworkMetadata(work.image),
            url: work.image.url,
            alt: work.image.alt.slice(0, 500),
            credit: work.image.credit.slice(0, 1000),
            rights: work.image.rights.slice(0, 500),
            sourceUrl: work.image.sourceUrl,
          }
        : undefined,
    mediaPreviews: [],
  };
}

function validWork(value: unknown): value is Work {
  if (
    !record(value) ||
    !str(value.id, 300) ||
    !new RegExp(`^[a-zA-Z0-9_-]+:(${categories.join('|')}):[a-zA-Z0-9_.:-]+$`).test(
      value.id as string,
    ) ||
    !categories.includes(String(value.category))
  )
    return false;
  if (
    !(value.id as string).startsWith(
      (value.id as string).split(':')[0] + ':' + value.category + ':',
    )
  )
    return false;
  if (
    !str(value.title, 500) ||
    !value.title ||
    !str(value.creator, 500) ||
    !str(value.format, 100) ||
    !str(value.description, 600) ||
    value.note !== ''
  )
    return false;
  if (value.year !== null && (typeof value.year !== 'number' || !Number.isInteger(value.year)))
    return false;
  if (
    value.legacyId !== undefined &&
    (typeof value.legacyId !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(value.legacyId))
  )
    return false;
  if (
    !Array.isArray(value.palette) ||
    value.palette.length !== 3 ||
    !value.palette.every((color) => typeof color === 'string' && /^#[a-f0-9]{6}$/i.test(color))
  )
    return false;
  if (
    !Array.isArray(value.tags) ||
    value.tags.length > 12 ||
    !value.tags.every((tag) => str(tag, 100))
  )
    return false;
  if (
    !Array.isArray(value.facts) ||
    value.facts.length > 6 ||
    !value.facts.every(
      (fact) => Array.isArray(fact) && fact.length === 2 && str(fact[0], 100) && str(fact[1], 300),
    )
  )
    return false;
  if (!Array.isArray(value.mediaPreviews) || value.mediaPreviews.length) return false;
  const source = value.source;
  if (
    !record(source) ||
    !['demo', 'curated', 'live'].includes(String(source.kind)) ||
    !str(source.label, 200) ||
    !str(source.provider, 100)
  )
    return false;
  if (
    source.kind !== 'demo' &&
    (!str(source.externalId, 300) ||
      !str(source.attribution, 1500) ||
      (source.url !== undefined && (!str(source.url, 3000) || !safeExternalUrl(source.url))))
  )
    return false;
  if (
    value.destinations !== undefined &&
    (!Array.isArray(value.destinations) ||
      value.destinations.length > 4 ||
      mergeDestinations(value.category as Work['category'], value.destinations).length !==
        value.destinations.length)
  )
    return false;
  if (value.image !== undefined) {
    if (
      !record(value.image) ||
      !str(value.image.url, 3000) ||
      !safeArtworkUrl(value.image.url) ||
      !str(value.image.sourceUrl, 3000) ||
      !safeExternalUrl(value.image.sourceUrl) ||
      !str(value.image.alt, 500) ||
      !str(value.image.credit, 1000) ||
      !str(value.image.rights, 500)
    )
      return false;
  }
  return true;
}

export function validateArchive(value: unknown): value is ArchiveData {
  if (
    !record(value) ||
    value.version !== 1 ||
    !record(value.entries) ||
    Object.keys(value.entries).length > limits.entries ||
    !Array.isArray(value.albums) ||
    value.albums.length > limits.albums ||
    !Array.isArray(value.history) ||
    value.history.length > limits.history
  )
    return false;
  const entries = value.entries;
  if (
    !Object.entries(entries).every(
      ([id, entry]) =>
        record(entry) &&
        validWork(entry.work) &&
        entry.work.id === id &&
        typeof entry.saved === 'boolean' &&
        typeof entry.wanted === 'boolean' &&
        isRating(entry.rating) &&
        date(entry.updatedAt),
    )
  )
    return false;
  if (!unique(value.albums.map((album) => (record(album) ? album.id : null)))) return false;
  for (const album of value.albums) {
    if (
      !record(album) ||
      !str(album.id, 100) ||
      !/^[a-zA-Z0-9_-]+$/.test(album.id as string) ||
      !str(album.title, 80) ||
      !(album.title as string).trim() ||
      !str(album.description, 1000) ||
      album.visibility !== 'private' ||
      !['bronze', 'sage', 'slate', 'rose'].includes(String(album.accent)) ||
      !['grid', 'editorial', 'list'].includes(String(album.layout)) ||
      !date(album.createdAt) ||
      !date(album.updatedAt)
    )
      return false;
    if (
      !Array.isArray(album.workIds) ||
      album.workIds.length > limits.albumItems ||
      !unique(album.workIds) ||
      !album.workIds.every((id) => typeof id === 'string' && Object.hasOwn(entries, id))
    )
      return false;
    if (!record(album.cover) || !['none', 'work', 'upload'].includes(String(album.cover.kind)))
      return false;
    if (album.cover.kind === 'work' && !album.workIds.includes(album.cover.workId)) return false;
    if (
      album.cover.kind === 'upload' &&
      (!str(album.cover.imageId, 100) || !/^[a-zA-Z0-9_-]+$/.test(album.cover.imageId as string))
    )
      return false;
  }
  if (
    !unique(value.history.map((item) => (record(item) ? item.id : null))) ||
    !value.history.every(
      (item) =>
        record(item) &&
        str(item.id, 100) &&
        typeof item.workId === 'string' &&
        Object.hasOwn(entries, item.workId) &&
        date(item.visitedAt),
    )
  )
    return false;
  return (
    record(value.preferences) &&
    typeof value.preferences.historyEnabled === 'boolean' &&
    ['system', 'reduce'].includes(String(value.preferences.motion))
  );
}

export function parseArchive(raw: string | null): ArchiveData {
  if (raw === null) return emptyArchive();
  if (raw.length > limits.characters)
    throw new Error('The local archive exceeds the supported size. Export it before resetting.');
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      'Local archive data is damaged. It has not been overwritten. Export or reset it in Settings.',
    );
  }
  if (record(value) && value.version !== 1)
    throw new Error('This archive version is not supported. Its data has not been overwritten.');
  if (!validateArchive(value))
    throw new Error(
      'Local archive data failed validation. It has not been overwritten. Export or reset it in Settings.',
    );
  return value;
}

export function pruneEntries(data: ArchiveData) {
  const used = new Set([
    ...data.albums.flatMap((album) => album.workIds),
    ...data.history.map((item) => item.workId),
  ]);
  for (const [id, entry] of Object.entries(data.entries))
    if (!entry.saved && !entry.wanted && entry.rating === null && !used.has(id))
      delete data.entries[id];
}
