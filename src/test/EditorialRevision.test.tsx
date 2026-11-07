import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { manuscriptSpread } from './manuscriptHelpers';
import { curatedWorks } from '../data/curated';
import { works, workPath } from '../data/works';
import { rooms } from '../data/rooms';
import { afterHoursStops, quietThread } from '../data/editorialPaths';
import { clearCatalogCache, findKnown, localSearch, searchCatalog, withKnownArtwork } from '../services/catalog';
import { safeArtworkUrl, safeExternalUrl } from '../services/catalogUtils';
import { workCount } from '../services/format';
import { LocalArchiveRepository } from '../features/personal/repository';
import { PersonalProvider } from '../features/personal/context';
import { AlbumCover } from '../features/personal/AlbumTools';
import { STORAGE_KEY, compactWork, validateArchive } from '../features/personal/schema';

function fixture(){const values=new Map<string,string>();const create=()=>new LocalArchiveRepository({storage:()=>({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);},removeItem:key=>{values.delete(key);}}),listenToStorage:false});return{values,create,repo:create()};}
function open(path:string,repo?:LocalArchiveRepository){const content=<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>;return render(repo?<PersonalProvider repository={repo}>{content}</PersonalProvider>:content);}
beforeEach(()=>{clearCatalogCache();vi.mocked(fetch).mockImplementation(async url=>new Response(JSON.stringify(String(url).includes('/status')?[]:{items:[],statuses:[]})));});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('Editorial reliability increment',()=>{
 it('offers only complete real works in the main catalog, retaining every legacy identifier',()=>{
  expect(curatedWorks).toHaveLength(17);expect(new Set(curatedWorks.map(work=>work.id)).size).toBe(17);
  for(const room of rooms)expect(localSearch('',room.slug).length).toBeGreaterThanOrEqual(2);
  for(const work of localSearch('')){expect(work.source.kind).toBe('curated');expect(work.image?.alt).toBeTruthy();expect(safeArtworkUrl(work.image?.url)).toBeTruthy();expect(work.description.length).toBeGreaterThan(60);}
  for(const work of works)expect(findKnown(work.category,work.legacyId??work.id)?.id).toBe(work.id);
 });
 it('allows only verified bundled paths as relative artwork, never as destinations',()=>{
  expect(safeArtworkUrl('/artworks/bedroom.jpg')).toBe('/artworks/bedroom.jpg');
  for(const url of ['/api/catalog/status','/artworks/../private.jpg','//example.org/evil.jpg','/artworks/file.svg'])expect(safeArtworkUrl(url)).toBeUndefined();
  expect(safeExternalUrl('/artworks/bedroom.jpg')).toBeUndefined();
 });
 it('repairs old museum image presentation without replacing a chosen book edition',()=>{
  const bedroom=curatedWorks.find(work=>work.id==='aic:art:28560')!;
  expect(withKnownArtwork({...bedroom,image:{...bedroom.image!,url:'https://www.artic.edu/iiif/2/old/full/843,/0/default.jpg'}}).image?.url).toBe('/artworks/bedroom.jpg');
  expect(withKnownArtwork({...bedroom,source:{kind:'live',provider:'aic',externalId:'28560',label:'Art Institute of Chicago',attribution:'Art Institute of Chicago'},image:{...bedroom.image!,url:'https://www.artic.edu/iiif/2/old/full/843,/0/default.jpg'}}).image?.url).toBe('/artworks/bedroom.jpg');
  const book=curatedWorks[0],edition={...book.image!,url:'https://covers.openlibrary.org/b/id/123-L.jpg',sourceUrl:'https://openlibrary.org/books/OL123M'};
  expect(withKnownArtwork({...book,image:edition}).image).toBe(edition);
 });
 it('keeps the editorial selection useful when external search fails',async()=>{
  vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));const result=await searchCatalog('Frankenstein','books');
  expect(result.items.map(work=>work.title)).toContain('Frankenstein');expect(result.statuses[0].state).toBe('error');
 });
 it('distinguishes incomplete online lookup from a true empty result',async()=>{
  vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));open('/search?q=unavailable-unique-work');
  expect(await screen.findByRole('heading',{name:'Online search is incomplete.'})).toBeInTheDocument();
  expect(screen.getByText(/does not mean the work does not exist/)).toBeInTheDocument();
 });
 it('keeps the room breadcrumb independent of the saved search query',async()=>{
  const user=userEvent.setup();open('/search?q=Frankenstein');await user.click(screen.getByRole('link',{name:'Frankenstein'}));
  await manuscriptSpread(user,'identity');
  expect(screen.getByRole('link',{name:'The Reading Room'})).toHaveAttribute('href','/books');
  for(const link of screen.getAllByRole('link',{name:/Back to search results/}))expect(link).toHaveAttribute('href','/search?q=Frankenstein');
 });
 it('preserves previously saved demonstrations and album memberships',async()=>{
  const f=fixture(),legacy=works[0];await f.repo.dispatch({type:'save',work:legacy,value:true});await f.repo.dispatch({type:'createAlbum',fields:{title:'Existing album',description:'',accent:'bronze',layout:'grid'},work:legacy});
  const before=f.values.get(STORAGE_KEY);open('/my-archive',f.create());expect(screen.getByRole('link',{name:legacy.title})).toBeInTheDocument();
  expect(f.values.get(STORAGE_KEY)).toBe(before);expect(f.create().getSnapshot().data.albums[0].workIds).toEqual([legacy.id]);
 });
 it('keeps local artwork references compatible with personal snapshots',async()=>{
  const f=fixture();await f.repo.dispatch({type:'save',work:curatedWorks[0],value:true});
  expect(validateArchive(JSON.parse(f.values.get(STORAGE_KEY)!))).toBe(true);expect(compactWork(curatedWorks[0]).image?.url).toMatch(/^\/artworks\//);
 });
 it('uses singular and plural work counts',()=>{expect(workCount(0)).toBe('0 works');expect(workCount(1)).toBe('1 work');expect(workCount(2)).toBe('2 works');});
});
describe('Editorial pilot increment',()=>{
 it('removes community promises and guides collection changes with focus and feedback',async()=>{
  const user=userEvent.setup();open('/discover');expect(screen.queryByRole('link',{name:/Open community/})).not.toBeInTheDocument();
  await user.click(screen.getByRole('link',{name:/The spaces we inhabit/}));
  const selection=screen.getByRole('region',{name:'The spaces we inhabit'});await waitFor(()=>expect(selection).toHaveFocus());
  expect(screen.getByRole('status')).toHaveTextContent('Now showing The spaces we inhabit. 3 works.');
 });
 it('shows distinct notes for the three real books in the pilot',()=>{
  open('/books');expect(screen.getByRole('heading',{name:'On the reading table.'})).toBeInTheDocument();
  expect(screen.getByText(/A creature learns the world by watching it/)).toBeInTheDocument();expect(screen.queryByRole('link',{name:'An Atlas of Silence'})).not.toBeInTheDocument();
 });
 it('builds an automatic album cover without overwriting the stored cover choice',async()=>{
  const f=fixture();await f.repo.dispatch({type:'createAlbum',fields:{title:'Automatic',description:'',accent:'bronze',layout:'grid'},work:curatedWorks[0]});
  const before=f.values.get(STORAGE_KEY),album=f.repo.getSnapshot().data.albums[0];render(<PersonalProvider repository={f.repo}><AlbumCover album={album}/></PersonalProvider>);
  expect(screen.getByRole('img')).toHaveAttribute('src',curatedWorks[0].image!.url);expect(f.values.get(STORAGE_KEY)).toBe(before);expect(album.cover.kind).toBe('none');
 });
 it('gives each editorial passage an actual destination in another medium',()=>{
  const thread=quietThread.map(step=>curatedWorks.find(work=>work.id===step.id)!);
  expect(new Set(thread.map(work=>work.category)).size).toBe(3);expect(quietThread.every(step=>step.passage.length>40)).toBe(true);
 });
 it('keeps complete source credits expandable in Quick Preview and closes with Escape',async()=>{
  const user=userEvent.setup();open('/search?q=Frankenstein');const trigger=screen.getByRole('button',{name:'Quick preview: Frankenstein'});await user.click(trigger);
  const dialog=screen.getByRole('dialog');expect(within(dialog).getByRole('link',{name:'Open full record'})).toBeVisible();
  await user.click(within(dialog).getByText('Image credit'));expect(within(dialog).getByRole('link',{name:/Image source/})).toBeVisible();
  fireEvent(dialog,new Event('cancel',{cancelable:true}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
 });
});
describe('Localized After Hours experiment',()=>{
 it('connects three real media and exposes equivalent ordinary links and previews',async()=>{
  const user=userEvent.setup();open('/discover/after-hours');const city=screen.getByRole('navigation',{name:'Three illuminated rooms'});
  expect(within(city).getAllByRole('link')).toHaveLength(3);expect(new Set(afterHoursStops.map(stop=>curatedWorks.find(work=>work.id===stop.id)!.category)).size).toBe(3);
  for(const stop of afterHoursStops){const work=curatedWorks.find(work=>work.id===stop.id)!;expect(within(city).getByRole('link',{name:`Explore ${work.title}`})).toHaveAttribute('href',workPath(work));expect(screen.getByRole('link',{name:work.title})).toHaveAttribute('href',workPath(work));}
  await user.click(screen.getByRole('button',{name:'Quick preview: The Bedroom'}));expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.click(screen.getByRole('link',{name:'Open full record'}));
  expect(screen.getByRole('link',{name:'The Gallery'})).toHaveAttribute('href','/art');
  await user.click(screen.getByRole('link',{name:'Back to the exhibition'}));
  expect(screen.getByRole('navigation',{name:'Three illuminated rooms'})).toBeInTheDocument();
 });
 it('keeps all exhibition links and content present with internal reduced motion',async()=>{
  const f=fixture();await f.repo.dispatch({type:'preferences',patch:{motion:'reduce'}});const {container}=open('/discover/after-hours',f.repo);
  expect(container.querySelector('[data-reduced]')).toHaveAttribute('data-reduced','true');expect(screen.getByRole('link',{name:'Explore Metropolis'})).toBeVisible();expect(screen.getByText(/From imagined towers to a real ship/)).toBeInTheDocument();
 });
});
