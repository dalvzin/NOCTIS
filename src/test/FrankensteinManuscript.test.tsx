import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { curatedWorks } from '../data/curated';
import { workPath } from '../data/works';
import { isBookManuscript, bookPresentation } from '../features/frankenstein/bookPresentation';
import { bookReducer, initialBookState, useManuscriptBook } from '../features/frankenstein/useManuscriptBook';
import { LocalArchiveRepository } from '../features/personal/repository';
import { PersonalProvider } from '../features/personal/context';
import { manuscriptSpread } from './manuscriptHelpers';

const book = curatedWorks.find(work => work.id === 'gutenberg:books:84')!;
const matchImplementation = vi.mocked(window.matchMedia).getMockImplementation()!;
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.mocked(window.matchMedia).mockImplementation(matchImplementation); });
function fixture() {
  const values = new Map<string, string>();
  const create = () => new LocalArchiveRepository({ storage: () => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } }), listenToStorage: false });
  return { create, values, repo: create() };
}
function open(path = workPath(book), repo = fixture().repo) { return render(<PersonalProvider repository={repo}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></PersonalProvider>); }

describe('Shared book manuscripts', () => {
  it('keeps the Books room illustration static without a second book-opening ritual', () => {
    open('/books');
    expect(screen.queryByRole('button', { name:/Replay books/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level:1, name:'The Reading Room' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name:'Explore the collection' })).toHaveAttribute('href','#collection');
  });

  it.each(curatedWorks.filter(work => work.category === 'books'))('opens $title with its own cover, edition, prose and independent archive', async work => {
    const user=userEvent.setup(), f=fixture();
    const view=open(`/books?q=${encodeURIComponent(work.title)}`, f.repo);
    await user.click(screen.getByRole('button', { name:`Quick preview: ${work.title}` }));
    await user.click(screen.getByRole('link', { name:'Open full record' }));
    expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase','closed');
    await user.click(screen.getByRole('button', { name:/Skip animation/ }));
    const manuscript=screen.getByRole('region', { name:`${work.title} manuscript` });
    expect(within(manuscript).getByRole('img', { name:work.image!.alt })).toHaveAttribute('src',work.image!.url);
    expect(within(manuscript).getAllByText(work.creator).length).toBeGreaterThan(0);
    expect(within(manuscript).getAllByText(`Project Gutenberg ebook ${work.source.kind !== 'demo' ? work.source.externalId : ''}`).length).toBeGreaterThan(0);
    await manuscriptSpread(user,'story');
    expect(within(manuscript).getByText(work.description)).toBeVisible();
    expect(within(manuscript).getByText(bookPresentation(work).reflection!)).toBeVisible();
    if(work.id !== book.id) expect(within(manuscript).queryByText('CREATION / RESPONSIBILITY')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name:'Save' }));
    await user.selectOptions(screen.getByRole('combobox', { name:'My private rating' }),'4');
    expect(f.repo.getSnapshot().data.entries[work.id]).toMatchObject({saved:true,rating:4});
    for(const other of curatedWorks.filter(item=>item.category==='books' && item.id!==work.id)) expect(f.repo.getSnapshot().data.entries[other.id]).toBeUndefined();
    view.unmount();
    open(workPath(work),f.create()); await manuscriptSpread(user,'archive');
    expect(screen.getByRole('button', {name:'Saved'})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByRole('combobox', {name:'My private rating'})).toHaveValue('4');
    expect(screen.getByRole('link', {name:/View Book Details/})).toHaveAttribute('href',work.source.kind!=='demo'?work.source.url:'');
  });

  it('uses the reading experience only for real books and never assigns canonical text by title', () => {
    expect(isBookManuscript(book)).toBe(true);
    expect(isBookManuscript({ ...book, category: 'films' })).toBe(false);
    expect(isBookManuscript({ ...book, source: { kind: 'demo', provider: 'noctis', label: 'Fixture' } })).toBe(false);
    expect(bookPresentation({ ...book, id: 'openlibrary:books:OL1M', source: { ...book.source, kind: 'curated', provider: 'fixture', externalId: 'OL1M', label: 'Another edition', attribution: 'Fixture' } }).reflection).toBeUndefined();
  });

  it('keeps all other categories on their standard detail pages', () => {
    for (const work of curatedWorks.filter(item => item.category !== 'books')) {
      const view = open(workPath(work));
      expect(screen.getByRole('heading', { level: 1, name: work.title })).toBeInTheDocument();
      expect(view.container.querySelector('[data-book-phase]')).toBeNull(); view.unmount();
    }
  });

  it('uses another edition’s own record in the shared book without claiming Gutenberg 84', async () => {
    const f = fixture(), edition = { ...book, id: 'fixture:books:another-edition', source: { kind: 'curated' as const, provider: 'fixture', externalId: 'another-edition', label: 'Edition fixture', attribution: 'Synthetic edition fixture, not public catalog content.' } };
    await f.repo.dispatch({ type: 'save', work: edition, value: true });
    const view = open(workPath(edition), f.create());
    expect(view.container.querySelector('[data-book-phase]')).toBeInTheDocument(); expect(screen.getByRole('heading', { level: 1, name: book.title })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name:/Skip animation/ }));
    expect(screen.getAllByText('Edition fixture').length).toBeGreaterThan(0);
    expect(screen.queryByText('Project Gutenberg ebook 84')).not.toBeInTheDocument();
  });

  it('uses the selected cover and stays a book after skipping its opening', async () => {
    const user = userEvent.setup(), view = open();
    expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'closed');
    await user.click(screen.getByRole('button', { name: /Skip animation/ }));
    expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading');
    expect(screen.getByRole('img', { name: book.image!.alt })).toHaveAttribute('src', book.image!.url);
    expect(screen.getByRole('region', { name: 'Page 1: The title page' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Page 2: About this book' })).toBeInTheDocument();
    const artifact = screen.getByRole('region', { name: 'Frankenstein manuscript' });
    expect(within(artifact).queryByRole('combobox', { name: 'My private rating' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('turns sheets in both directions and moves focus to the new spread', async () => {
    const user = userEvent.setup(); open(); await manuscriptSpread(user, 'story');
    const spread = screen.getByRole('region', { name: 'Spread 2: The story' }); expect(spread).toHaveFocus();
    expect(screen.getByText(book.description)).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('region', { name: 'Spread 1: The introduction' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(screen.getByRole('region', { name: 'Spread 2: The story' })).toHaveFocus());
  });

  it('puts the contents before the reading area and clearly labels the different kinds of text', async () => {
    const user = userEvent.setup(); open(); await manuscriptSpread(user, 'identity');
    const contents = screen.getByRole('navigation', { name: 'Manuscript contents' }), reading = screen.getByRole('region', { name: 'Spread 1: The introduction' });
    expect(contents.compareDocumentPosition(reading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Read the story')).toBeVisible();
    expect(screen.getByText('Book details')).toBeVisible();
    await user.click(within(contents).getByRole('button', { name: 'Open story spread' }));
    await waitFor(() => expect(document.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading'));
    expect(screen.getByText('Synopsis')).toBeVisible(); expect(screen.getByText('Editorial notes')).toBeVisible();
    expect(screen.getByText('End of book')).toBeVisible();
  });

  it('keeps the personal archive and sources outside and after the book on every spread', async () => {
    const user = userEvent.setup(); open(); await manuscriptSpread(user, 'identity');
    const artifact = screen.getByRole('region', { name: 'Frankenstein manuscript' });
    const companion = screen.getByRole('region', { name: 'Your archive & sources' });
    expect(artifact.compareDocumentPosition(companion) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(artifact).queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(within(artifact).queryByText('Sources & image credits')).not.toBeInTheDocument();
    await user.click(within(companion).getByRole('button', { name: 'Save' }));
    await manuscriptSpread(user, 'story');
    expect(within(companion).getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(companion).getByRole('combobox', { name: 'My private rating' })).toBeVisible();
  });

  it('does not consume arrow keys from personal form controls', async () => {
    const user = userEvent.setup(); open(); await manuscriptSpread(user, 'archive');
    const select = screen.getByRole('combobox', { name: 'My private rating' }); select.focus(); fireEvent.keyDown(select, { key: 'ArrowLeft' });
    expect(document.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading');
    expect(screen.getByRole('region', { name: 'Spread 1: The introduction' })).toBeInTheDocument(); expect(select).toHaveFocus();
  });

  it('reuses save, unsave, want, rating and albums and preserves them across reload', async () => {
    const user = userEvent.setup(), f = fixture(); open(workPath(book), f.repo); await manuscriptSpread(user, 'archive');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Want to Experience' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'My private rating' }), '4.5');
    await user.click(screen.getByText('Add to Album')); await user.type(screen.getByRole('textbox', { name: 'New album title' }), 'Manuscript test');
    await user.click(screen.getByRole('button', { name: 'Create album with this work' }));
    cleanup(); open(workPath(book), f.create()); await manuscriptSpread(user, 'archive');
    expect(screen.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Want to Experience/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toHaveValue('4.5');
    await user.click(screen.getByText('Add to Album')); expect(screen.getByRole('checkbox', { name: 'Manuscript test' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Saved' })); expect(f.create().getSnapshot().data.entries[book.id].saved).toBe(false);
    expect(f.create().getSnapshot().data.entries[book.id].rating).toBe(4.5);
  });

  it('keeps verified source links and edition credits in the separate area below the book', async () => {
    const user = userEvent.setup(); open(); await manuscriptSpread(user, 'archive');
    expect(screen.getByRole('link', { name: /View Book Details/ })).toHaveAttribute('href', 'https://www.gutenberg.org/ebooks/84');
    await user.click(screen.getByText('Sources & image credits'));
    expect(within(screen.getByRole('region', { name: 'Your archive & sources' })).getByText(/Ebook is public domain in the USA/)).toBeVisible();
    expect(screen.getByRole('link', { name: /View Book Details/ })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /View Book Details/ }).closest('[aria-label="Frankenstein manuscript"]')).toBeNull();
  });

  it('arrives from Discover and Search and retains each return context', async () => {
    const user = userEvent.setup();
    for (const path of ['/discover', '/search?q=Frankenstein&format=Novel']) {
      open(path); await user.click(screen.getByRole('link', { name: 'Frankenstein' })); await manuscriptSpread(user, 'identity');
      for (const link of screen.getAllByRole('link', { name: path.startsWith('/search') ? /Back to search results/ : /Back to the collection/ })) expect(link).toHaveAttribute('href', path);
      expect(screen.getByRole('link', { name: 'The Reading Room' })).toHaveAttribute('href', '/books'); cleanup();
    }
  });

  it('opens immediately for the internal reduced-motion preference without changing stored data', async () => {
    const f = fixture(); await f.repo.dispatch({ type: 'preferences', patch: { motion: 'reduce' } }); const before = [...f.values.entries()];
    const view = open(workPath(book), f.repo);
    expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading');
    expect(screen.queryByRole('button', { name: /Skip animation/ })).not.toBeInTheDocument();
    expect([...f.values.entries()]).toEqual(before);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open story spread' }));
    expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading');
    expect(screen.getByRole('combobox', { name: 'My private rating' })).toBeInTheDocument();
  });

  it('opens immediately for the device reduced-motion setting', () => {
    vi.mocked(window.matchMedia).mockImplementation(query => ({ ...matchImplementation(query), matches: query.includes('prefers-reduced-motion') }));
    const view = open(); expect(view.container.querySelector('[data-book-phase]')).toHaveAttribute('data-book-phase', 'reading');
    expect(screen.queryByRole('button', { name: /Skip animation/ })).not.toBeInTheDocument();
  });

  it('provides four reading leaves in mobile mode, with no archive leaf', async () => {
    vi.mocked(window.matchMedia).mockImplementation(query => ({ ...matchImplementation(query), matches: query.includes('max-width: 760px') }));
    const user = userEvent.setup(); open(); await user.click(screen.getByRole('button', { name: /Skip animation/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Page 1 of 4');
    expect(screen.queryByRole('region', { name: 'Page 2: About this book' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page 2 of 4'));
    expect(screen.getByRole('region', { name: 'Page 2: About this book' })).toBeInTheDocument();
    for (const page of [3, 4]) {
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`Page ${page} of 4`));
    }
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('combobox', { name: 'My private rating' }).closest('[aria-label="Frankenstein manuscript"]')).toBeNull();
  });
});

describe('Book animation state and interruption safety', () => {
  it('automatically opens once and settles as a readable book', () => {
    vi.useFakeTimers(); const { result } = renderHook(() => useManuscriptBook(false));
    expect(result.current.state.phase).toBe('closed'); act(() => vi.advanceTimersByTime(350)); expect(result.current.state.phase).toBe('opening');
    act(() => vi.advanceTimersByTime(1480)); expect(result.current.state.phase).toBe('reading');
    act(() => vi.advanceTimersByTime(10000)); expect(result.current.state.phase).toBe('reading');
  });
  it('rejects overlapping turns and stale animation completions', () => {
    const start = initialBookState(true), turn = bookReducer(start, { type: 'go', page: 2, step: 2, reduced: false });
    expect(turn.phase).toBe('turning'); expect(bookReducer(turn, { type: 'go', page: 0, step: 2, reduced: false })).toBe(turn);
    expect(bookReducer(turn, { type: 'settle', revision: turn.revision - 1 })).toBe(turn);
    expect(bookReducer(turn, { type: 'settle', revision: turn.revision }).page).toBe(2);
  });
  it('bounds pages and supports backward turns without rotating the book state', () => {
    const start = initialBookState(true); expect(bookReducer(start, { type: 'go', page: -2, step: 2, reduced: false })).toBe(start);
    const end = bookReducer(start, { type: 'go', page: 100, step: 2, reduced: true }); expect(end.page).toBe(2);
    const previous = bookReducer(end, { type: 'go', page: 0, step: 2, reduced: false }); expect(previous.direction).toBe(-1);
    expect(bookReducer(previous, { type: 'settle' }).page).toBe(0);
  });
  it('settles safely when adapting between single pages and spreads during a turn', () => {
    const mobile = bookReducer(initialBookState(true), { type: 'go', page: 3, step: 1, reduced: false });
    const desktop = bookReducer(mobile, { type: 'adapt', step: 2 }); expect(desktop.phase).toBe('reading'); expect(desktop.page).toBe(2);
    expect(bookReducer(desktop, { type: 'adapt', step: 1 }).page).toBe(2);
    const opening = bookReducer(initialBookState(false), { type: 'open' });
    expect(bookReducer(opening, { type: 'adapt', step: 1 }).phase).toBe('reading');
  });
  it('settles an opening when the document becomes hidden', () => {
    vi.useFakeTimers(); const { result } = renderHook(() => useManuscriptBook(false));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.state.phase).toBe('reading');
  });
  it('clears its timers on unmount', () => {
    vi.useFakeTimers(); const hook = renderHook(() => useManuscriptBook(false)); hook.unmount(); expect(vi.getTimerCount()).toBe(0);
  });
});
