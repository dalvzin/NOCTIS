import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../accounts/Auth';
import { useArchiveScope } from '../accounts/ArchiveScope';
import { supabase, messageOf } from '../../services/supabase';
import { Confirm, accentStyle } from '../personal/AlbumTools';
import { readAlbum, rpc, type CommunityAlbum } from './service';
import { RemoteMedia } from './RemoteMedia';
import { ItemImage } from '../discovery/ItemImage';
import { CatalogResults } from '../discovery/CatalogResults';
import styles from '../personal/Personal.module.css';

export function AlbumSharing({id}:{id:string}){
 const [album,setAlbum]=useState<CommunityAlbum|null>(null),[token,setToken]=useState<string|null>(null),[visibility,setVisibility]=useState('private'),[remix,setRemix]=useState(false),[confirm,setConfirm]=useState(false),[message,setMessage]=useState('');
 const load=useCallback(async()=>{try{const data=await readAlbum(id);setAlbum(data);setVisibility(data?.visibility??'private');setRemix(data?.allow_remix??false);
 if(data?.visibility==='unlisted'&&supabase){const {data:share}=await supabase.from('album_shares').select('token').eq('album_id',id).maybeSingle();setToken(share?.token??null);}else setToken(null);
 }catch(error){setMessage(messageOf(error));}},[id]);
 useEffect(()=>{void load();},[load]);
 const publish=async(rotate=false)=>{try{const value=await rpc<string|null>('album_publish',{p_id:id,p_visibility:visibility,p_remix:remix,p_rotate:rotate});setToken(value);setMessage('Visibility confirmed by the server.');await load();return {ok:true};}catch(error){return {ok:false,error:messageOf(error)};}};
 return <section className={styles.panel}><h2>Album visibility</h2><p>Current: {album?.visibility??'loading…'}. Private profiles can deliberately publish individual albums; their other records remain private.</p><label htmlFor="album-visibility">Visibility </label><select id="album-visibility" value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="private">Private — only you</option><option value="public">Public — discoverable by anyone</option><option value="unlisted">Unlisted — anyone with the secret link</option></select>
 <p><label><input type="checkbox" checked={remix} disabled={visibility!=='public'} onChange={e=>setRemix(e.target.checked)}/> Allow remixes of this public album</label></p><button onClick={()=>setConfirm(true)}>Apply visibility</button>
 {token&&<><p><Link to={`/s/${token}`}>Open unlisted share link</Link></p><button onClick={async()=>{const result=await publish(true);if(!result.ok)setMessage(result.error??'Could not revoke link.');}}>Revoke old link and generate a new one</button><p>Changing to Private revokes the link. Already issued media URLs can remain valid for up to one minute.</p></>}
 {album?.visibility==='public'&&<p><Link to={`/community/albums/${id}`}>Open public album</Link></p>}{message&&<p role="status">{message}</p>}
 {confirm&&<Confirm title="Change album visibility" action={()=>publish()} onClose={()=>setConfirm(false)}>Apply {visibility} visibility? Public albums are discoverable; unlisted albums can be read by anyone with their share link. Private albums are owner-only. Permitted remixes become independent copies; hiding the source later does not delete those copies.</Confirm>}</section>;
}
export function SharedAlbumPage(){
 const {albumId,token}=useParams();const {session}=useAuth();const scope=useArchiveScope();const navigate=useNavigate();
 const [state,setState]=useState<{album:CommunityAlbum|null;loading:boolean;error:string}>({album:null,loading:true,error:''}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{try{const album=await readAlbum(albumId,token);setState({album,loading:false,error:''});}catch(error){setState({album:null,loading:false,error:messageOf(error)});}},[albumId,token]);
 useEffect(()=>{setState({album:null,loading:true,error:''});void load();},[load]);
 const a=state.album;
 if(state.loading)return <section className={styles.page}><p role="status">Opening collection…</p></section>;
 if(!a)return <section className={styles.page}><h1>Album unavailable</h1><p>{state.error||'This album may be private, removed, or its share link may have been revoked.'}</p><Link to="/community">Explore public albums</Link></section>;
 const coverWork=a.cover.kind==='work'?a.items.find(item=>item.work.id===(a.cover as {workId:string}).workId)?.work:null;
 async function act(action:'like'|'remix'){
  if(!session){navigate(`/auth?next=${encodeURIComponent(token?`/s/${token}`:`/community/albums/${albumId}`)}`);return;}
  setBusy(true);try{if(action==='like'){await rpc('album_like',{p_id:a!.id,p_value:!a!.liked,p_token:token??null});await load();}
  else{const id=await rpc<string>('album_remix',{p_id:a!.id});await scope.repository?.reload();scope.setCloud(true);navigate(`/albums/${id}`);}}
  catch(error){setMessage(messageOf(error));}finally{setBusy(false);}
 }
 return <section className={styles.page} style={accentStyle(a.accent)}><p className="eyebrow" style={{color:'var(--accent)'}}>{a.visibility.toUpperCase()} COLLECTION</p><h1>{a.title}</h1><p>{a.description}</p><p>{a.creator?.username?<Link to={`/u/${a.creator.username}`}>@{a.creator.username}</Link>:'Private or former creator'} · {a.items.length} works</p>{a.creator?.avatar_id&&<RemoteMedia owner={a.creator.id} id={a.creator.avatar_id} alt="Creator avatar" avatar/>}
 <div className={styles.heroCover}>{a.cover.kind==='upload'?<RemoteMedia owner={a.media_owner} id={a.cover.imageId} token={token} alt={`Cover for ${a.title}`}/>:coverWork?<ItemImage work={coverWork}/>:<div className={styles.cover} style={accentStyle(a.accent)}><p>A collection of experiences</p></div>}</div>
 <div className={styles.row}><button disabled={busy} aria-pressed={a.liked} onClick={()=>void act('like')}>{a.liked?'Unlike':'Like'} ({a.likes})</button>{a.visibility==='public'&&a.allow_remix&&<button disabled={busy} onClick={()=>void act('remix')}>Remix into my cloud archive</button>}{a.owner&&<button onClick={async()=>{await scope.repository?.reload();scope.setCloud(true);navigate(`/albums/${a.id}`);}}>Edit in cloud archive</button>}</div>
 {message&&<p role="status">{message}</p>}{a.source_album_id&&<p>Remixed from <Link to={`/community/albums/${a.source_album_id}`}>a public collection</Link>{a.original_creator?` · Original creator @${a.original_creator}`:''}.</p>}
 <CatalogResults items={a.items.map(item=>item.work)}/><section className={styles.panel}><h2>Contributions</h2>{a.items.map(item=><p key={item.work.id}>{item.work.title} · {item.contributor?`@${item.contributor}`:'Private or former contributor'}{item.origin_album_id&&<> · <Link to={`/community/albums/${item.origin_album_id}`}>Original collection</Link></>}</p>)}</section></section>;
}
