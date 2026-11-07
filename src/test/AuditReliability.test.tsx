import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCatalog, clearCatalogCache } from '../services/catalog';
import { useCatalogSearch } from '../hooks/useCatalogSearch';
import { normalizeOpenLibrary, normalizeAic } from '../services/providers';
import type { SearchResponse } from '../types/catalog';
import { ProviderNotice } from '../features/discovery/ProviderNotice';

const book = normalizeOpenLibrary({key:'/works/OL123W',title:'External book fixture',author_name:['Fixture author']})!;
const art = normalizeAic({id:123,title:'External art fixture',is_public_domain:false})!;
const reply = (data: SearchResponse) => new Response(JSON.stringify(data));
afterEach(()=>{cleanup();clearCatalogCache();vi.mocked(fetch).mockReset().mockImplementation(async()=>reply({items:[],statuses:[]}));});

describe('Independent search and current-query reliability',()=>{
  it('does not suggest retry for missing configuration and disables retry while a real failure is being retried',()=>{
    const retry=vi.fn();const status={category:'films' as const,label:'TMDB',state:'unavailable' as const,message:'Not connected: explicit fixture'};
    const view=render(<ProviderNotice statuses={[status]} loading={false} retry={retry}/>);
    expect(screen.queryByRole('button',{name:'Try online search again'})).not.toBeInTheDocument();
    view.rerender(<ProviderNotice statuses={[{...status,state:'error'}]} loading={false} retry={retry}/>);
    fireEvent.click(screen.getByRole('button',{name:'Try online search again'}));expect(retry).toHaveBeenCalledOnce();
    view.rerender(<ProviderNotice statuses={[{...status,state:'error'}]} loading retry={retry}/>);
    expect(screen.getByRole('button',{name:'Try online search again'})).toBeDisabled();
  });
  it('exposes one provider’s results while another is pending and retains local matches',async()=>{
    let finishArt!: (response:Response)=>void;
    vi.mocked(fetch).mockImplementation(async input=>{
      const url=new URL(String(input),'https://fixture.invalid'); const category=url.searchParams.get('category')!;
      if(category==='art')return new Promise<Response>(resolve=>{finishArt=resolve;});
      return reply({items:category==='books'?[book]:[],statuses:[{category:category as 'books',label:category,state:category==='books'?'success':'unavailable',message:'Explicit test fixture'}]});
    });
    const progress:SearchResponse[]=[];
    const pending=searchCatalog('Frankenstein','',undefined,result=>progress.push(result));
    await waitFor(()=>expect(progress.some(result=>result.items.some(item=>item.id===book.id))).toBe(true));
    expect(progress.at(-1)!.items.some(item=>item.id==='gutenberg:books:84')).toBe(true);
    expect(progress.at(-1)!.items.some(item=>item.id===art.id)).toBe(false);
    finishArt(reply({items:[art],statuses:[{category:'art',label:'Museum fixture',state:'success',message:'Searched fixture'}]}));
    const result=await pending;expect(result.items.map(item=>item.id)).toEqual(expect.arrayContaining([book.id,art.id,'gutenberg:books:84']));
  });
  it('retries the current query after a failure while preserving local records',async()=>{
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Unavailable',{status:503})).mockResolvedValue(reply({items:[book],statuses:[{category:'books',label:'Book fixture',state:'success',message:'Searched fixture'}]}));
    const hook=renderHook(()=>useCatalogSearch('Frankenstein','books'));
    expect(hook.result.current.items.some(item=>item.id==='gutenberg:books:84')).toBe(true);
    await waitFor(()=>expect(hook.result.current.statuses[0]?.state).toBe('error'));
    act(()=>hook.result.current.retry());
    expect(hook.result.current.items.some(item=>item.id==='gutenberg:books:84')).toBe(true);
    await waitFor(()=>expect(hook.result.current.items.some(item=>item.id===book.id)).toBe(true));
    expect(vi.mocked(fetch).mock.calls.every(([url])=>String(url).includes('q=Frankenstein'))).toBe(true);
  });
  it('does not let a stale response replace a newer query even when transport ignores abort',async()=>{
    let finishOld!: (response:Response)=>void;
    vi.mocked(fetch).mockImplementation(async input=>String(input).includes('q=oldquery')?new Promise<Response>(resolve=>{finishOld=resolve;}):reply({items:[],statuses:[]}));
    const hook=renderHook(({query})=>useCatalogSearch(query,'books'),{initialProps:{query:'oldquery'}});
    await waitFor(()=>expect(finishOld).toBeTypeOf('function'));
    hook.rerender({query:'Frankenstein'});
    await waitFor(()=>expect(hook.result.current.loading).toBe(false));
    await act(async()=>{finishOld(reply({items:[book],statuses:[]}));});
    expect(hook.result.current.items.some(item=>item.id===book.id)).toBe(false);
    expect(hook.result.current.items.some(item=>item.id==='gutenberg:books:84')).toBe(true);
  });
});
