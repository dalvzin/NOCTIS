import { readingNotes } from './editorialPaths';
import type { Work } from '../types/catalog';

// Original interpretations, not provider descriptions or additional factual credits.
const notes: Record<string, string> = {
  ...readingNotes,
  'moma:films:299946': 'Look at how the city distributes space: scale, height and distance become a way of reading power. Its architecture is more than a backdrop to the people moving through it.',
  'commons:films:sherlock-jr': 'Watch the edges of the frame. A cut can change the ground beneath a character, making the ordinary act of entering a scene feel unexpectedly precarious.',
  'commons:films:trip-moon': 'Notice the pleasure of a visibly constructed world. Painted surfaces and theatrical gestures invite us to enjoy the illusion while seeing how it is made.',
  'thatgamecompany:games:journey': 'The distant mountain gives movement a direction, but the small encounter beside you can change its meaning. Pay attention to the space between solitude and companionship.',
  'camposanto:games:firewatch': 'A landscape can feel open while a conversation feels close. Notice how the distance between what you see and what you hear shapes your sense of company.',
  'playdead:games:inside': 'Look for the rules of a place before looking for an explanation. Light and the position of a small body can make a space feel legible and threatening at the same time.',
  'brianeno:music:ambient-2': 'Follow the space around a piano phrase rather than waiting for a large arrival. The pause and the resonance can feel as present as the notes.',
  'brianeno:music:apollo': 'Let a sound suggest a distance without deciding immediately what landscape it belongs to. The record invites an image of space that feels intimate rather than monumental.',
  'brianeno:music:another-green-world': 'Listen to the border between a song and a small instrumental place. The change of scale can make the record feel like rooms connected by unexpected doors.',
  'loc:photography:migrant-mother': 'Before settling on the familiar face, notice the hands and the figures turned away. Read the photograph alongside its source context rather than treating one expression as a complete life story.',
  'commons:photography:steerage': 'Trace the diagonals before reading individual faces. The gangway and railings let the composition itself ask who can pass between one space and another.',
  'aic:art:27992': 'Try two distances: first the arrangement of figures across the park, then the marks that build its light. The scene changes when looking becomes a movement toward and away from the surface.',
  'aic:art:28560': 'Follow the tilting furniture and the meeting of the walls. This room offers the idea of rest while its color and perspective keep the eye quietly in motion.',
  'aic:art:20684': 'Notice the broad street and the small distances between strangers. Umbrellas create private edges within a space that everyone appears to share.',
};

export function recordNote(work: Work): string | undefined {
  if (notes[work.id]) return notes[work.id];
  if (!work.note || /handpicked starting point|not a popularity ranking|not a personalized|metadata|retrieved|source record|external catalog/i.test(work.note)) return;
  return work.note;
}
