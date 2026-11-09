import type { Work } from '../types/catalog';
export type { Work, CategorySlug } from '../types/catalog';

// Obras e autores fictícios: dados editoriais originais para testar a experiência.
const demoRecords: Omit<Work, 'source' | 'tags' | 'mediaPreviews'>[] = [
  {
    id: 'atlas-of-silence',
    category: 'books',
    title: 'An Atlas of Silence',
    creator: 'Elena Vale',
    year: 2024,
    format: 'Novel',
    mood: 'Reflective',
    description:
      'A mapmaker returns to an island where every abandoned house holds an unfinished story. As she draws its disappearing paths, she begins to question what a map can preserve.',
    note: 'An imagined novel about memory, belonging and the spaces between words. Begin with the idea that a place can remember us, too.',
    facts: [
      ['Length', '284 pages'],
      ['Language', 'English'],
    ],
    palette: ['#273b3a', '#bdab84', '#192526'],
  },
  {
    id: 'nocturnal-margins',
    category: 'books',
    title: 'Nocturnal Margins',
    creator: 'Theo Ash',
    year: 2022,
    format: 'Poetry',
    mood: 'Mysterious',
    description:
      'Fragments gathered during walks through a sleeping city: an unlit window, the last train, a name half erased from a door. Each poem leaves room for the reader’s own night.',
    note: 'An imagined collection that treats silence as punctuation. A small companion for reading slowly.',
    facts: [
      ['Length', '96 pages'],
      ['Language', 'English'],
    ],
    palette: ['#302832', '#baa0aa', '#18151e'],
  },
  {
    id: 'a-field-guide-to-light',
    category: 'books',
    title: 'A Field Guide to Light',
    creator: 'Mira North',
    year: 2025,
    format: 'Essays',
    mood: 'Expansive',
    description:
      'A series of personal essays following daylight across studios, train stations and distant coastlines. Observation becomes a practice of attention rather than a search for answers.',
    note: 'An invented essay collection connecting ordinary places through the changing light that falls upon them.',
    facts: [
      ['Length', '192 pages'],
      ['Language', 'English'],
    ],
    palette: ['#514532', '#dbca9e', '#292820'],
  },
  {
    id: 'after-the-last-train',
    category: 'films',
    title: 'After the Last Train',
    creator: 'Rowan Ellis',
    year: 2023,
    format: 'Film',
    mood: 'Reflective',
    description:
      'Two strangers miss the final train and spend a night crossing a city on foot. A quiet conversation becomes a portrait of all the lives a person might have lived.',
    note: 'A fictional feature imagined in long takes and muted greens. No film or trailer is available; this record demonstrates the archive.',
    facts: [
      ['Runtime', '108 minutes'],
      ['Language', 'English'],
    ],
    palette: ['#29453c', '#b6bea1', '#101f20'],
  },
  {
    id: 'signal-from-room-nine',
    category: 'films',
    title: 'Signal from Room Nine',
    creator: 'Nadia Wren',
    year: 2024,
    format: 'Series',
    mood: 'Mysterious',
    description:
      'An archivist receives broadcasts from a hotel that closed thirty years ago. Each episode follows one room and a voice that refuses to disappear.',
    note: 'An imagined limited series about the fragile boundary between recorded memory and living experience.',
    facts: [
      ['Episodes', '6 × 45 minutes'],
      ['Language', 'English'],
    ],
    palette: ['#40382d', '#c7b28c', '#151c1d'],
  },
  {
    id: 'the-long-tide',
    category: 'films',
    title: 'The Long Tide',
    creator: 'Alex Sen',
    year: 2025,
    format: 'Film',
    mood: 'Expansive',
    description:
      'A coastal observatory follows one tide through the voices of people whose lives depend on it. Sea, weather and human routines become a single patient rhythm.',
    note: 'An invented documentary concept, selected for its imagined sense of scale and stillness.',
    facts: [
      ['Runtime', '84 minutes'],
      ['Language', 'English'],
    ],
    palette: ['#314348', '#c5c5b0', '#162c33'],
  },
  {
    id: 'echoes-of-orbit',
    category: 'games',
    title: 'Echoes of Orbit',
    creator: 'Quiet Circuit',
    year: 2024,
    format: 'Exploration',
    mood: 'Expansive',
    description:
      'Explore an abandoned orbital garden through radio signals and traces of botanical experiments. There is no countdown: the station rewards curiosity and patient observation.',
    note: 'A fictional game concept. This is a cultural record demonstration, not a playable game or storefront.',
    facts: [
      ['Platform', 'PC · conceptual'],
      ['Mode', 'Single player'],
    ],
    palette: ['#343347', '#b4add0', '#141622'],
  },
  {
    id: 'the-lantern-protocol',
    category: 'games',
    title: 'The Lantern Protocol',
    creator: 'Pale Signal',
    year: 2023,
    format: 'Puzzle',
    mood: 'Mysterious',
    description:
      'Restore a network of lanterns in a subterranean city. Each puzzle changes the meaning of a message carried from district to district.',
    note: 'An imagined puzzle experience built around light, interpretation and unreliable instructions.',
    facts: [
      ['Platform', 'PC · conceptual'],
      ['Mode', 'Single player'],
    ],
    palette: ['#263b3c', '#a8c6b4', '#121c24'],
  },
  {
    id: 'a-season-without-maps',
    category: 'games',
    title: 'A Season Without Maps',
    creator: 'Soft Terrain',
    year: 2025,
    format: 'Exploration',
    mood: 'Reflective',
    description:
      'Walk through a valley that changes with your memory of it. Landmarks appear through conversations, sketches and the routes you choose to repeat.',
    note: 'A fictional exploration game about getting to know a place without needing to complete it.',
    facts: [
      ['Platform', 'PC · conceptual'],
      ['Mode', 'Single player'],
    ],
    palette: ['#3c3940', '#bfb294', '#1e2029'],
  },
  {
    id: 'rooms-for-rain',
    category: 'music',
    title: 'Rooms for Rain',
    creator: 'Low Window',
    year: 2024,
    format: 'Album',
    mood: 'Reflective',
    description:
      'An imagined sequence of soft piano, distant tape textures and the rhythm of weather against glass. Each piece suggests a room occupied only for an afternoon.',
    note: 'A fictional album record. No audio files or playback controls are provided in this stage.',
    facts: [
      ['Duration', '42 minutes'],
      ['Tracks', '9'],
    ],
    palette: ['#3b403d', '#c6c1a8', '#202726'],
  },
  {
    id: 'the-bronze-hour',
    category: 'music',
    title: 'The Bronze Hour',
    creator: 'Ada Sol',
    year: 2022,
    format: 'EP',
    mood: 'Mysterious',
    description:
      'Slow percussion, bowed metal and a voice treated as an instrument. A collection that imagines twilight as a material with its own weight and resonance.',
    note: 'An invented release exploring the space between acoustic sound and an electronic afterimage.',
    facts: [
      ['Duration', '23 minutes'],
      ['Tracks', '5'],
    ],
    palette: ['#513d30', '#d4b183', '#261c1c'],
  },
  {
    id: 'open-water-frequencies',
    category: 'music',
    title: 'Open Water Frequencies',
    creator: 'Northern Relay',
    year: 2025,
    format: 'Album',
    mood: 'Expansive',
    description:
      'Layers of sustained tones move like currents beneath small melodic signals. An imagined record for the sensation of looking beyond a visible horizon.',
    note: 'A fictional ambient album, presented as metadata rather than a streaming player.',
    facts: [
      ['Duration', '51 minutes'],
      ['Tracks', '7'],
    ],
    palette: ['#2b4047', '#acc9c8', '#17232d'],
  },
  {
    id: 'a-window-left-open',
    category: 'photography',
    title: 'A Window Left Open',
    creator: 'Iris Reed',
    year: 2023,
    format: 'Series',
    mood: 'Reflective',
    description:
      'An imagined sequence of windows photographed from the street at the first light of morning. Interiors remain unseen; a curtain or plant becomes a suggestion of life.',
    note: 'Original geometric illustrations stand in for this fictional photographic series. They are not photographs by a real artist.',
    facts: [
      ['Process', '35mm film · conceptual'],
      ['Collection', '12 frames'],
    ],
    palette: ['#4b4b42', '#d6cfb5', '#222f30'],
  },
  {
    id: 'latent-city',
    category: 'photography',
    title: 'Latent City',
    creator: 'Leon Moss',
    year: 2024,
    format: 'Single image',
    mood: 'Mysterious',
    description:
      'A stairway seen through an imperfect reflection. Two spaces occupy the same plane, leaving the viewer to decide where the photograph begins.',
    note: 'An invented photographic work represented by an original abstract composition for this demo.',
    facts: [
      ['Process', 'Silver gelatin · conceptual'],
      ['Dimensions', '40 × 60 cm'],
    ],
    palette: ['#383b3b', '#b6b7ad', '#141c1f'],
  },
  {
    id: 'the-shape-of-distance',
    category: 'photography',
    title: 'The Shape of Distance',
    creator: 'June Arden',
    year: 2025,
    format: 'Series',
    mood: 'Expansive',
    description:
      'An imagined coastal survey in which the horizon is the only constant. Weather reduces buildings and people to temporary marks in a larger field.',
    note: 'A fictional series for exploring the Darkroom. All displayed imagery is an original vector study.',
    facts: [
      ['Process', 'Digital · conceptual'],
      ['Collection', '8 frames'],
    ],
    palette: ['#45535a', '#c7d0c9', '#26343b'],
  },
  {
    id: 'a-study-in-absence',
    category: 'art',
    title: 'A Study in Absence',
    creator: 'Cora Venn',
    year: 2024,
    format: 'Painting',
    mood: 'Reflective',
    description:
      'A field of warm pigment surrounds the outline of a vessel that is no longer there. The work imagines absence as a form that can hold attention.',
    note: 'A fictional painting represented through an original vector composition. Texture is suggested rather than reproduced from a real artwork.',
    facts: [
      ['Medium', 'Oil on linen · conceptual'],
      ['Dimensions', '80 × 110 cm'],
    ],
    palette: ['#65503d', '#d7bf94', '#312d28'],
  },
  {
    id: 'folded-horizon',
    category: 'art',
    title: 'Folded Horizon',
    creator: 'Emil Stone',
    year: 2023,
    format: 'Sculpture',
    mood: 'Mysterious',
    description:
      'An imagined bronze ribbon folds around a space of light. Its shape changes as the visitor moves, turning a solid object into a succession of openings.',
    note: 'A fictional sculpture explored with a two-dimensional geometric study, not a photograph or a 3D model.',
    facts: [
      ['Medium', 'Patinated bronze · conceptual'],
      ['Dimensions', '48 × 32 × 24 cm'],
    ],
    palette: ['#454437', '#c3b47d', '#25291f'],
  },
  {
    id: 'notations-for-an-open-sky',
    category: 'art',
    title: 'Notations for an Open Sky',
    creator: 'Alma Grey',
    year: 2025,
    format: 'Painting',
    mood: 'Expansive',
    description:
      'Bands of mineral blue are interrupted by small marks of ochre. The composition imagines a sky understood as a page rather than a window.',
    note: 'An invented painting and an original digital interpretation, used to demonstrate the Gallery experience.',
    facts: [
      ['Medium', 'Pigment on paper · conceptual'],
      ['Dimensions', '70 × 90 cm'],
    ],
    palette: ['#3f5157', '#cbb88d', '#232e35'],
  },
];

export const works: Work[] = demoRecords.map((work) => ({
  ...work,
  legacyId: work.id,
  id: 'noctis:' + work.category + ':' + work.id,
  source: { kind: 'demo', provider: 'noctis', label: 'Fictional demonstration' },
  tags: [work.format, work.mood ?? 'Study'],
  mediaPreviews: [],
}));

export function getWork(category: string, id: string) {
  return works.find(
    (work) => work.category === category && (work.id === id || work.legacyId === id),
  );
}

export function workPath(work: Work) {
  return `/${work.category}/${work.legacyId ?? work.id}`;
}
