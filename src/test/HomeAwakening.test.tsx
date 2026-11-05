import { act,cleanup,fireEvent,render,screen,within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
const preference=vi.hoisted(()=>({reduced:false}));
vi.mock('../features/personal/context',async original=>({...await original<typeof import('../features/personal/context')>(),useMotionPreference:()=>preference.reduced}));
import { Home } from '../features/home/Home';
import { INTRO_SESSION_KEY } from '../features/home/useAwakening';
import { rooms } from '../data/rooms';

function open(){return render(<MemoryRouter><Home/></MemoryRouter>);}
function entrance(){return screen.getByRole('region',{name:/Not everything deserves/});}
beforeEach(()=>{sessionStorage.removeItem(INTRO_SESSION_KEY);preference.reduced=false;vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items:[],statuses:[]}))));vi.useFakeTimers();});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('The Awakening becomes the Living Mosaic',()=>{
 it('keeps all six semantic links in the same DOM throughout the 3.1 second sequence',()=>{
  open();const mosaic=screen.getByRole('navigation',{name:'Six cultural rooms'});const links=within(mosaic).getAllByRole('link');expect(links).toHaveLength(6);expect(entrance()).toHaveAttribute('data-phase','darkness');
  act(()=>vi.advanceTimersByTime(260));expect(entrance()).toHaveAttribute('data-phase','wordmark');
  act(()=>vi.advanceTimersByTime(690));expect(entrance()).toHaveAttribute('data-phase','opening');
  act(()=>vi.advanceTimersByTime(500));expect(entrance()).toHaveAttribute('data-phase','assembling');
  act(()=>vi.advanceTimersByTime(1650));expect(entrance()).toHaveAttribute('data-phase','ready');expect(screen.queryByRole('button',{name:'Skip intro'})).not.toBeInTheDocument();
  within(mosaic).getAllByRole('link').forEach((link,index)=>expect(link).toBe(links[index]));
 });
 it('skips immediately, clears pending transitions and remembers this session',()=>{
  open();fireEvent.click(screen.getByRole('button',{name:'Skip intro'}));expect(entrance()).toHaveAttribute('data-phase','ready');expect(entrance()).toHaveAttribute('data-instant','true');expect(screen.getByRole('link',{name:/The Reading Room/})).toHaveFocus();
  act(()=>vi.advanceTimersByTime(5000));expect(entrance()).toHaveAttribute('data-phase','ready');expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('seen');cleanup();open();expect(entrance()).toHaveAttribute('data-phase','ready');expect(screen.queryByRole('button',{name:'Skip intro'})).not.toBeInTheDocument();
 });
 it('shows the final composition directly on a return visit without making a network request',()=>{
  sessionStorage.setItem(INTRO_SESSION_KEY,'seen');const requests=vi.mocked(fetch).mock.calls.length;open();expect(entrance()).toHaveAttribute('data-phase','ready');expect(entrance()).toHaveAttribute('data-instant','true');expect(vi.mocked(fetch).mock.calls).toHaveLength(requests);
 });
 it('respects reduced motion from the start',()=>{
  preference.reduced=true;open();expect(entrance()).toHaveAttribute('data-reduced','true');expect(entrance()).toHaveAttribute('data-phase','ready');expect(screen.queryByRole('button',{name:'Skip intro'})).not.toBeInTheDocument();
 });
 it('finishes immediately when reduced motion is enabled during entry',()=>{
  const view=open();act(()=>vi.advanceTimersByTime(400));preference.reduced=true;view.rerender(<MemoryRouter><Home/></MemoryRouter>);expect(entrance()).toHaveAttribute('data-phase','ready');act(()=>vi.advanceTimersByTime(4000));expect(entrance()).toHaveAttribute('data-phase','ready');
 });
 it('does not restart the intro if reduced motion is subsequently turned off',()=>{
  const view=open();preference.reduced=true;view.rerender(<MemoryRouter><Home/></MemoryRouter>);preference.reduced=false;view.rerender(<MemoryRouter><Home/></MemoryRouter>);act(()=>vi.advanceTimersByTime(1000));expect(entrance()).toHaveAttribute('data-phase','ready');
 });
 it('makes essential navigation available during entry and reveals it on keyboard focus',()=>{
  open();const link=screen.getByRole('link',{name:/The Reading Room/});expect(link).toHaveAttribute('href','/books');expect(link.closest('[aria-hidden=true]')).toBeNull();act(()=>link.focus());expect(link).toHaveFocus();expect(entrance()).toHaveAttribute('data-phase','ready');
 });
 it.each(rooms)('preserves the $slug route and accessible room name',room=>{
  open();expect(screen.getByRole('link',{name:new RegExp(room.name)})).toHaveAttribute('href',`/${room.slug}`);
 });
 it('keeps real editorial works below the mosaic with lazy images and no fabricated popularity',()=>{
  open();for(const title of ['Frankenstein','Journey','Ambient 2 (The Plateaux of Mirror)','Metropolis','Migrant Mother','The Bedroom'])expect(screen.getByRole('heading',{name:title})).toBeInTheDocument();
  expect(screen.getByText(/never a popularity ranking/)).toBeInTheDocument();for(const image of screen.getAllByRole('img'))expect(image).toHaveAttribute('loading','lazy');
 });
 it('marks offscreen scenes for pausing and disconnects its observer on unmount',()=>{
  let callback:IntersectionObserverCallback=()=>{};const disconnect=vi.fn();vi.stubGlobal('IntersectionObserver',class{constructor(fn:IntersectionObserverCallback){callback=fn;}observe=vi.fn();disconnect=disconnect;});
  const view=open();act(()=>callback([{isIntersecting:false} as IntersectionObserverEntry],{} as IntersectionObserver));expect(entrance()).toHaveAttribute('data-visible','false');view.unmount();expect(disconnect).toHaveBeenCalledOnce();
 });
 it('remains usable and skippable if session storage is blocked',()=>{
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('Storage blocked');});vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('Storage blocked');});open();fireEvent.click(screen.getByRole('button',{name:'Skip intro'}));expect(entrance()).toHaveAttribute('data-phase','ready');
 });
});
