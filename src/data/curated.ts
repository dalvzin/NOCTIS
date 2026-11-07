import type { Destination, Work } from '../types/catalog';
import { readingNotes } from './editorialPaths';
import { editorialAdditions } from './editorialAdditions';
import { curatedArtwork } from './artwork';

// URLs conferidas nas páginas oficiais em 04/11/2026; não são resultados de busca.
const verifiedDestinations: Record<string, Destination[]> = {
  'moma:films:299946': [{ kind: 'tmdb', url: 'https://www.themoviedb.org/movie/19-metropolis', verifiedBy: 'curator' }],
  'brianeno:music:ambient-2': [{ kind: 'musicbrainz', url: 'https://musicbrainz.org/release/4395aa9b-c167-404f-b941-2c18fde490d7', verifiedBy: 'curator' }],
  'loc:photography:migrant-mother': [{ kind: 'photograph', url: 'https://www.loc.gov/item/2017762891/', verifiedBy: 'curator' }],
};

export type RecordInput = Pick<Work, 'category' | 'title' | 'creator' | 'year' | 'format' | 'description' | 'tags'> & { key: string; provider: string; url: string; credit: string; facts?: [string, string][]; imageId?: string };
const records: RecordInput[] = [
  { key: '1342', category: 'books', provider: 'gutenberg', title: 'Pride and Prejudice', creator: 'Jane Austen', year: 1813, format: 'Novel', description: 'A novel of first impressions, family expectations and the difficult art of understanding another person.', tags: ['Fiction', 'Society'], url: 'https://www.gutenberg.org/ebooks/1342', credit: 'Bibliographic facts: Project Gutenberg. Summary: NOCTIS editorial.' },
  { key: '84', category: 'books', provider: 'gutenberg', title: 'Frankenstein', creator: 'Mary Wollstonecraft Shelley', year: 1818, format: 'Novel', description: 'Creation and responsibility meet in a story that asks what we owe to the lives we bring into the world.', tags: ['Gothic', 'Science fiction'], url: 'https://www.gutenberg.org/ebooks/84', credit: 'Bibliographic facts: Project Gutenberg. Summary: NOCTIS editorial.' },
  { key: '299946', category: 'films', provider: 'moma', title: 'Metropolis', creator: 'Fritz Lang', year: 1927, format: 'Film', description: 'A city divided between power and labor becomes a monumental vision of the future.', tags: ['Science fiction', 'Architecture'], url: 'https://www.moma.org/collection/works/299946', credit: 'Film metadata: The Museum of Modern Art. Summary: NOCTIS editorial.' },
  { key: 'journey', category: 'games', provider: 'thatgamecompany', title: 'Journey', creator: 'thatgamecompany', year: 2012, format: 'Game', description: 'An invitation to cross an unfamiliar landscape, where movement and companionship become a language of their own.', tags: ['Exploration', 'Landscape'], url: 'https://thatgamecompany.com/journey/', credit: 'Metadata: thatgamecompany; release year verified against PlayStation Blog, 16 February 2012.', facts: [['Original platform', 'PlayStation 3']] },
  { key: 'firewatch', category: 'games', provider: 'camposanto', title: 'Firewatch', creator: 'Campo Santo', year: 2016, format: 'Game', description: 'A narrative game set in a wilderness that feels expansive, intimate and uneasy at once.', tags: ['Narrative', 'Landscape'], url: 'https://www.firewatchgame.com/', credit: 'Metadata: Campo Santo, About. Summary: NOCTIS editorial.' },
  { key: 'ambient-2', category: 'music', provider: 'brianeno', title: 'Ambient 2 (The Plateaux of Mirror)', creator: 'Harold Budd / Brian Eno', year: 1980, format: 'Album', description: 'A collaborative ambient record that invites attention to drift between musical space and the space around the listener.', tags: ['Ambient', 'Space'], url: 'https://www.brian-eno.net/information', credit: 'Discography metadata: Brian Eno, Information. Summary: NOCTIS editorial.' },
  { key: 'migrant-mother', category: 'photography', provider: 'loc', title: 'Migrant Mother', creator: 'Dorothea Lange', year: 1936, format: 'Photograph', description: 'A portrait made in Nipomo, California, in March 1936. Explore the Library of Congress guide for its context and the surrounding photographic series.', tags: ['Documentary', 'Portrait'], url: 'https://guides.loc.gov/migrant-mother', credit: 'Metadata and photograph: Dorothea Lange / Library of Congress, item 2017762891. No known restrictions.' },
  { key: '27992', category: 'art', provider: 'aic', title: 'A Sunday on La Grande Jatte — 1884', creator: 'Georges Seurat', year: 1884, format: 'Painting', description: 'A monumental park scene to explore through distance, color and the patient act of looking.', tags: ['Painting', 'Landscape'], url: 'https://www.artic.edu/artworks/27992', credit: 'Art Institute of Chicago. Bibliographic metadata adapted from its API; summary: NOCTIS editorial. Public-domain reproduction via Wikimedia Commons; see image credit.', imageId: '2d484387-2509-5e8e-2c43-22f9981972eb', facts: [['Date', '1884–86; border added 1888–89']] },
  { key: '28560', category: 'art', provider: 'aic', title: 'The Bedroom', creator: 'Vincent van Gogh', year: 1889, format: 'Painting', description: 'A familiar room becomes a study of color and the emotional life of an interior.', tags: ['Painting', 'Interiors'], url: 'https://www.artic.edu/artworks/28560', credit: 'Art Institute of Chicago. Bibliographic metadata adapted from its API; summary: NOCTIS editorial. Public-domain reproduction via Wikimedia Commons; see image credit.', imageId: '6644829f-f292-c5c4-a73c-0356a6fdbf0d', facts: [['Medium', 'Oil on canvas']] },
];

export const curatedWorks: Work[] = [...records, ...editorialAdditions].map(record => ({
  ...record,
  id: `${record.provider}:${record.category}:${record.key}`,
  destinations: verifiedDestinations[`${record.provider}:${record.category}:${record.key}`],
  source: { kind: 'curated', provider: record.provider, externalId: record.key, label: record.provider === 'aic' ? 'Art Institute of Chicago' : record.credit.split('.')[0].replace(/.*?: /, ''), url: record.url, attribution: record.credit },
  note: readingNotes[`${record.provider}:${record.category}:${record.key}`] ?? 'A handpicked starting point. Take a moment to notice how this work makes a place for its viewer.',
  facts: record.facts ?? [],
  palette: ['#343d3b', '#c6b28e', '#172322'],
  mediaPreviews: [],
  image: curatedArtwork[`${record.provider}:${record.category}:${record.key}`] ?? (record.imageId ? { provider:'Art Institute of Chicago', kind:'artwork', thumbnailUrl:`https://www.artic.edu/iiif/2/${record.imageId}/full/400,/0/default.jpg`, url: `https://www.artic.edu/iiif/2/${record.imageId}/full/843,/0/default.jpg`, alt: record.title, credit: `${record.creator} / Art Institute of Chicago`, rights: 'CC0 / public domain image', sourceUrl: record.url } : undefined),
}));

export const editorialCollections = [
  { id: 'inhabited-spaces', title: 'The spaces we inhabit', description: 'Metropolis builds a city, Firewatch offers a retreat, and The Bedroom asks what makes a room feel like home.', ids: ['moma:films:299946', 'camposanto:games:firewatch', 'aic:art:28560'] },
  { id: 'beyond-the-familiar', title: 'Beyond the familiar', description: 'Frankenstein, Journey and Ambient 2 turn an unfamiliar world into a voice, a path and a space to listen.', ids: ['gutenberg:books:84', 'thatgamecompany:games:journey', 'brianeno:music:ambient-2'] },
];

