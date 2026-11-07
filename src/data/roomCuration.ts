import type { CategorySlug } from '../types/catalog';

// The small local selection is an editorial scope, never a claim of catalog breadth.
export const roomCuration: Record<CategorySlug, string> = {
  books: 'Three novels, read through the distance between a voice and the world around it.',
  films: 'Three encounters with early cinema. This local selection contains films, not series; live series search is not connected.',
  games: 'Three worlds understood through movement, distance and the spaces between people.',
  music: 'An ambient triptych: Brian Eno and his collaborators. A focused listening route, not a survey of music.',
  photography: 'Two documentary photographs. Look at the composition, then return to the source and its context.',
  art: 'Three ways of inhabiting a painted place: a park, a bedroom and a city street.',
};
