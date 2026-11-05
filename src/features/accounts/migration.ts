import type { SupabaseClient } from '@supabase/supabase-js';
import type { ArchiveData } from '../personal/types';
import { parseArchive, pruneEntries } from '../personal/schema';
import { localCoverStore } from '../personal/images';
import { cloudMedia } from './media';

export function importPayload(local:ArchiveData,historyConsent:boolean):ArchiveData{
 const result=parseArchive(JSON.stringify(local));
 if(!historyConsent){result.history=[];result.preferences.historyEnabled=false;pruneEntries(result);}
 return result;
}
export async function importLocalArchive(client:SupabaseClient,userId:string,local:ArchiveData,historyConsent:boolean){
 const payload=importPayload(local,historyConsent), media=cloudMedia(client,userId);
 const {data:previous,error:planError}=await client.from('imported_albums').select('local_id');if(planError)throw planError;
 const imported=new Set((previous??[]).map(row=>row.local_id));
 for(const album of payload.albums){
   if(imported.has(album.id)||album.cover.kind!=='upload')continue;
   const blob=await localCoverStore.get(album.cover.imageId);
   if(!blob)throw new Error(`The cover for “${album.title}” is missing locally. Remove it or restore it before importing.`);
   const id=crypto.randomUUID();await media.put(id,blob);album.cover={kind:'upload',imageId:id};
 }
 const {data,error}=await client.rpc('archive_import',{payload:{...payload,expectedUserId:userId},include_history:historyConsent});if(error)throw error;
 if(data?.data?.accountId!==userId)throw new Error('Account changed during import. Local originals were kept.');
 const verified=parseArchive(JSON.stringify(data.data));
 for(const [id,entry] of Object.entries(payload.entries)){
   const cloud=verified.entries[id];if(!cloud||(entry.saved&&!cloud.saved)||(entry.wanted&&!cloud.wanted)||(entry.rating!==null&&cloud.rating===null))throw new Error('Import verification failed. Local data has been kept.');
 }
 for(const album of payload.albums){
  if(imported.has(album.id))continue;
  const cloud=verified.albums.find(item=>item.id===data.albumMap?.[album.id]);
  if(!cloud||cloud.title!==album.title||cloud.description!==album.description||cloud.accent!==album.accent||cloud.layout!==album.layout||JSON.stringify(cloud.workIds)!==JSON.stringify(album.workIds)||JSON.stringify(Object.entries(cloud.cover).sort())!==JSON.stringify(Object.entries(album.cover).sort()))throw new Error('Album import verification failed. Local originals have been kept.');
 }
 // Não apaga localStorage nem IndexedDB. Um retry reutiliza os mapeamentos do banco.
 return {albumsImported:Number(data.albumsImported),ratingConflicts:Number(data.ratingConflicts)};
}
