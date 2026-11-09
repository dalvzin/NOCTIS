import { curatedWorks } from './curated';
import type { CategorySlug } from '../types/catalog';

// Each image belongs to a real record. Order controls the visual arrangement only.
const selections: Record<CategorySlug, string[]> = {
  books: ['gutenberg:books:84', 'gutenberg:books:1342', 'gutenberg:books:345'],
  films: ['moma:films:299946', 'commons:films:sherlock-jr', 'commons:films:trip-moon'],
  games: ['thatgamecompany:games:journey', 'camposanto:games:firewatch', 'playdead:games:inside'],
  music: [
    'brianeno:music:ambient-2',
    'brianeno:music:apollo',
    'brianeno:music:another-green-world',
  ],
  photography: [
    'nasa:photography:earthrise',
    'loc:photography:migrant-mother',
    'loc:photography:sadie-pfeifer',
  ],
  art: ['aic:art:27992', 'aic:art:28560', 'aic:art:20684'],
};

export function roomWorks(category: CategorySlug) {
  return selections[category].flatMap((id) => {
    const work = curatedWorks.find((item) => item.id === id);
    return work ? [work] : [];
  });
}
