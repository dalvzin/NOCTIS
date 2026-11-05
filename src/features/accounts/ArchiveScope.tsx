import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PersonalProvider } from '../personal/context';
import { coverStore } from '../personal/images';
import { MediaProvider } from '../personal/MediaContext';
import { CloudRepository } from './CloudRepository';
import { cloudMedia } from './media';
import { useAuth } from './Auth';
import { supabase } from '../../services/supabase';
interface Scope { cloud:boolean; setCloud:(value:boolean)=>void; repository:CloudRepository|null }
const Context=createContext<Scope>({cloud:false,setCloud:()=>{},repository:null});
export const useArchiveScope=()=>useContext(Context);
export function ArchiveScope({children}:{children:ReactNode}){
 const {session}=useAuth();const [connected,setConnected]=useState<string|null>(()=>{try{return sessionStorage.getItem('noctis.archive.scope');}catch{return null;}});
 const userId=session?.user.id??null;
 const repository=useMemo(()=>supabase&&userId?new CloudRepository(supabase,userId):null,[userId]);
 const cloud=!!repository&&connected===userId;
 useEffect(()=>{if(repository)void repository.reload();},[repository]);
 const media=useMemo(()=>cloud&&supabase&&userId?cloudMedia(supabase,userId):coverStore,[cloud,userId]);
 useEffect(()=>{if(!repository)return;const refresh=()=>{if(document.visibilityState==='visible')void repository.reload();};window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh);},[repository]);
 return <Context.Provider value={{cloud,setCloud:value=>{const id=value?userId:null;setConnected(id);try{if(id)sessionStorage.setItem('noctis.archive.scope',id);else sessionStorage.removeItem('noctis.archive.scope');}catch{/* A escolha permanece em memória. */}},repository}}><MediaProvider storage={media}><PersonalProvider key={cloud?userId:'local'} repository={cloud?repository!:undefined}>{children}</PersonalProvider></MediaProvider></Context.Provider>;
}
