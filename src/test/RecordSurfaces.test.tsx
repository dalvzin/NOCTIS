import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { manuscriptSpread } from './manuscriptHelpers';
import { curatedWorks } from '../data/curated';
import { rooms } from '../data/rooms';
import { workPath } from '../data/works';
import { recordNote } from '../data/recordNotes';
import { QuickPreview } from '../features/discovery/QuickPreview';
import { PersonalProvider } from '../features/personal/context';
import { LocalArchiveRepository } from '../features/personal/repository';
import { creatorCredit, previewDescription } from '../services/recordPresentation';
import { mergeDestinations } from '../services/destinations';
import { validReturnTo } from '../services/catalogUtils';

function fixture() {
  const values = new Map<string, string>();
  const create = () => new LocalArchiveRepository({ storage: () => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } }), listenToStorage: false });
  return { create, repo: create() };
}
function open(path: string, repo = fixture().repo) { return render(<PersonalProvider repository={repo}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></PersonalProvider>); }
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const book = curatedWorks.find(work => work.id === 'gutenberg:books:84')!;

describe('Different purposes for preview and full record', () => {
  it.each(rooms)('offers quick actions, attribution and a richer full record for $slug', async room => {
    const work = curatedWorks.find(item => item.category === room.slug)!, user = userEvent.setup();
    open(`/${room.slug}`); await user.click(screen.getByRole('button', { name: `Quick preview: ${work.title}` }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(creatorCredit(work)!.label)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Want to Experience' })).toBeInTheDocument();
    expect(within(dialog).getByText('Add to Album')).toBeInTheDocument();
    expect(within(dialog).queryByRole('combobox', { name: 'My private rating' })).not.toBeInTheDocument();
    for (const link of dialog.querySelectorAll('a[target="_blank"]')) expect(link.closest('details')?.querySelector('summary')).toHaveTextContent('Image credit');
    expect(within(dialog).queryByText(recordNote(work)!)).not.toBeInTheDocument();
    await user.click(within(dialog).getByText('Image credit')); expect(within(dialog).getByRole('link', { name: /Image source/ })).toBeVisible();
    await user.click(within(dialog).getByRole('link', { name: 'Open full record' }));
    if(room.slug === 'books') await manuscriptSpread(user,'story');
    expect(screen.getByRole('heading', { name: 'A closer look' })).toBeInTheDocument();
    expect(screen.getByText(recordNote(work)!)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: room.slug === 'books' ? 'Explore the source' : 'Beyond this record' })).toBeInTheDocument();
    const urls = [...document.querySelectorAll<HTMLAnchorElement>('main a[target="_blank"]')].map(link => link.href.replace(/\/$/, ''));
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('persists quick actions and album membership through full record, reload and My Archive', async () => {
    const f = fixture(), user = userEvent.setup(); open('/search?q=Frankenstein&format=Novel', f.repo);
    await user.click(screen.getByRole('button', { name: 'Quick preview: Frankenstein' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await user.click(within(dialog).getByRole('button', { name: 'Want to Experience' }));
    await user.click(within(dialog).getByText('Add to Album'));
    await user.type(within(dialog).getByRole('textbox', { name: 'New album title' }), 'Surface test');
    await user.click(within(dialog).getByRole('button', { name: 'Create album with this work' }));
    await user.click(within(dialog).getByRole('link', { name: 'Open full record' }));
    await manuscriptSpread(user, 'archive');
    expect(screen.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Want to Experience/ })).toHaveAttribute('aria-pressed', 'true');
    for (const link of screen.getAllByRole('link', { name: /Back to search results/ })) expect(link).toHaveAttribute('href', '/search?q=Frankenstein&format=Novel');
    await user.selectOptions(screen.getByRole('combobox', { name: 'My private rating' }), '4.5');
    cleanup(); open(workPath(book), f.create());
    await manuscriptSpread(user, 'archive');
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toHaveValue('4.5');
    await user.click(screen.getByText('Add to Album')); expect(screen.getByRole('checkbox', { name: 'Surface test' })).toBeChecked();
    cleanup(); open('/my-archive', f.create());
    expect(screen.getByRole('link', { name: 'Saved (1)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Want to Experience (1)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Ratings (1)' })).toBeInTheDocument();
  });

  it('opens immediately without destination requests and retains image attribution', () => {
    vi.mocked(fetch).mockClear();
    const live = { ...book, source: { kind: 'live' as const, provider: 'openlibrary', externalId: 'OL123W', label: 'Open Library', attribution: 'Synthetic fixture' } };
    render(<PersonalProvider repository={fixture().repo}><MemoryRouter><QuickPreview work={live} returnTo="/books" onClose={() => {}}/></MemoryRouter></PersonalProvider>);
    expect(fetch).not.toHaveBeenCalled(); expect(screen.getByText('Image credit')).toBeInTheDocument();
    expect(screen.queryByText('Sources & image credits')).not.toBeInTheDocument();
  });

  it('handles missing creator, date, image and description without invented metadata', () => {
    const sparse = { ...book, id: 'fixture:sparse', creator: 'Unknown author', year: null, description: '', image: undefined };
    render(<MemoryRouter><QuickPreview work={sparse} returnTo="/books" onClose={() => {}}/></MemoryRouter>);
    expect(screen.queryByText('Unknown author')).not.toBeInTheDocument(); expect(screen.queryByText('Author')).not.toBeInTheDocument();
    expect(screen.getByText('A description is not available for this record.')).toBeInTheDocument();
    expect(screen.getByText('Artwork unavailable')).toBeInTheDocument(); expect(screen.queryByText('1818')).not.toBeInTheDocument();
  });

  it('keeps a long title intact and shortens only the preview description', () => {
    const title = 'A very long title '.repeat(12).trim(), description = 'A supplied source description about this work. '.repeat(20);
    render(<MemoryRouter><QuickPreview work={{ ...book, title, description }} returnTo="/books" onClose={() => {}}/></MemoryRouter>);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(previewDescription(description).length).toBeLessThanOrEqual(230); expect(screen.getByText(previewDescription(description))).toBeInTheDocument();
  });

  it('renders a sparse full record honestly without a generic editorial note or invented links', async () => {
    const f = fixture(), title = 'A long supplied title '.repeat(8).trim();
    const sparse = { ...book, id: 'fixture:books:sparse', title, creator: 'Creator metadata unavailable', year: null, description: '', image: undefined, facts: [], tags: [], source: { kind: 'curated' as const, provider: 'fixture', externalId: 'sparse', label: 'Test fixture', attribution: 'Synthetic fixture only.' } };
    await f.repo.dispatch({ type: 'save', work: sparse, value: true }); open(workPath(sparse), f.create());
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    await manuscriptSpread(userEvent.setup(),'story');
    expect(screen.getByRole('heading', { name: 'A closer look' })).toBeInTheDocument();
    expect(screen.getByText('A description is not available for this record.')).toBeInTheDocument();
    expect(screen.getByText('No verified external destination is available for this record.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toBeInTheDocument();
    expect(screen.queryByText('Creator metadata unavailable')).not.toBeInTheDocument();
  });

  it('does not assign director or producer to an unsupported series credit', () => {
    const series = { ...book, id: 'fixture:series', category: 'films' as const, format: 'Series', creator: 'Supplied name', facts: [] };
    expect(creatorCredit(series)).toEqual({ label: 'Creator', name: 'Supplied name' });
    expect(creatorCredit({ ...series, facts: [['Series creator', 'Supplied name']] })?.label).toBe('Series creator');
    expect(creatorCredit({ ...series, creator: '' })).toBeUndefined();
    expect(creatorCredit({ ...series, creator: 'Creator metadata unavailable' })).toBeUndefined();
  });

  it('deduplicates equivalent destinations and allows contextual internal returns only', () => {
    expect(mergeDestinations('books', [{ kind: 'book-details', url: 'https://www.gutenberg.org/ebooks/84', verifiedBy: 'curator' }, { kind: 'book-details', url: 'https://www.gutenberg.org/ebooks/84/', verifiedBy: 'curator' }])).toHaveLength(1);
    expect(validReturnTo('/albums/local-id', '/books')).toBe('/albums/local-id');
    expect(validReturnTo('/my-archive?tab=want', '/books')).toBe('/my-archive?tab=want');
    for (const url of ['//evil.invalid', '/albums/../auth', '/albums/a/b']) expect(validReturnTo(url, '/books')).toBe('/books');
  });

  it('releases the background and restores focus when cancelling the native dialog', async () => {
    const user = userEvent.setup(); open('/books'); const trigger = screen.getByRole('button', { name: 'Quick preview: Frankenstein' }); await user.click(trigger);
    expect(document.body.style.overflow).toBe('hidden'); fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(document.body.style.overflow).not.toBe('hidden'); expect(trigger).toHaveFocus();
  });

  it('cycles Tab between the visible dialog controls, excluding closed disclosure contents', async () => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    const user = userEvent.setup(); open('/books'); await user.click(screen.getByRole('button', { name: 'Quick preview: Frankenstein' }));
    const dialog = screen.getByRole('dialog'), close = within(dialog).getByRole('button', { name: 'Close quick preview: frankenstein' }), credit = within(dialog).getByText('Image credit');
    close.focus(); fireEvent.keyDown(close, { key: 'Tab', shiftKey: true }); expect(credit).toHaveFocus();
    fireEvent.keyDown(credit, { key: 'Tab' }); expect(close).toHaveFocus();
  });
});

