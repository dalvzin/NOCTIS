import type { Work } from '../types/catalog';
import { safeArtworkUrl } from './catalogUtils';
export type ArtworkContext = 'card' | 'preview' | 'detail' | 'thumbnail' | 'album';
type Image = NonNullable<Work['image']>;
const ratios = { books: 2 / 3, films: 2 / 3, games: 4 / 3, music: 1, photography: 4 / 3, art: 1 };

/** Only use variants returned by a provider or explicitly curated for this record. */
export function artworkUrls(image: Work['image'], context: ArtworkContext): string[] {
  if (!image) return [];
  const urls =
    context === 'detail' ? [image.url, image.thumbnailUrl] : [image.thumbnailUrl, image.url];
  return [...new Set(urls.map(safeArtworkUrl).filter((url): url is string => !!url))];
}
export function artworkRatio(work: Work): number {
  const { width, height } = artworkMetadata(work.image);
  return ['games', 'photography', 'art'].includes(work.category) && width && height
    ? Math.max(0.4, Math.min(2.5, width / height))
    : ratios[work.category];
}
/** Optional metadata is backward compatible and filtered before local persistence. */
export function artworkMetadata(image: Work['image']): Partial<Image> {
  if (!image) return {};
  const dimension = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 100000
      ? value
      : undefined;
  const kinds = ['cover', 'poster', 'key-art', 'photograph', 'artwork'];
  return {
    provider: typeof image.provider === 'string' ? image.provider.slice(0, 200) : undefined,
    kind: image.kind && kinds.includes(image.kind) ? image.kind : undefined,
    width: dimension(image.width),
    height: dimension(image.height),
    thumbnailUrl: safeArtworkUrl(image.thumbnailUrl) ?? undefined,
  };
}
