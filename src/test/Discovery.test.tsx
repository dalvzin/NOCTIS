import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../app/App';
import { manuscriptSpread } from './manuscriptHelpers';
import { normalizeAic, normalizeMusicBrainz, normalizeOpenLibrary, normalizeResponse } from '../services/providers';
import { deduplicate, filterWorks, safeExternalUrl, validReturnTo } from '../services/catalogUtils';
import { clearCatalogCache, searchCatalog, isWork, fetchWork } from '../services/catalog';
import { curatedWorks } from '../data/curated';
import { works } from '../data/works';
import { ItemImage } from '../features/discovery/ItemImage';

afterEach(() => { cleanup(); clearCatalogCache(); vi.restoreAllMocks(); vi.mocked(fetch).mockReset().mockImplementation(async url => new Response(JSON.stringify(String(url).includes('/status') ? [] : { items: [], statuses: [] }))); });
function open(path: string) { render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>); }
const artFixture = { id: 123, title: 'Test artwork (fixture)', artist_title: 'Test artist', date_start: 1900, medium_display: 'Oil on canvas', is_public_domain: true, image_id: 'abcd-1234', description: '<p>A fixture &amp; test.</p>' };

describe('Provider normalization', () => {
  it('requires stable provider IDs and titles and tolerates missing optional fields', () => {
    expect(normalizeOpenLibrary(null)).toBeNull();
    expect(normalizeOpenLibrary({ key: '/works/OL123W', title: 'Test book' })).toMatchObject({ id: 'openlibrary:books:OL123W', year: null });
    expect(normalizeAic({ id: 'wrong', title: 'x' })).toBeNull();
    expect(() => normalizeResponse('aic', { data: null })).toThrow('Unexpected provider response');
  });
  it('links source-selected book artwork without inventing a free license', () => {
    const item = normalizeOpenLibrary({ key: '/works/OL123W', title: 'Test book', cover_i: 123, author_name: ['A. Author'], first_publish_year: 1818, subject: ['Gothic'] })!;
    expect(item.image?.url).toBe('https://covers.openlibrary.org/b/id/123-L.jpg?default=false'); expect(item.image?.rights).toMatch(/copyright/); expect(item.creator).toBe('A. Author'); expect(item.tags).toEqual(['Gothic']);
  });
  it('uses AIC images only with an explicit public domain flag and allowed IIIF base', () => {
    const item = normalizeAic(artFixture)!;
    expect(item.description).toBe('A fixture & test.');
    expect(item.image?.url).toMatch(/^https:\/\/www.artic.edu\/iiif\//);
    expect(normalizeAic({ ...artFixture, is_public_domain: false })!.image).toBeUndefined();
    expect(normalizeAic(artFixture, 'https://attacker.invalid/iiif')!.image).toBeUndefined();
    expect(isWork(item)).toBe(true);
    expect(isWork({ ...item, image: { url: 'javascript:alert(1)' } })).toBe(false);
  });
  it('normalizes MusicBrainz without inventing dates, audio or covers', () => {
    const item = normalizeMusicBrainz({ id: '11111111-2222-3333-4444-555555555555', title: 'Fixture release', 'artist-credit': [{ name: 'Fixture artist' }], 'primary-type': 'Album' })!;
    expect(item.year).toBeNull(); expect(item.creator).toBe('Fixture artist'); expect(item.image).toBeUndefined(); expect(item.mediaPreviews).toEqual([]);
  });
  it('deduplicates real provider records while keeping fictional works distinct', () => {
    const book = curatedWorks.find(work => work.title === 'Frankenstein')!;
    const duplicate = normalizeOpenLibrary({ key: '/works/OL123W', title: 'Frankenstein; or, The Modern Prometheus', author_name: ['Mary Shelley'] })!;
    expect(deduplicate([book, duplicate])).toHaveLength(1);
    expect(deduplicate([book, { ...works[0], title: book.title, creator: book.creator }])).toHaveLength(2);
  });
  it('filters actual fields, excludes unknown years from periods and validates destinations', () => {
    const filtered = filterWorks(curatedWorks, new URLSearchParams('category=books&creator=shelley&year=1810&tag=Gothic'));
    expect(filtered.map(item => item.title)).toEqual(['Frankenstein']);
    expect(filterWorks([{ ...curatedWorks[0], year: null }], new URLSearchParams('year=1810'))).toEqual([]);
    expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined();
    expect(validReturnTo('//attacker.invalid', '/books')).toBe('/books');
  });
});

describe('Client reliability', () => {
  it('keeps local real records when the service fails and reports the failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'));
    const result = await searchCatalog('Frankenstein', 'books');
    expect(result.items.some(item => item.title === 'Frankenstein' && item.source.kind === 'curated')).toBe(true);
    expect(result.statuses[0].state).toBe('error');
  });
  it('rejects malformed provider items and caches successful bounded results', async () => {
    const mock = vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ items: [{ id: 'broken' }], statuses: [] })));
    const a = await searchCatalog('fixture-unique', 'books');
    const b = await searchCatalog('fixture-unique', 'books');
    expect(a.items).toEqual([]); expect(b).toEqual(a); expect(mock.mock.calls.filter(([url]) => String(url).includes('fixture-unique'))).toHaveLength(1);
  });
  it('does not swallow request cancellation', async () => {
    const controller = new AbortController(); controller.abort();
    vi.mocked(fetch).mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    await expect(searchCatalog('cancel-unique', '', controller.signal)).rejects.toThrow();
  });
  it('reloads an external deep link through its own allowlisted provider', async () => {
    const item = normalizeAic({ ...artFixture, id: 98765 })!;
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ item })));
    expect((await fetchWork('art', 'aic:art:98765'))?.title).toBe('Test artwork (fixture)');
    expect(await fetchWork('books', 'aic:art:98765')).toBeNull();
  });
});

describe('Discovery flows', () => {
  it('searches through Ctrl+K, supports arrow focus and Enter to full results', async () => {
    const user = userEvent.setup(); open('/');
    await user.keyboard('{Control>}k{/Control}');
    const input = screen.getByRole('searchbox', { name: 'Search works' });
    await user.type(input, 'Frankenstein');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toContain('Frankenstein');
    await user.click(input); await user.keyboard('{Enter}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Find something worth keeping.' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search works, creators and subjects' })).toHaveValue('Frankenstein');
  });
  it('opens a real work preview, its full record, and an attributed source link', async () => {
    const user = userEvent.setup(); open('/search?q=Frankenstein');
    await user.click(screen.getByRole('button', { name: 'Quick preview: Frankenstein' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Open full record' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Frankenstein' })).toBeInTheDocument();
    await manuscriptSpread(user, 'archive');
    expect(screen.getByRole('link', { name: /View Book Details/ })).toHaveAttribute('href', 'https://www.gutenberg.org/ebooks/84');
    await user.click(screen.getByText('Sources & image credits'));
    expect(screen.getByText('The source record is linked above.')).toBeVisible();
    expect(screen.queryByText(/This work, its creator and its metadata are fictional/)).not.toBeInTheDocument();
  });
  it('shows editorial collections rather than fake trending or community activity', async () => {
    open('/discover?collection=inhabited-spaces');
    expect(screen.getAllByRole('heading', { name: 'The spaces we inhabit' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /The Bedroom/ }).length).toBeGreaterThan(0);
  });
  it('falls back to the original visual when an image fails', () => {
    const work = curatedWorks.find(item => item.image)!;
    render(<ItemImage work={work}/>);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Original NOCTIS placeholder')).toBeInTheDocument();
  });
  it('ignores an outdated response after a newer query', async () => {
    const user = userEvent.setup();
    let resolveOld!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation(async input => {
      if (String(input).includes('q=oldquery')) return new Promise<Response>(resolve => { resolveOld = resolve; });
      return new Response(JSON.stringify({ items: [], statuses: [] }));
    });
    open('/'); await user.click(screen.getByRole('button', { name: 'Search archive' }));
    const input = screen.getByRole('searchbox', { name: 'Search works' });
    await user.type(input, 'oldquery');
    await waitFor(() => expect(resolveOld).toBeTypeOf('function'));
    await user.clear(input); await user.type(input, 'Frankenstein');
    resolveOld(new Response(JSON.stringify({ items: [normalizeAic(artFixture)], statuses: [] })));
    await waitFor(() => expect(screen.queryByRole('link', { name: /Test artwork \(fixture\)/ })).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: /FrankensteinMary/ })).toBeInTheDocument();
  });
});
