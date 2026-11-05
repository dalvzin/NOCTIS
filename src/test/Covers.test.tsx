import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PersonalProvider } from '../features/personal/context';
import { LocalArchiveRepository } from '../features/personal/repository';
import { AlbumCover, CoverEditor } from '../features/personal/AlbumTools';
import { coverStore } from '../features/personal/images';
import { changeAlbumCover, uploadAlbumCover } from '../features/personal/covers';
import { curatedWorks } from '../data/curated';
import { usePersonalArchive } from '../features/personal/context';
import { artworkUrls } from '../services/artwork';
import { ItemImage } from '../features/discovery/ItemImage';
import { normalizeOpenLibrary, musicArtwork } from '../services/providers';
import { fetchWork, searchCatalog, withKnownArtwork } from '../services/catalog';

const blobs = new Map<string, Blob>();
beforeEach(() => {
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items:[],statuses:[]}))));
  blobs.clear();
  vi.spyOn(coverStore,'get').mockImplementation(async id => blobs.get(id));
  vi.spyOn(coverStore,'put').mockImplementation(async (id,blob) => { blobs.set(id,blob); return id; });
  vi.spyOn(coverStore,'remove').mockImplementation(async id => { blobs.delete(id); });
  vi.stubGlobal('createImageBitmap',vi.fn(async()=>({width:320,height:180,close:vi.fn()})));
  vi.stubGlobal('URL',class extends URL { static createObjectURL = vi.fn(()=>`blob:fixture-${crypto.randomUUID()}`); static revokeObjectURL=vi.fn(); });
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function fixture() {
  const values = new Map<string,string>(); let fail=false;
  const storage = {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{if(fail)throw new DOMException('Full','QuotaExceededError');values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
  const create=()=>new LocalArchiveRepository({storage:()=>storage,listenToStorage:false}); const repo=create();
  const result=await repo.dispatch({type:'createAlbum',fields:{title:'Artwork connections',description:'',accent:'bronze',layout:'grid'},work:curatedWorks[0]});
  const album=()=>repo.getSnapshot().data.albums[0];
  return {repo,album,create,id:result.id!,fail:()=>{fail=true;}};
}
function Editor() {const {data}=usePersonalArchive();return <><AlbumCover album={data.albums[0]}/><CoverEditor album={data.albums[0]}/></>;}
describe('Album covers',()=>{
  it('uploads, immediately renders, replaces, refreshes, selects artwork and removes a cover',async()=>{
    const f=await fixture(),user=userEvent.setup();render(<PersonalProvider repository={f.repo}><Editor/></PersonalProvider>);
    const input=screen.getByLabelText(/Upload a local cover/);
    await user.upload(input,new File(['first'],'first.png',{type:'image/png'}));
    await screen.findByRole('img',{name:/Uploaded cover/}); const first=f.album().cover;
    expect(first.kind).toBe('upload'); expect(blobs.size).toBe(1);
    await user.upload(input,new File(['second'],'second.webp',{type:'image/webp'}));
    await waitFor(()=>expect(f.album().cover).not.toEqual(first)); expect(blobs.size).toBe(1);
    cleanup();render(<PersonalProvider repository={f.create()}><Editor/></PersonalProvider>); await screen.findByRole('img',{name:/Uploaded cover/});
    await user.selectOptions(screen.getByLabelText('Choose a work from this album'),curatedWorks[0].id);
    await screen.findByRole('img',{name:curatedWorks[0].image!.alt}); expect(blobs.size).toBe(0);
    await user.click(screen.getByRole('button',{name:'Remove cover'})); await waitFor(()=>expect(screen.queryByRole('img')).not.toBeInTheDocument());
    expect(f.create().getSnapshot().data.albums[0].cover.kind).toBe('none');
  });
  it('preserves the old cover and removes the uncommitted Blob if metadata storage fails',async()=>{
    const f=await fixture(); await uploadAlbumCover(f.repo,f.album(),new File(['a'],'a.png',{type:'image/png'}));const previous=f.album().cover;f.fail();
    expect((await uploadAlbumCover(f.repo,f.album(),new File(['b'],'b.png',{type:'image/png'}))).ok).toBe(false);
    expect(f.album().cover).toEqual(previous);expect(blobs.size).toBe(1);
  });
  it('keeps metadata unchanged if IndexedDB is full, and does not leak a success state',async()=>{
    const f=await fixture();vi.mocked(coverStore.put).mockRejectedValueOnce(new Error('Image storage is full.'));
    render(<PersonalProvider repository={f.repo}><Editor/></PersonalProvider>);await userEvent.upload(screen.getByLabelText(/Upload a local cover/),new File(['a'],'a.png',{type:'image/png'}));
    expect(await screen.findByRole('status')).toHaveTextContent('Image storage is full.');expect(f.album().cover.kind).toBe('none');expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('releases Blob URLs when a cover is removed and handles missing stored Blobs',async()=>{
    const f=await fixture();await f.repo.dispatch({type:'updateAlbum',id:f.id,fields:{cover:{kind:'upload',imageId:'missing'}}});render(<PersonalProvider repository={f.repo}><Editor/></PersonalProvider>);
    expect(await screen.findByText('Cover unavailable in this browser')).toBeInTheDocument();
    await uploadAlbumCover(f.repo,f.album(),new File(['x'],'x.jpg',{type:'image/jpeg'}));await screen.findByRole('img',{name:/Uploaded cover/});
    await changeAlbumCover(f.repo,f.album(),{kind:'none'});await waitFor(()=>expect(URL.revokeObjectURL).toHaveBeenCalled());
  });
});
describe('Artwork association and fallback',()=>{
  it.each(['books','films','games','music','photography','art'])('shows verified %s artwork, credit and failure fallback',category=>{
    const work=curatedWorks.find(item=>item.category===category&&item.image)!;expect(work).toBeDefined();render(<ItemImage work={work}/>);
    expect(screen.getByRole('img')).toHaveAttribute('src',artworkUrls(work.image,'preview')[0]);expect(screen.getByText(work.image!.credit)).toHaveTextContent(`${work.image!.credit} · ${work.image!.rights}`);
    for (const _ of artworkUrls(work.image,'preview')) fireEvent.error(screen.getByRole('img'));expect(screen.queryByRole('img')).not.toBeInTheDocument();expect(screen.getAllByText(/Source image unavailable/).length).toBeGreaterThan(0);
  });
  it('uses the provider cover ID and its exact edition, without title-based guessing',()=>{
    const work=normalizeOpenLibrary({key:'/works/OL123W',title:'Frankenstein',cover_i:456,cover_edition_key:'OL789M'})!;
    expect(work.image?.url).toContain('/id/456-L.jpg?default=false');expect(work.image?.sourceUrl).toBe('https://openlibrary.org/books/OL789M');expect(work.image?.alt).toContain('OL789M');
    expect(normalizeOpenLibrary({key:'/works/OL123W',title:'Frankenstein',cover_i:-1})!.image).toBeUndefined();
    expect(normalizeOpenLibrary({key:'/works/OL123W',title:'Frankenstein',covers:[-1,222]})!.image?.url).toContain('/id/222-L.jpg');
  });
  it('upgrades an old curated snapshot without replacing an already selected edition image',()=>{
    const original=curatedWorks[0]; expect(withKnownArtwork({...original,image:undefined}).image).toEqual(original.image);
    const edition={...original.image!,url:'https://covers.openlibrary.org/b/id/123-L.jpg?default=false',sourceUrl:'https://openlibrary.org/books/OL123M'};
    expect(withKnownArtwork({...original,image:edition}).image).toEqual(edition);
  });
  it('keeps an edition cover when the work-level detail has a different cover',async()=>{
    const search=normalizeOpenLibrary({key:'/works/OL9876W',title:'Edition fixture',cover_i:111,cover_edition_key:'OL111M'})!;
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({items:[search],statuses:[]})));
    await searchCatalog('edition-fixture-unique','books');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({item:normalizeOpenLibrary({key:'/works/OL9876W',title:'Edition fixture',covers:[222]})})));
    const detail=await fetchWork('books',search.id,undefined,true);expect(detail?.image).toEqual(search.image);
  });
  it('only accepts an approved front cover tied to the returned MusicBrainz release',()=>{
    const id='11111111-2222-3333-4444-555555555555',row={release:`https://musicbrainz.org/release/${id}`,images:[{front:true,approved:true,thumbnails:{large:`http://coverartarchive.org/release/${id}/123-500.jpg`}}]};
    expect(musicArtwork(row)?.sourceUrl).toBe(row.release);expect(musicArtwork(row)?.url).toMatch(/^https:/);
    expect(musicArtwork({...row,images:[{...row.images[0],approved:false}]})).toBeUndefined();
    expect(musicArtwork({...row,images:[{...row.images[0],thumbnails:{large:'https://attacker.invalid/image.jpg'}}]})).toBeUndefined();
    expect(musicArtwork({...row,release:'https://musicbrainz.org/release/other'})).toBeUndefined();
  });
});
