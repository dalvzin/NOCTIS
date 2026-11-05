import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach,describe,expect,it,vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CloudRepository } from '../features/accounts/CloudRepository';
import { emptyArchive, compactWork } from '../features/personal/schema';
import { importPayload } from '../features/accounts/migration';
import { validPublicConfig,safeNext } from '../services/supabase';
import { App } from '../app/App';
import { works } from '../data/works';
afterEach(cleanup);
describe('Account setup and guest paths',()=>{
 it('accepts public keys only and rejects secret/service-role keys',()=>{
  expect(validPublicConfig('https://project.supabase.co','sb_publishable_test')).toBe(true);
  expect(validPublicConfig('https://project.supabase.co','sb_secret_test')).toBe(false);
  expect(validPublicConfig('https://project.supabase.co',`a.${btoa(JSON.stringify({role:'service_role'}))}.c`)).toBe(false);
  expect(validPublicConfig('http://untrusted.example','sb_publishable_test')).toBe(false);
 });
 it('does not permit open redirects through sign-in return paths',()=>{
  expect(safeNext('//evil.example')).toBe('/account');expect(safeNext('/\\evil')).toBe('/account');expect(safeNext('https://evil.example')).toBe('/account');expect(safeNext('/community')).toBe('/community');
 });
 it.each(['/account','/auth','/community'])('shows an honest unconfigured state at %s',async path=>{
  render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);expect(await screen.findByText(/not configured/i)).toBeInTheDocument();expect(screen.queryByRole('textbox',{name:'Email'})).not.toBeInTheDocument();
 });
 it('excludes history-only snapshots and recording preference unless separately consented',()=>{
  const local=emptyArchive(),work=compactWork(works[0]);local.entries[work.id]={work,saved:false,wanted:false,rating:null,updatedAt:new Date().toISOString()};local.history=[{id:'visit',workId:work.id,visitedAt:new Date().toISOString()}];local.preferences.historyEnabled=true;
  expect(importPayload(local,false).entries).toEqual({});expect(importPayload(local,false).preferences.historyEnabled).toBe(false);expect(importPayload(local,true).history).toHaveLength(1);expect(local.history).toHaveLength(1);
 });
});
describe('Cloud repository confirmation and failure isolation',()=>{
 it('does not publish data returned for a different authenticated identity',async()=>{
  const rpc=vi.fn().mockResolvedValue({data:{...emptyArchive(),accountId:'account-b'},error:null});const repo=new CloudRepository({rpc} as unknown as SupabaseClient,'account-a');await repo.reload();expect(repo.getSnapshot().blocked).toBe(true);expect(repo.getSnapshot().error).toContain('identity changed');
 });
 it('waits for reload and server confirmation, and retains the last confirmed state on failure',async()=>{
  const data={...emptyArchive(),accountId:'account-a'};const rpc=vi.fn().mockResolvedValueOnce({data,error:null});const repo=new CloudRepository({rpc} as unknown as SupabaseClient,'account-a');
  expect(repo.getSnapshot().blocked).toBe(true);await repo.reload();expect(repo.getSnapshot().blocked).toBe(false);
  rpc.mockResolvedValueOnce({data:null,error:{message:'Network unavailable'}});
  expect((await repo.dispatch({type:'save',work:works[0],value:true})).ok).toBe(false);expect(repo.getSnapshot().data.entries).toEqual({});expect(repo.getSnapshot().error).toContain('not confirmed');
 });
 it('handles thrown transport errors and rejects malformed snapshots',async()=>{
  const rpc=vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({data:{version:99},error:null});const repo=new CloudRepository({rpc} as unknown as SupabaseClient,'account-b');
  await repo.reload();expect(repo.getSnapshot().error).toBe('Offline');await repo.reload();expect(repo.getSnapshot().blocked).toBe(true);
 });
 it('serializes writes so a concurrent reload cannot overwrite a later confirmed change',async()=>{
  const data={...emptyArchive(),accountId:'account-a'};let release:(value:unknown)=>void=()=>{};const rpc=vi.fn().mockResolvedValueOnce({data,error:null}).mockImplementationOnce(()=>new Promise(resolve=>{release=resolve;})).mockResolvedValueOnce({data,error:null});
  const repo=new CloudRepository({rpc} as unknown as SupabaseClient,'account-a');await repo.reload();
  const write=repo.dispatch({type:'preferences',patch:{motion:'reduce'}});const reload=repo.reload();await waitFor(()=>expect(rpc).toHaveBeenCalledTimes(2));release({data:{data:{...data,preferences:{...data.preferences,motion:'reduce'}}},error:null});await write;await reload;expect(rpc).toHaveBeenCalledTimes(3);
 });
});
