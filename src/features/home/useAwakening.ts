import { useCallback, useEffect, useRef, useState } from 'react';

export const INTRO_SESSION_KEY='noctis.home.awakened.v1';
export const INTRO_VISIT_KEY='noctis.home.intro-seen.v1';
export type AwakeningPhase='darkness'|'wordmark'|'opening'|'assembling'|'ready';
function seen(){try{if(sessionStorage.getItem(INTRO_SESSION_KEY)==='seen')return true;}catch{/* Try the persistent preference. */}try{return localStorage.getItem(INTRO_VISIT_KEY)==='seen';}catch{return false;}}
function remember(){try{sessionStorage.setItem(INTRO_SESSION_KEY,'seen');}catch{/* Navigation does not depend on storage. */}try{localStorage.setItem(INTRO_VISIT_KEY,'seen');}catch{/* Skip remains available. */}}
function deviceReduced(){return typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}

export function useAwakening(reduced:boolean|null){
 const [initiallyReady]=useState(()=>!!reduced||deviceReduced()||seen());
 const [phase,setPhase]=useState<AwakeningPhase>(initiallyReady?'ready':'darkness');
 const [instant,setInstant]=useState(initiallyReady);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const completed=useRef(initiallyReady);
 const finish=useCallback(()=>{completed.current=true;timers.current.forEach(clearTimeout);timers.current=[];remember();setInstant(true);setPhase('ready');},[]);
 useEffect(()=>{
  remember();
  if(reduced||initiallyReady||completed.current){finish();return;}
  timers.current=[setTimeout(()=>setPhase('wordmark'),260),setTimeout(()=>setPhase('opening'),950),setTimeout(()=>setPhase('assembling'),1450),setTimeout(()=>{completed.current=true;setPhase('ready');},3100)];
  const visibility=()=>{if(document.hidden)finish();};
  document.addEventListener('visibilitychange',visibility);
  return()=>{timers.current.forEach(clearTimeout);document.removeEventListener('visibilitychange',visibility);};
 },[reduced,initiallyReady,finish]);
 return {phase,instant,finish};
}
