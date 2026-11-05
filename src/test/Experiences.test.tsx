import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { works, getWork, workPath } from '../data/works';
import { rooms } from '../data/rooms';

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async importOriginal => ({ ...await importOriginal<typeof import('motion/react')>(), useReducedMotion: () => preferences.reduced }));

afterEach(() => { cleanup(); preferences.reduced = false; });
function open(path: string) { render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>); }

describe('Local catalog integrity', () => {
  it('has three complete, unique demonstration records in each room', () => {
    expect(new Set(works.map(work => work.id)).size).toBe(18);
    for (const room of rooms) expect(works.filter(work => work.category === room.slug)).toHaveLength(3);
    for (const work of works) {
      expect(work.description.length).toBeGreaterThan(80);
      expect(work.facts).toHaveLength(2);
      expect(getWork(work.category, work.id)).toBe(work);
    }
  });
});

describe('Experiences', () => {
  it.each(rooms)('previews a work and opens its full record in $slug', async room => {
    const user = userEvent.setup();
    const work = works.find(item => item.category === room.slug)!;
    open(`/${room.slug}?source=demo`);
    await user.click(screen.getByRole('button', { name: `Quick preview: ${work.title}` }));
    const dialog = screen.getByRole('dialog', { name: `Quick Preview: ${work.title}` });
    expect(within(dialog).getByRole('heading', { name: work.title })).toBeInTheDocument();
    expect(within(dialog).getByText(work.description)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('link', { name: 'Open full record' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: work.title })).toBeInTheDocument();
    expect(screen.getByText(work.note)).toBeInTheDocument();
    expect(document.title).toBe(`NOCTIS — ${work.title}`);
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it.each(works)('supports direct deep link $category/$id', work => {
    open(workPath(work));
    expect(screen.getByRole('heading', { level: 1, name: work.title })).toBeInTheDocument();
    expect(screen.getByText(/This work, its creator and its metadata are fictional/)).toBeInTheDocument();
  });

  it('combines format and title filters, clears empty results and preserves filters through detail navigation', async () => {
    const user = userEvent.setup();
    open('/books?source=demo');
    await user.click(screen.getByRole('button', { name: 'Poetry' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 work');
    expect(screen.queryByRole('heading', { name: 'An Atlas of Silence' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'no match');
    expect(screen.getByRole('status')).toHaveTextContent('0 works');
    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByRole('status')).toHaveTextContent('5 works');
    await user.type(screen.getByRole('searchbox'), 'ELENA');
    expect(screen.getByRole('status')).toHaveTextContent('1 work');
    await user.click(screen.getByRole('link', { name: 'An Atlas of Silence' }));
    await user.click(screen.getByRole('link', { name: 'Back to the collection' }));
    expect(screen.getByRole('searchbox')).toHaveValue('ELENA');
    expect(screen.getByRole('status')).toHaveTextContent('1 work');
  });

  it('accepts a filter in the URL and tolerates an unknown format', () => {
    open('/films?format=Unknown&q=signal&source=demo');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('1 work');
    expect(screen.getByRole('link', { name: 'Signal from Room Nine' })).toBeInTheDocument();
  });

  it.each(rooms)('filters by a category-specific format in $slug', async room => {
    const user = userEvent.setup();
    const local = works.filter(work => work.category === room.slug);
    const format = local[1].format;
    open(`/${room.slug}?source=demo`);
    await user.click(screen.getByRole('button', { name: format }));
    const expected = local.filter(work => work.format === format);
    expect(screen.getAllByRole('article')).toHaveLength(expected.length);
    for (const work of expected) expect(screen.getByRole('link', { name: work.title })).toBeInTheDocument();
  });

  it('marks the containing room active on a detail page', async () => {
    const user = userEvent.setup();
    open('/music/rooms-for-rain');
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('link', { name: 'Music' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('opens a related record and keeps the return destination', async () => {
    const user = userEvent.setup();
    open('/art/a-study-in-absence');
    await user.click(screen.getByRole('link', { name: /Folded Horizon/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Folded Horizon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the collection' })).toHaveAttribute('href', '/art');
  });

  it('closes a preview and restores focus to its card', async () => {
    const user = userEvent.setup();
    open('/books?source=demo');
    const trigger = screen.getByRole('button', { name: 'Quick preview: An Atlas of Silence' });
    await user.click(trigger);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not stack global search over Quick Preview', async () => {
    const user = userEvent.setup();
    open('/music');
    await user.click(screen.getByRole('button', { name: 'Quick preview: Rooms for Rain' }));
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Quick Preview: Rooms for Rain');
  });

  it.each(['/books/missing', '/books/rooms-for-rain'])('shows record 404 for %s', async path => {
    open(path);
    expect(await screen.findByRole('heading', { name: 'This record is out of reach.' })).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  it.each(rooms)('shows $slug immediately without entry effects when reduced motion is requested', room => {
    preferences.reduced = true;
    open(`/${room.slug}?source=demo`);
    expect(screen.getByTestId('room-entrance')).toHaveAttribute('data-motion', 'reduced');
    expect(screen.queryByRole('button', { name: /Replay/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: room.name })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3 works');
  });

  it('replays only the decorative entrance, preserving the filter', async () => {
    const user = userEvent.setup();
    open('/games?format=Puzzle&source=demo');
    await user.click(screen.getByRole('button', { name: /Replay games/ }));
    expect(screen.getByRole('button', { name: 'Puzzle' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('1 work');
  });
});



