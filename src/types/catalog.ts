export type CategorySlug = 'books' | 'films' | 'games' | 'music' | 'photography' | 'art';
export type Provider = 'openlibrary' | 'aic' | 'musicbrainz';
export type DestinationKind = 'spotify' | 'musicbrainz' | 'book-details' | 'publisher' | 'bookstore' | 'official' | 'storefront' | 'streaming' | 'distributor' | 'tmdb' | 'film-details' | 'game-details' | 'photograph' | 'photo-context' | 'museum' | 'discography';
export interface Destination { kind: DestinationKind; url: string; verifiedBy: 'provider' | 'curator' }
export type Source =
  | { kind: 'demo'; provider: 'noctis'; label: string }
  | { kind: 'curated' | 'live'; provider: string; externalId: string; label: string; url?: string; attribution: string };

export interface Work {
  id: string;
  legacyId?: string;
  category: CategorySlug;
  title: string;
  creator: string;
  year: number | null;
  date?: string;
  format: string;
  mood?: string;
  description: string;
  note: string;
  facts: [string, string][];
  palette: [string, string, string];
  tags: string[];
  source: Source;
  destinations?: Destination[];
  image?: { url: string; alt: string; credit: string; rights: string; sourceUrl: string; provider?: string; kind?: 'cover' | 'poster' | 'key-art' | 'photograph' | 'artwork'; width?: number; height?: number; thumbnailUrl?: string };
  mediaPreviews: { type: 'video' | 'audio'; url: string; rights: string; attribution: string }[];
}

export interface ProviderStatus {
  category: CategorySlug;
  label: string;
  state: 'ready' | 'unavailable' | 'error' | 'success';
  message: string;
}
export interface SearchResponse { items: Work[]; statuses: ProviderStatus[] }

