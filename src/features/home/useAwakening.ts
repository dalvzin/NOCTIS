import { useCallback, useEffect, useRef, useState } from 'react';

export const INTRO_SESSION_KEY='noctis.home.awakened.v1';
export type AwakeningPhase='darkness'|'wordmark'|'opening'|'assembling'|'ready';
function seen(){try{return sessionStorage.getItem(INTRO_SESSION_KEY)==='seen';}catch{return false;}}
function remember(){try{sessionStorage.setItem(INTRO_SESSION_KEY,'seen');}catch{/* Sem armazenamento, a entrada continua utilizável e pode ser pulada. */}}
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
