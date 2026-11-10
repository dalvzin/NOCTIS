import type { Work } from '../types/catalog';

// Provenance and download URLs: public/artworks/sources.json.
export const historicalArtwork = {
  'after-hours-city': {
    url: '/artworks/after-hours-city.jpg',
    width: 560,
    height: 391,
    sourceUrl: 'https://www.loc.gov/pictures/item/gsc1994017109/PP/',
    credit: 'Samuel H. Gottscho / Gottscho-Schleisner collection · Library of Congress, 1933',
    rights:
      'No known restrictions on publication; public-domain dedication identified by Wikimedia Commons.',
    alt: 'New York city views — illuminated streets photographed by Samuel H. Gottscho, 1933',
  },
  earthrise: {
    url: '/artworks/earthrise.jpg',
    thumbnailUrl: '/artworks/earthrise-card.jpg',
    width: 1200,
    height: 1200,
    sourceUrl: 'https://science.nasa.gov/resource/the-rising-earth-as-seen-by-apollo-8/',
    credit: 'William Anders / NASA · Apollo 8, AS08-14-2383',
    rights:
      'NASA imagery for educational/informational use; NASA credit required. No endorsement implied.',
    alt: 'Earthrise — William Anders, Apollo 8, 24 December 1968',
  },
  'sadie-pfeifer': {
    url: '/artworks/sadie-pfeifer.jpg',
    thumbnailUrl: '/artworks/sadie-pfeifer-card.jpg',
    width: 1280,
    height: 915,
    sourceUrl: 'https://www.loc.gov/item/2018674894/',
    credit: 'Lewis Hine / National Child Labor Committee collection · Library of Congress',
    rights:
      'No known restrictions on publication, per Library of Congress; public-domain reproduction via Wikimedia Commons.',
    alt: 'Sadie Pfeifer at Lancaster Cotton Mills — Lewis Hine, 1908',
  },
  'new-york-night': {
    url: '/artworks/new-york-night.jpg',
    thumbnailUrl: '/artworks/new-york-night-card.jpg',
    width: 1280,
    height: 988,
    sourceUrl: 'https://www.loc.gov/item/2011630645/',
    credit: 'Carol M. Highsmith / Library of Congress',
    rights:
      'No known restrictions on publication; Highsmith photograph dedicated to the public via Library of Congress.',
    alt: 'Empire State Building at night, viewed from the World Trade Center in the 1980s — Carol M. Highsmith',
  },
} satisfies Record<string, NonNullable<Work['image']>>;
