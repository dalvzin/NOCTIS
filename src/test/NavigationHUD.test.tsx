import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../app/App';
import { NoctisWordmark } from '../components/brand/NoctisWordmark';

function open(path = '/') { return render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>); }
afterEach(cleanup);
describe('Stage 06.2 brand and HUD', () => {
 it('exposes the brand as NOCTIS while retaining the original glyph', () => {
  const { container } = render(<NoctisWordmark split/>);
  expect(screen.getByRole('img', { name: 'NOCTIS' })).toHaveTextContent('N◦CTIS');
  const parts = container.querySelectorAll('[data-wordmark-part]');
  expect(parts).toHaveLength(2); expect(parts[0]).toHaveTextContent('N◦C'); expect(parts[1]).toHaveTextContent('TIS');
 });
 it('uses one glyph in header, cinematic intro and footer without changing the page title', () => {
  const { container } = open();
  expect(container.querySelector('header a')).toHaveTextContent('N◦CTIS');
  expect(container.querySelector('[data-split]')).toHaveTextContent('N◦CTIS');
  expect(screen.getByRole('link', { name: /^NOCTIS$/ })).toHaveTextContent('N◦CTIS');
  expect(document.title).toContain('NOCTIS');
 });
 it('keeps the room active on a full record and hides unfinished account entries', async () => {
  const user=userEvent.setup();open('/books/gutenberg:books:84');
  await user.click(screen.getByRole('button',{name:'Open menu'}));
  const menu=within(screen.getByRole('dialog',{name:'Navigation'}));
  expect(menu.getByRole('link',{name:/Books/})).toHaveAttribute('aria-current','page');
  expect(menu.getByRole('link',{name:'My Archive'})).toHaveAttribute('href','/my-archive');
  expect(menu.queryByRole('link',{name:'Account'})).not.toBeInTheDocument();
  expect(menu.queryByRole('link',{name:'Community Albums'})).not.toBeInTheDocument();
 });
 it('restores focus and scroll locking when the menu is cancelled', async () => {
  const user=userEvent.setup();open();const trigger=screen.getByRole('button',{name:'Open menu'});
  await user.click(trigger);expect(document.body.style.overflow).toBe('hidden');
  fireEvent(screen.getByRole('dialog'),new Event('cancel',{cancelable:true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();expect(document.body.style.overflow).toBe('');
 });
 it('closes on the backdrop but not on dialog content', async () => {
  const user=userEvent.setup();open();await user.click(screen.getByRole('button',{name:'Open menu'}));
  await user.click(screen.getByText('The Rooms'));expect(screen.getByRole('dialog')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('dialog'));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 });
 it('opens with Cmd K, focuses search and submits Enter to full results', async () => {
  const user=userEvent.setup();open();await user.keyboard('{Meta>}k{/Meta}');
  const input=screen.getByRole('searchbox',{name:'Search works'});expect(input).toHaveFocus();
  await user.type(input,'Frankenstein{Enter}');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Find something worth keeping');
 });
 it('does not steal Ctrl K from a work preview', async () => {
  const user=userEvent.setup();open();await user.click(screen.getByRole('button',{name:'Quick preview: Frankenstein'}));
  await user.keyboard('{Control>}k{/Control}');expect(screen.queryByRole('searchbox',{name:'Search works'})).not.toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
 });
 it('moves keyboard focus to the opened page after closing navigation', async () => {
  const user=userEvent.setup();open();await user.click(screen.getByRole('button',{name:'Open menu'}));
  await user.click(screen.getByRole('link',{name:'Settings'}));
  await waitFor(()=>expect(document.getElementById('main')).toHaveFocus());
 });
 it('keeps settings local without advertising account setup', () => {
  open('/settings');expect(screen.queryByRole('link',{name:'Open Account & privacy settings'})).not.toBeInTheDocument();
  expect(screen.getByText(/No account is required/)).toBeInTheDocument();
 });
});


