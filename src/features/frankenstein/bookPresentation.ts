import type { Work } from '../../types/catalog';

// Interpretive text is original NOCTIS editorial, not a quotation or edition claim.
const readings: Record<string, { lead: string; reflection: string; theme: string; tone: string }> = {
  '84': { lead: 'Creation and responsibility, between maker and made.', reflection: 'Read for the distance between an act of making and an act of care. The question is not only what can be created, but what follows once it exists.', theme: 'CREATION / RESPONSIBILITY', tone: 'sage' },
  '1342': { lead: 'First impressions, and the space left for a second reading.', reflection: 'Notice how a judgment changes when the same gesture is seen again. Read the conversations for what is spoken, what is assumed and what takes longer to understand.', theme: 'PERCEPTION / UNDERSTANDING', tone: 'olive' },
  '345': { lead: 'A story assembled from voices that cannot see the whole.', reflection: 'Follow the pauses between one account and the next. A letter can make an absence feel close; a diary can turn an ordinary detail into a question.', theme: 'VOICES / UNCERTAINTY', tone: 'claret' },
};

export function isBookManuscript(work: Work) { return work.category === 'books' && work.source.kind !== 'demo'; }

export function bookPresentation(work: Work) {
  const source = work.source;
  const gutenberg = source.kind !== 'demo' && source.provider === 'gutenberg';
  const reading = gutenberg && work.id === `gutenberg:books:${source.externalId}` ? readings[source.externalId] : undefined;
  return {
    lead: reading?.lead ?? 'A record to explore, one page at a time.',
    reflection: reading?.reflection,
    theme: reading?.theme ?? 'THE READING ROOM',
    tone: reading?.tone ?? 'sage',
    edition: gutenberg ? `Project Gutenberg ebook ${source.externalId}` : source.label,
    imprint: gutenberg ? `GUTENBERG / ${source.externalId.padStart(3, '0')}` : source.label,
    recordNumber: gutenberg ? source.externalId.padStart(3, '0') : 'BOOKS',
    archiveId: work.id === 'gutenberg:books:84' ? 'frankenstein-archive' : 'book-archive',
  };
}
