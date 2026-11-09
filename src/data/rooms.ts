export interface Room {
  slug: string;
  category: string;
  name: string;
  description: string;
  motif: string;
}
export const rooms: Room[] = [
  {
    slug: 'books',
    category: 'Books',
    name: 'The Reading Room',
    description: 'For the worlds that unfold between the lines.',
    motif: 'pages',
  },
  {
    slug: 'films',
    category: 'Films & Series',
    name: 'The Screening Room',
    description: 'Stories that stay long after the screen goes dark.',
    motif: 'screen',
  },
  {
    slug: 'games',
    category: 'Games',
    name: 'The Console Room',
    description: 'Other worlds. A different kind of presence.',
    motif: 'portal',
  },
  {
    slug: 'music',
    category: 'Music',
    name: 'The Listening Room',
    description: 'A place to listen a little more closely.',
    motif: 'vinyl',
  },
  {
    slug: 'photography',
    category: 'Photography',
    name: 'The Darkroom',
    description: 'Fleeting moments, held up to the light.',
    motif: 'frame',
  },
  {
    slug: 'art',
    category: 'Art',
    name: 'The Gallery',
    description: 'New ways of seeing what has always been here.',
    motif: 'sculpture',
  },
];
export const personalPages = [
  {
    slug: 'my-archive',
    title: 'My Archive',
    description: 'Saved works, private ratings and multimedia albums, stored in this browser.',
  },
  {
    slug: 'recently-explored',
    title: 'Recently Explored',
    description: 'Optional history of full record visits. Recording is off until you enable it.',
  },
  {
    slug: 'settings',
    title: 'Settings',
    description: 'Manage local personal data, history recording and reduced motion.',
  },
];
