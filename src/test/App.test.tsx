import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../app/App';
import { rooms, personalPages } from '../data/rooms';
afterEach(cleanup);
function open(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
describe('Stage 01', () => {
  it('scrolls and focuses a collection opened through a direct fragment URL', async () => {
    open('/photography#collection');
    const collection = screen.getByRole('region', { name: 'An invitation to explore.' });
    await waitFor(() => expect(collection).toHaveFocus());
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'auto',
    });
  });
  it('shows the invitation and six room links', () => {
    open();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Not everything');
    for (const room of rooms)
      expect(screen.getAllByRole('link', { name: new RegExp(room.name) })[0]).toHaveAttribute(
        'href',
        `/${room.slug}`,
      );
  });
  it.each(rooms)('opens $slug directly', (room) => {
    open(`/${room.slug}?source=demo`);
    expect(screen.getByRole('heading', { level: 1, name: room.name })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      room.slug === 'photography' ? '4 works' : '3 works',
    );
  });
  it.each(personalPages)('opens the local personal page $slug', (page) => {
    open(`/${page.slug}`);
    expect(screen.getByRole('heading', { name: page.title })).toBeInTheDocument();
    expect(screen.getAllByText(/Stored in this browser/).length).toBeGreaterThan(0);
  });
  it('handles unknown URLs', () => {
    open('/missing');
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });
  it('filters the search shell, handles empty results and navigates', async () => {
    const user = userEvent.setup();
    open();
    await user.keyboard('{Control>}k{/Control}');
    const input = screen.getByRole('searchbox', { name: 'Search works' });
    await user.type(input, 'zzzz');
    expect(await screen.findByText(/No works found/)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'music');
    await user.click(screen.getByRole('link', { name: 'Music' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'The Listening Room' }),
    ).toBeInTheDocument();
  });
  it('closes menu after navigation and marks active destination', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'Books' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Reading Room' })).toBeInTheDocument();
  });
  it('opens the archive alias without losing the selected tab', async () => {
    open('/archive?tab=albums');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'My Archive' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /My Albums/ })).toHaveAttribute('aria-current', 'page');
  });
  it('opens discovery', () => {
    open('/discover');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Let curiosity');
  });
});
