import type { Work } from '../types/catalog';

/** Roles describe supplied credits, never a guess based only on a film format. */
export function creatorCredit(work: Work): { label: string; name: string } | undefined {
  const name = work.creator.trim();
  if (!name || /^(unknown(?:\s.*)?|uncredited|not available|creator metadata unavailable|n\/a)$/i.test(name)) return;
  const roleFact = work.facts.find(([label, value]) => /^(director|series creator|developer|author|artist|photographer)$/i.test(label) && value === name);
  if (roleFact) return { label: roleFact[0], name };
  const verifiedDirectors = ['moma:films:299946', 'commons:films:sherlock-jr', 'commons:films:trip-moon'];
  const studios = ['camposanto:games:firewatch', 'thatgamecompany:games:journey', 'playdead:games:inside'];
  const label = work.category === 'books' ? 'Author'
    : work.category === 'photography' ? 'Photographer'
    : work.category === 'music' || work.category === 'art' ? 'Artist'
    : work.category === 'films' && work.source.kind === 'curated' && verifiedDirectors.includes(work.id) ? 'Director'
    : work.category === 'games' && work.source.kind === 'curated' && studios.includes(work.id) ? 'Developer'
    : 'Creator';
  return { label, name };
}

export function previewDescription(description: string) {
  const text = description.trim();
  if (text.length <= 230) return text;
  const part = text.slice(0, 227);
  const boundary = part.lastIndexOf(' ');
  return `${part.slice(0, boundary > 140 ? boundary : part.length).trimEnd()}…`;
}

export function sameDestination(first?: string, second?: string) {
  if (!first || !second) return false;
  try {
    const normalize = (value: string) => { const url = new URL(value); return `${url.origin}${url.pathname.replace(/\/$/, '')}${url.search}${url.hash}`; };
    return normalize(first) === normalize(second);
  } catch { return false; }
}
