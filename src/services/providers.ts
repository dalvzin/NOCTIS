import type { CategorySlug, Provider, Work } from '../types/catalog.ts';
import { safeExternalUrl } from './catalogUtils.ts';
import { bookDestinations, musicDestinations } from './destinations.ts';

type JsonObject = Record<string, unknown>;
export function object(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}
export function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
function strings(value: unknown): string[] {
  return array(value).map(text).filter(Boolean).slice(0, 20);
}
function year(value: unknown): number | null {
  if ((typeof value !== 'number' && typeof value !== 'string') || !String(value).trim())
    return null;
  const n = Number(value);
  return Number.isInteger(n) && n > -5000 && n < 3000 ? n : null;
}
function plain(value: unknown) {
  return text(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3500);
}

function base(
  provider: Provider,
  category: CategorySlug,
  externalId: string,
  title: string,
  url: string,
): Work {
  return {
    id: `${provider}:${category}:${externalId}`,
    category,
    title,
    creator: 'Creator metadata unavailable',
    year: null,
    format: category === 'books' ? 'Book' : category === 'music' ? 'Release' : 'Artwork',
    description: 'A description is not available from this source.',
    note: '',
    facts: [],
    tags: [],
    source: {
      kind: 'live',
      provider,
      externalId,
      label:
        provider === 'aic'
          ? 'Art Institute of Chicago'
          : provider === 'openlibrary'
            ? 'Open Library'
            : 'MusicBrainz',
      url,
      attribution:
        provider === 'aic'
          ? 'Art Institute of Chicago API metadata. Description adapted to plain text (CC BY 4.0); image only when marked public domain.'
          : `Metadata provided by ${provider === 'openlibrary' ? 'Open Library' : 'MusicBrainz'}.`,
    },
    palette: ['#343d3b', '#c6b28e', '#172322'],
    mediaPreviews: [],
  };
}

export function normalizeOpenLibrary(value: unknown): Work | null {
  const row = object(value),
    key = text(row.key).replace('/works/', '');
  if (!/^OL\d+W$/.test(key) || !text(row.title)) return null;
  const work = base(
    'openlibrary',
    'books',
    key,
    text(row.title),
    `https://openlibrary.org/works/${key}`,
  );
  work.creator = strings(row.author_name).join(', ') || work.creator;
  work.year = year(row.first_publish_year);
  work.tags = strings(row.subject ?? row.subjects);
  work.facts = work.year === null ? [] : [['First published', String(work.year)]];
  const description =
    typeof row.description === 'object' ? object(row.description).value : row.description;
  if (text(description)) work.description = plain(description);
  if (Array.isArray(row.links)) work.destinations = bookDestinations(row.links);
  // A Covers API orienta o uso de hotlinks. A imagem não recebe uma licença CC
  // inventada: os direitos continuam com os titulares da capa.
  const coverId = Number(
    row.cover_i ?? array(row.covers).find((id) => Number.isSafeInteger(id) && Number(id) > 0),
  );
  const edition = /^OL\d+M$/.test(text(row.cover_edition_key)) ? text(row.cover_edition_key) : '';
  if (Number.isSafeInteger(coverId) && coverId > 0) {
    work.image = {
      url: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`,
      alt: `${work.title} — ${edition ? `cover of edition ${edition}` : 'source-selected cover; edition unspecified'}`,
      credit: `Open Library${edition ? ` · Edition ${edition}` : ' · Work-level cover; edition unspecified'}`,
      rights:
        'Cover copyright belongs to its respective rights holders. Displayed through Open Library Covers API.',
      sourceUrl: edition
        ? `https://openlibrary.org/books/${edition}`
        : `https://openlibrary.org/works/${key}`,
    };
    work.image.provider = 'Open Library';
    work.image.kind = 'cover';
    work.image.thumbnailUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
    if (edition) work.facts.push(['Cover edition', edition]);
  }
  return work;
}

export function normalizeAic(
  value: unknown,
  iiifBase = 'https://www.artic.edu/iiif/2',
): Work | null {
  const row = object(value),
    id = Number(row.id);
  if (!Number.isSafeInteger(id) || id <= 0 || !text(row.title)) return null;
  const work = base(
    'aic',
    'art',
    String(id),
    text(row.title),
    `https://www.artic.edu/artworks/${id}`,
  );
  work.creator = text(row.artist_title) || text(row.artist_display) || work.creator;
  work.year = year(row.date_start);
  work.date = text(row.date_display) || undefined;
  work.format = text(row.classification_title) || 'Artwork';
  work.description = plain(row.description) || work.description;
  work.tags = strings(row.style_titles);
  const medium = text(row.medium_display);
  if (medium) work.facts.push(['Medium', medium]);
  if (work.date) work.facts.push(['Date', work.date]);
  const imageId = text(row.image_id),
    baseUrl = safeExternalUrl(iiifBase);
  if (
    row.is_public_domain === true &&
    /^[a-f\d-]+$/i.test(imageId) &&
    baseUrl?.startsWith('https://www.artic.edu/iiif/')
  ) {
    work.image = {
      url: `${baseUrl.replace(/\/$/, '')}/${imageId}/full/843,/0/default.jpg`,
      alt: text(object(row.thumbnail).alt_text) || work.title,
      credit: `${work.creator} / Art Institute of Chicago`,
      rights: 'CC0 / public domain image',
      sourceUrl: work.source.kind === 'live' ? (work.source.url ?? '') : '',
    };
  }
  if (work.image) {
    work.image.provider = 'Art Institute of Chicago';
    work.image.kind = 'artwork';
    work.image.thumbnailUrl = `${baseUrl!.replace(/\/$/, '')}/${imageId}/full/400,/0/default.jpg`;
    const thumbnail = object(row.thumbnail);
    if (Number(thumbnail.width) > 0 && Number(thumbnail.height) > 0) {
      work.image.width = Number(thumbnail.width);
      work.image.height = Number(thumbnail.height);
    }
  }
  return work;
}

export function normalizeMusicBrainz(value: unknown): Work | null {
  const row = object(value),
    id = text(row.id);
  if (!/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id) || !text(row.title)) return null;
  const work = base(
    'musicbrainz',
    'music',
    id,
    text(row.title),
    `https://musicbrainz.org/release-group/${id}`,
  );
  work.creator =
    array(row['artist-credit'])
      .map((credit) => text(object(credit).name) + text(object(credit).joinphrase))
      .join('') || work.creator;
  work.date = text(row['first-release-date']) || undefined;
  work.year = work.date ? year(work.date.slice(0, 4)) : null;
  work.format = text(row['primary-type']) || 'Release group';
  work.tags = array(row.tags)
    .map((tag) => text(object(tag).name))
    .filter(Boolean)
    .slice(0, 20);
  if (Array.isArray(row.relations)) work.destinations = musicDestinations(row.relations);
  // A pesquisa MB não traz uma capa. O servidor consulta a CAA somente ao abrir
  // o detalhe e mantém a identificação da release e seus direitos de imagem.
  return work;
}

export function musicArtwork(value: unknown): Work['image'] {
  const row = object(value),
    releaseUrl = safeExternalUrl(row.release);
  const releaseId = releaseUrl?.match(
    /^https:\/\/musicbrainz.org\/release\/([a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})\/?$/i,
  )?.[1];
  if (!releaseId) return;
  for (const value of array(row.images)) {
    const image = object(value);
    if (image.front !== true || image.approved !== true) continue;
    const raw =
      text(object(image.thumbnails)['500']) ||
      text(object(image.thumbnails).large) ||
      text(image.image);
    // A API CAA pode retornar HTTP; só atualiza o protocolo do host oficial.
    const url = safeExternalUrl(
      raw.replace(/^http:\/\/coverartarchive.org\//, 'https://coverartarchive.org/'),
    );
    if (!url || !url.startsWith(`https://coverartarchive.org/release/${releaseId}/`)) continue;
    const small = safeExternalUrl(
      (text(object(image.thumbnails)['250']) || text(object(image.thumbnails).small)).replace(
        /^http:\/\/coverartarchive.org\//,
        'https://coverartarchive.org/',
      ),
    );
    return {
      provider: 'Cover Art Archive',
      kind: 'cover',
      thumbnailUrl: small?.startsWith(`https://coverartarchive.org/release/${releaseId}/`)
        ? small
        : undefined,
      url,
      alt: `Front cover of MusicBrainz release ${releaseId}`,
      credit: `Cover Art Archive · Release ${releaseId}`,
      rights:
        'Cover copyright belongs to its respective rights holders. Approved front cover from Cover Art Archive.',
      sourceUrl: releaseUrl!,
    };
  }
}

export const providerAdapters = {
  openlibrary: { category: 'books', normalize: normalizeOpenLibrary },
  aic: { category: 'art', normalize: normalizeAic },
  musicbrainz: { category: 'music', normalize: normalizeMusicBrainz },
} satisfies Record<
  Provider,
  { category: CategorySlug; normalize: (value: unknown) => Work | null }
>;

export function normalizeResponse(provider: Provider, payload: unknown): Work[] {
  const data = object(payload);
  const rows =
    provider === 'openlibrary'
      ? data.docs
      : provider === 'aic'
        ? data.data
        : data['release-groups'];
  if (!Array.isArray(rows)) throw new Error('Unexpected provider response');
  return rows
    .slice(0, 12)
    .map((row) =>
      provider === 'aic'
        ? normalizeAic(row, text(object(data.config).iiif_url) || undefined)
        : providerAdapters[provider].normalize(row),
    )
    .filter((work): work is Work => work !== null);
}
