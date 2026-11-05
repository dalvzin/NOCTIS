import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { LocalArchiveRepository } from '../features/personal/repository';
import { PersonalProvider } from '../features/personal/context';
import { localCatalog } from '../services/catalog';
import { workPath } from '../data/works';
import { STORAGE_KEY } from '../features/personal/schema';
import { coverStore } from '../features/personal/images';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function fixture(raw?: string) {
  const values = new Map<string,string>(raw ? [[STORAGE_KEY,raw]] : []); let sequence=0;
  const storage = { getItem:(key:string)=>values.get(key)??null, setItem:(key:string,value:string)=>{values.set(key,value);}, removeItem:(key:string)=>{values.delete(key);} };
  const create = () => new LocalArchiveRepository({ storage:()=>storage, id:()=>`ui-${++sequence}`, listenToStorage:false });
  return { repo:create(), create, values };
}
function open(repo: LocalArchiveRepository, path: string) { return render(<PersonalProvider repository={repo}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></PersonalProvider>); }
const book = localCatalog.find(work=>work.category==='books'&&work.source.kind==='demo')!;
describe('Personal archive UI', () => {
  it('saves, wishes, half-star rates via a labeled keyboard control, and survives a fresh repository', async () => {
    const f=fixture(), user=userEvent.setup(); open(f.repo,workPath(book));
    const actions=screen.getByRole('region',{name:`Personal archive: ${book.title}`});
    await user.click(within(actions).getByRole('button',{name:'Save'}));
    await user.click(within(actions).getByRole('button',{name:'Want to Experience'}));
    const rating=within(actions).getByRole('combobox',{name:'My private rating'});
    await user.tab(); expect(rating).toHaveFocus();
    await user.selectOptions(rating,'4.5'); expect(rating).toHaveValue('4.5');
    cleanup(); open(f.create(),'/my-archive');
    expect(screen.getByRole('link',{name:'Saved (1)'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Want to Experience (1)'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'My Ratings (1)'})).toBeInTheDocument();
    expect(screen.getByText('My rating: 4.5 / 5')).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Saved'})); expect(screen.getByRole('link',{name:'Saved (0)'})).toBeInTheDocument(); expect(f.create().getSnapshot().data.entries[book.id].wanted).toBe(true);
  });
  it('creates an album from Quick Preview without recording history, then opens and edits its local route', async () => {
    const f=fixture(),user=userEvent.setup(); await f.repo.dispatch({type:'preferences',patch:{historyEnabled:true}}); open(f.repo,'/books?source=demo');
    await user.click(screen.getByRole('button',{name:`Quick preview: ${book.title}`})); const modal=screen.getByRole('dialog');
    await user.click(within(modal).getByText('Add to Album',{exact:true})); await user.type(within(modal).getByRole('textbox',{name:'New album title'}),'Connections'); await user.click(within(modal).getByRole('button',{name:'Create album with this work'}));
    expect(f.repo.getSnapshot().data.albums[0].workIds).toEqual([book.id]); expect(f.repo.getSnapshot().data.history).toEqual([]);
    const id=f.repo.getSnapshot().data.albums[0].id; cleanup(); open(f.create(),`/albums/${id}`);
    await user.click(screen.getByText('Edit album',{exact:true})); await user.clear(screen.getByRole('textbox',{name:'Album title'})); await user.type(screen.getByRole('textbox',{name:'Album title'}),'After hours'); await user.selectOptions(screen.getByRole('combobox',{name:'Layout preset'}),'editorial'); await user.click(screen.getByRole('button',{name:'Save album changes'}));
    expect(screen.getByRole('heading',{name:'After hours',level:1})).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox',{name:'Choose a work from this album'}),book.id); expect(f.create().getSnapshot().data.albums[0].cover).toEqual({kind:'work',workId:book.id});
    await user.click(screen.getByRole('button',{name:'Delete album'})); await user.click(screen.getByRole('button',{name:'Cancel'})); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Delete album'})); await user.click(screen.getByRole('button',{name:'Confirm'})); await waitFor(()=>expect(screen.getByRole('heading',{name:'My Archive'})).toBeInTheDocument()); expect(f.create().getSnapshot().data.albums).toEqual([]);
  });
  it('records full detail pages only after enabling, pauses, and confirms history clearing', async () => {
    const f=fixture(),user=userEvent.setup(); open(f.repo,workPath(book)); expect(f.repo.getSnapshot().data.history).toHaveLength(0); cleanup();
    open(f.repo,'/recently-explored'); await user.click(screen.getByRole('button',{name:'Enable history'})); cleanup(); open(f.repo,workPath(book)); await waitFor(()=>expect(f.repo.getSnapshot().data.history).toHaveLength(1)); cleanup();
    open(f.repo,'/settings'); await user.click(screen.getByRole('button',{name:'Pause history'})); await user.click(screen.getByRole('button',{name:'Clear history'})); expect(f.repo.getSnapshot().data.history).toHaveLength(1); await user.click(screen.getByRole('button',{name:'Confirm'})); await waitFor(()=>expect(f.repo.getSnapshot().data.history).toHaveLength(0)); cleanup(); open(f.repo,workPath(localCatalog[1])); expect(f.repo.getSnapshot().data.history).toHaveLength(0);
  });
  it('clears only personal metadata and covers after explicit confirmation', async () => {
    const f=fixture(),user=userEvent.setup(); f.values.set('unrelated','keep'); await f.repo.dispatch({type:'save',work:book,value:true}); const clear=vi.spyOn(coverStore,'clear').mockResolvedValue(undefined);
    open(f.repo,'/settings'); await user.click(screen.getByRole('button',{name:'Clear personal archive'})); expect(f.repo.getSnapshot().data.entries[book.id]).toBeDefined(); await user.click(screen.getByRole('button',{name:'Confirm'})); await waitFor(()=>expect(clear).toHaveBeenCalledOnce()); expect(f.values.has(STORAGE_KEY)).toBe(false); expect(f.values.get('unrelated')).toBe('keep');
  });
  it('displays corrupt data recovery without overwriting it', () => { const f=fixture('{damaged'); open(f.repo,'/settings'); expect(screen.getByRole('alert')).toHaveTextContent('damaged'); expect(screen.getByRole('button',{name:'Export recovery data'})).toBeInTheDocument(); expect(f.values.get(STORAGE_KEY)).toBe('{damaged'); });
  it('opens a retained provider snapshot while its provider is offline', async () => {
    const f=fixture(); const snapshot={...book,id:'openlibrary:books:OL999W',legacyId:undefined,title:'An offline snapshot',source:{kind:'live' as const,provider:'openlibrary',externalId:'OL999W',label:'Open Library',url:'https://openlibrary.org/works/OL999W',attribution:'Source metadata: Open Library.'}};
    await f.repo.dispatch({type:'save',work:snapshot,value:true}); vi.mocked(fetch).mockRejectedValueOnce(new Error('offline')); open(f.create(),workPath(snapshot));
    expect(screen.getByRole('heading',{level:1,name:snapshot.title})).toBeInTheDocument(); await waitFor(()=>expect(screen.getByText(/Additional source details are unavailable/)).toBeInTheDocument()); expect(screen.getByRole('button',{name:'Saved'})).toHaveAttribute('aria-pressed','true');
  });
  it('shows an honest unavailable state for a local album URL on another browser', () => { open(fixture().repo,'/albums/other-browser'); expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Album unavailable in this browser'); });
});
