import { bundledArtwork } from './bundledArtwork';
import { historicalArtwork } from './historicalArtwork';
import { editorialArtwork } from './editorialArtwork';
import type { Work } from '../types/catalog';

// URLs extraídas das páginas de origem em 04/11/2026. Nunca buscar uma imagem
// genérica pelo título: a chave associa a imagem a este registro editorial.
export const curatedArtwork: Record<string, NonNullable<Work['image']>> = {
  'nasa:photography:earthrise': { ...historicalArtwork.earthrise, kind: 'photograph' },
  'loc:photography:sadie-pfeifer': { ...historicalArtwork['sadie-pfeifer'], kind: 'photograph' },
  'gutenberg:books:84': {
    provider: 'Project Gutenberg',
    kind: 'cover',
    width: 195,
    height: 300,
    url: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    alt: 'Frankenstein — cover of Project Gutenberg ebook 84',
    credit: 'Project Gutenberg · Ebook 84',
    rights:
      'Source ebook: public domain in the USA. Gutenberg ebook cover, not a commercial edition.',
    sourceUrl: 'https://www.gutenberg.org/ebooks/84',
  },
  'gutenberg:books:1342': {
    provider: 'Project Gutenberg',
    kind: 'cover',
    width: 192,
    height: 300,
    url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    alt: 'Pride and Prejudice — cover of Project Gutenberg ebook 1342',
    credit: 'Project Gutenberg · Ebook 1342',
    rights:
      'Source ebook: public domain in the USA. Gutenberg ebook cover, not a commercial edition.',
    sourceUrl: 'https://www.gutenberg.org/ebooks/1342',
  },
  'moma:films:299946': {
    kind: 'poster',
    provider: 'Wikimedia Commons',
    thumbnailUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg/500px-Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20241207212308',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg',
    alt: 'Metropolis — French theatrical poster by Boris Bilinski, 1927',
    credit: 'Boris Bilinski · Wikimedia Commons',
    rights: 'Public domain · PD-Art / PD-old-70, per source record. French 1927 poster.',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg',
  },
  'camposanto:games:firewatch': {
    url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/383870/41a7d0ff4c2dab4ed69c53c9a29c931e6f62948d/header.jpg?t=1755789801',
    provider: 'Campo Santo / Steam',
    kind: 'key-art',
    width: 460,
    height: 215,
    alt: 'Firewatch — official store key art',
    credit: 'Campo Santo / Panic · Official Firewatch media',
    rights: 'Official store key art. Copyright retained by Campo Santo / Panic.',
    sourceUrl: 'https://store.steampowered.com/app/383870/Firewatch/',
  },
  'thatgamecompany:games:journey': {
    provider: 'thatgamecompany',
    kind: 'key-art',
    width: 1175,
    height: 1175,
    url: 'https://thatgamecompany.com/wp-content/uploads/thatgamecompany-games-bg-journey.jpg',
    alt: 'Journey — official promotional artwork',
    credit: 'thatgamecompany · Official Journey page',
    rights: 'Official promotional artwork. Copyright retained by the respective rights holders.',
    sourceUrl: 'https://thatgamecompany.com/journey/',
  },
  'brianeno:music:ambient-2': {
    provider: 'Brian Eno official discography',
    kind: 'cover',
    width: 1080,
    height: 1080,
    url: 'https://imagedelivery.net/y8Uk2RiAwNIsFgf5GYjAnw/d8ae3b12-fe29-4431-cf17-10e14eed8800/covers',
    alt: 'Ambient 2 (The Plateaux of Mirror) — album artwork from the official discography',
    credit: 'Harold Budd / Brian Eno · Official discography',
    rights:
      'Release artwork; copyright retained by its respective rights holders. Edition unspecified by the artist discography.',
    sourceUrl: 'https://www.brian-eno.net/information',
  },
  'loc:photography:migrant-mother': {
    provider: 'Library of Congress',
    kind: 'photograph',
    width: 821,
    height: 1024,
    url: 'https://data.labs.loc.gov/free-to-use/data/2017762891_1.jpg',
    alt: 'Migrant Mother — Dorothea Lange, Nipomo, California, 1936',
    credit: 'Dorothea Lange · Library of Congress, item 2017762891',
    rights: 'No known restrictions · Library of Congress Free to Use and Reuse collection.',
    sourceUrl: 'https://www.loc.gov/item/2017762891/',
  },
};

// Keep catalog identifiers stable; only the display source changes.
const localImages: Record<string, keyof typeof bundledArtwork> = {
  'gutenberg:books:84': 'book-84',
  'gutenberg:books:1342': 'book-1342',
  'gutenberg:books:345': 'book-345',
  'moma:films:299946': 'metropolis',
  'commons:films:sherlock-jr': 'sherlock-jr',
  'commons:films:trip-moon': 'trip-moon',
  'aic:art:27992': 'grande-jatte',
  'aic:art:28560': 'bedroom',
  'aic:art:20684': 'paris-rain',
  'commons:photography:steerage': 'steerage',
};
for (const [id, key] of Object.entries(localImages))
  curatedArtwork[id] = {
    ...bundledArtwork[key],
    alt: {
      bedroom: 'The Bedroom — 1889 Chicago version',
      'grande-jatte': 'A Sunday on La Grande Jatte — Georges Seurat',
      'paris-rain': 'Paris Street; Rainy Day — Gustave Caillebotte',
      'book-84': 'Frankenstein — cover of Project Gutenberg ebook 84',
      'book-1342': 'Pride and Prejudice — cover of Project Gutenberg ebook 1342',
      'book-345': 'Dracula — cover of Project Gutenberg ebook 345',
      steerage: 'The Steerage — Alfred Stieglitz, 1907',
      'sherlock-jr': 'Sherlock Jr. — original 1924 poster',
      'trip-moon': 'A Trip to the Moon — original 1902 poster',
      metropolis: 'Metropolis — French theatrical poster by Boris Bilinski, 1927',
    }[key],
  };
curatedArtwork['playdead:games:inside'] = {
  url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304430/31203c10b21261375ba74d5a489f1c7f57d30326/capsule_616x353.jpg?t=1761819581',
  alt: 'INSIDE — official store artwork',
  credit: 'Playdead / Steam',
  rights:
    'Official promotional artwork. Copyright retained by Playdead and its respective rights holders.',
  sourceUrl: 'https://store.steampowered.com/app/304430/INSIDE/',
  kind: 'key-art',
  width: 616,
  height: 353,
};
curatedArtwork['brianeno:music:apollo'] = {
  url: 'https://imagedelivery.net/y8Uk2RiAwNIsFgf5GYjAnw/fccb90dd-2c62-4f37-e3c9-050eac33c500/covers',
  alt: 'Apollo: Atmospheres & Soundtracks — release artwork',
  credit: 'Brian Eno / Daniel Lanois / Roger Eno · Artist discography',
  rights:
    'Release artwork; copyright retained by its owners. Edition unspecified by artist discography.',
  sourceUrl: 'https://www.brian-eno.net/information',
  kind: 'cover',
};
curatedArtwork['brianeno:music:another-green-world'] = {
  url: 'https://imagedelivery.net/y8Uk2RiAwNIsFgf5GYjAnw/f8b871bc-34ac-4237-92e3-49136566b700/covers',
  alt: 'Another Green World — release artwork',
  credit: 'Brian Eno · Artist discography',
  rights:
    'Release artwork; copyright retained by its owners. Edition unspecified by artist discography.',
  sourceUrl: 'https://www.brian-eno.net/information',
  kind: 'cover',
};

// Preserve record identity while serving verified editorial reproductions locally.
Object.assign(curatedArtwork, editorialArtwork);
