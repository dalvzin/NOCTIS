// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll,afterAll,describe,it,expect } from 'vitest';
import { parseArchive } from '../../src/features/personal/schema.ts';
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let db,privateId,publicId,share,remixId;
const work={id:'noctis:books:fixture',category:'books',title:'Fixture',creator:'Test author',year:2026,format:'Novel',description:'Fixture description',note:'',facts:[],palette:['#112233','#445566','#778899'],tags:[],source:{kind:'demo',provider:'noctis',label:'Fixture'},destinations:[],mediaPreviews:[]};
async function asUser(id){await db.exec(`reset role;set role ${id?'authenticated':'anon'};`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);}
async function rpc(name,args=[]){const result=await db.query(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,args);return result.rows[0].result;}
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; grant usage on schema storage to anon,authenticated; grant select,insert,delete on storage.objects to anon,authenticated;`);
 await db.exec(await readFile(new URL('../migrations/20261105000100_accounts.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../migrations/20261105000200_import.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1),($2)',[a,b]);
 await asUser(a);await rpc('archive_snapshot');await rpc('profile_update',[{username:'creator_a',display_name:'Creator A',is_public:true}]);
 const privateResult=await rpc('archive_mutate',[{type:'createAlbum',fields:{title:'Secret',description:'',accent:'bronze',layout:'grid'},work}]);privateId=privateResult.id;
 const publicResult=await rpc('archive_mutate',[{type:'createAlbum',fields:{title:'Public',description:'',accent:'bronze',layout:'grid'},work}]);publicId=publicResult.id;
 await rpc('album_publish',[publicId,'public',true,false]);await rpc('archive_mutate',[{type:'rate',work,rating:4.5}]);
 await asUser(b);await rpc('archive_snapshot');await rpc('profile_update',[{username:'creator_b',is_public:true}]);
},30000);
afterAll(async()=>{await db?.close();});
describe('Executed PostgreSQL authorization: guest, A and B',()=>{
 it('returns a snapshot compatible with the existing validated archive and rejects invalid half stars',async()=>{
  await asUser(a);const snapshot=await rpc('archive_snapshot');expect(()=>parseArchive(JSON.stringify(snapshot))).not.toThrow();await expect(rpc('archive_mutate',[{type:'rate',work,rating:4.7}])).rejects.toThrow();
 });
 it('guest cannot read a private album or owner entries, history or preferences',async()=>{
  await asUser(null);expect(await rpc('album_read',[privateId,null])).toBeNull();
  expect((await db.query('select * from public.albums where id=$1',[privateId])).rows).toEqual([]);
  await expect(db.query('select * from public.archive_entries')).rejects.toThrow();
  await expect(rpc('archive_snapshot')).rejects.toThrow();
 });
 it('B cannot read or edit A private data, including through RPCs',async()=>{
  await asUser(b);expect((await db.query('select * from public.archive_entries where user_id=$1',[a])).rows).toEqual([]);
  expect((await db.query('select * from public.user_preferences where user_id=$1',[a])).rows).toEqual([]);
  expect((await db.query('select * from public.browsing_history where user_id=$1',[a])).rows).toEqual([]);
  await expect(rpc('archive_mutate',[{type:'updateAlbum',id:privateId,fields:{title:'Stolen'}}])).rejects.toThrow('Album unavailable');
  await expect(db.query('update public.albums set owner_id=$1 where id=$2',[b,privateId])).rejects.toThrow();
 });
 it('rejects queued personal-data commands/imports when the active account changed',async()=>{
  await asUser(b);await expect(rpc('archive_mutate',[{type:'save',work,value:true,expectedUserId:a}])).rejects.toThrow('Account changed');
  await expect(rpc('archive_import',[{expectedUserId:a},false])).rejects.toThrow('Account changed');
  await expect(rpc('profile_update',[{id:a,display_name:'Wrong account'}])).rejects.toThrow('Account changed');
 });
 it('public album is guest-readable without exposing private profile or ratings',async()=>{
  await asUser(a);await rpc('profile_update',[{is_public:false}]);await asUser(null);
  const album=await rpc('album_read',[publicId,null]);expect(album.title).toBe('Public');expect(album.creator).toBeNull();expect(album.items[0].contributor).toBeNull();
  expect(await rpc('profile_read',['creator_a'])).toBeNull();
  await asUser(a);await rpc('profile_update',[{is_public:true}]);await asUser(null);expect((await rpc('profile_read',['creator_a'])).ratings).toEqual([]);
 });
 it('unlisted needs the exact capability and is excluded from table discovery',async()=>{
  await asUser(a);share=await rpc('album_publish',[privateId,'unlisted',false,false]);expect(share).toMatch(/^[a-f0-9]{64}$/);
  await asUser(null);expect(await rpc('album_read',[privateId,null])).toBeNull();expect(await rpc('album_read',[null,'0'.repeat(64)])).toBeNull();expect((await rpc('album_read',[null,share])).title).toBe('Secret');
  expect((await db.query('select * from public.albums where id=$1',[privateId])).rows).toEqual([]);
  await asUser(b);expect((await db.query('select * from public.album_shares')).rows).toEqual([]);
 });
 it('revocation invalidates the old token and private conversion invalidates all tokens',async()=>{
  await asUser(a);const old=share;share=await rpc('album_publish',[privateId,'unlisted',false,true]);await asUser(null);expect(await rpc('album_read',[null,old])).toBeNull();expect(await rpc('album_read',[null,share])).not.toBeNull();
  await asUser(a);await rpc('album_publish',[privateId,'private',false,false]);await asUser(null);expect(await rpc('album_read',[null,share])).toBeNull();
 });
 it('likes are unique, real counts, reversible, and private albums reject B',async()=>{
  await asUser(b);await rpc('album_like',[publicId,true,null]);await rpc('album_like',[publicId,true,null]);expect((await rpc('album_read',[publicId,null])).likes).toBe(1);
  await expect(rpc('album_like',[privateId,true,null])).rejects.toThrow();await rpc('album_like',[publicId,false,null]);expect((await rpc('album_read',[publicId,null])).likes).toBe(0);
 });
 it('follows reject self/duplicates/private profiles; hidden lists have no public count',async()=>{
  await asUser(b);await expect(rpc('profile_follow',[b,true])).rejects.toThrow();await rpc('profile_follow',[a,true]);await rpc('profile_follow',[a,true]);
  await asUser(null);const profile=await rpc('profile_read',['creator_a']);expect(profile.followers).toBeNull();expect((await db.query('select * from public.follows')).rows).toEqual([]);
  await asUser(a);await rpc('profile_update',[{is_public:false}]);await asUser(b);await expect(rpc('profile_follow',[a,true])).rejects.toThrow();
  await asUser(a);await rpc('profile_update',[{is_public:true}]);
 });
 it('ratings only expose their projected fields after explicit opt-in and allowed category scope',async()=>{
  await asUser(a);await rpc('profile_update',[{hide_activity:false,public_ratings:true,category_scopes:{books:'followers'}}]);
  await asUser(null);expect((await rpc('profile_read',['creator_a'])).ratings).toEqual([]);
  await asUser(b);const ratings=(await rpc('profile_read',['creator_a'])).ratings;expect(ratings[0].rating).toBe(4.5);expect(ratings[0].saved).toBeUndefined();
  await asUser(a);await rpc('profile_update',[{hide_activity:true}]);await asUser(b);expect((await rpc('profile_read',['creator_a'])).ratings).toEqual([]);
 });
 it('remix preserves contributors over generations, is independent and private by default',async()=>{
  await asUser(b);remixId=await rpc('album_remix',[publicId]);const remix=await rpc('album_read',[remixId,null]);expect(remix.visibility).toBe('private');expect(remix.items[0].contributor).toBe('creator_a');
  const added={...work,id:'noctis:films:second',category:'films',title:'Second'};await rpc('archive_mutate',[{type:'albumWork',id:remixId,work:added,value:true}]);await rpc('album_publish',[remixId,'public',true,false]);
  await asUser(a);const third=await rpc('album_remix',[remixId]);const chain=await rpc('album_read',[third,null]);expect(chain.items.map(item=>item.contributor)).toEqual(['creator_a','creator_b']);
  await rpc('archive_mutate',[{type:'updateAlbum',id:third,fields:{title:'Independent'}}]);expect((await rpc('album_read',[publicId,null])).title).toBe('Public');
  await asUser(b);await expect(rpc('album_remix',[privateId])).rejects.toThrow();
 });
 it('hides source links and personal attribution when a remixed source becomes private',async()=>{
  await asUser(a);await rpc('album_publish',[publicId,'private',false,false]);await rpc('profile_update',[{is_public:false}]);await asUser(b);
  const remix=await rpc('album_read',[remixId,null]);expect(remix.source_album_id).toBeNull();expect(remix.items[0].origin_album_id).toBeNull();expect(remix.items[0].contributor).toBeNull();
  await asUser(a);await rpc('profile_update',[{is_public:true}]);await rpc('album_publish',[publicId,'public',true,false]);
 });
 it('imports atomically without overwriting existing ratings, album duplication or automatic history',async()=>{
  await asUser(b);await rpc('archive_mutate',[{type:'rate',work,rating:5}]);
  const local={version:1,entries:{[work.id]:{work,saved:true,wanted:true,rating:3,updatedAt:new Date().toISOString()}},albums:[{id:'local-album',title:'Imported',description:'',accent:'sage',layout:'list',cover:{kind:'none'},workIds:[work.id]}],history:[{id:'local-visit',workId:work.id,visitedAt:new Date().toISOString()}],preferences:{historyEnabled:true,motion:'reduce'}};
  const first=await rpc('archive_import',[local,false]);expect(first.ratingConflicts).toBe(1);expect(first.data.entries[work.id].rating).toBe(5);expect(first.data.history).toEqual([]);expect(first.data.preferences.historyEnabled).toBe(false);
  const second=await rpc('archive_import',[local,true]);expect(second.albumsImported).toBe(0);expect(second.data.history).toHaveLength(1);expect(second.data.preferences.historyEnabled).toBe(true);
  const again=await rpc('archive_import',[local,true]);expect(again.data.history).toHaveLength(1);
 });
 it('rolls back every imported record if any album item is invalid',async()=>{
  await asUser(b);const invalidWork={...work,id:'noctis:books:rollback'};
  const payload={version:1,entries:{[invalidWork.id]:{work:invalidWork,saved:true,wanted:false,rating:null}},albums:[{id:'rollback-album',title:'Must roll back',description:'',accent:'bronze',layout:'grid',cover:{kind:'none'},workIds:[invalidWork.id,'noctis:books:missing']}],history:[],preferences:{motion:'system',historyEnabled:false}};
  await expect(rpc('archive_import',[payload,false])).rejects.toThrow('Missing imported work');
  const after=await rpc('archive_snapshot');expect(after.entries[invalidWork.id]).toBeUndefined();expect(after.albums.some(album=>album.title==='Must roll back')).toBe(false);
 });
 it('private media cannot be read by B or guests; only the owner can upload/delete its path',async()=>{
  const image='11111111-1111-4111-8111-111111111111';await asUser(a);await db.query("insert into storage.objects(bucket_id,name) values('noctis-media',$1)",[`${a}/${image}`]);
  await asUser(b);expect((await db.query('select * from storage.objects')).rows).toEqual([]);await expect(db.query("insert into storage.objects(bucket_id,name) values('noctis-media',$1)",[`${a}/22222222-2222-4222-8222-222222222222`])).rejects.toThrow();
  await asUser(null);expect((await db.query('select * from storage.objects')).rows).toEqual([]);
  await asUser(a);await rpc('archive_mutate',[{type:'updateAlbum',id:publicId,fields:{cover:{kind:'upload',imageId:image}}}]);await asUser(null);expect((await db.query('select * from storage.objects')).rows).toHaveLength(1);
  await asUser(a);const token=await rpc('album_publish',[publicId,'unlisted',false,false]);await asUser(null);expect((await db.query('select * from storage.objects')).rows).toEqual([]);expect((await rpc('album_read',[null,token])).cover.imageId).toBe(image);
 });
});
