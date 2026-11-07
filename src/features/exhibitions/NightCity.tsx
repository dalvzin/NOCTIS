import { useId } from 'react';
/** Original architectural composition; no game imagery or symbols. */
export function NightCity(){
 const id=useId().replace(/[^a-z0-9]/gi,'');
 return <svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#273f37"/><stop offset="1" stopColor="#101515"/></linearGradient></defs><rect width="1200" height="620" fill={`url(#${id})`}/><circle cx="948" cy="92" r="115" fill="#d2bb7e" opacity=".045"/><path d="M0 620V245H45V200H123V278H205V118H276V238H365V170H429V300H510V120H570V200H677V248H752V80H804V190H905V138H1010V245H1080V180H1160V260H1200V620Z" fill="#111c1a"/>
 <path d="M58 620V170H82V125H120V88H334V125H370V170H395V620Z" fill="#24352f" stroke="#677364" strokeOpacity=".25"/><path d="M432 620V227H465V178H685V227H730V620Z" fill="#30292b" stroke="#745650" strokeOpacity=".35"/><path d="M824 620V150H850V80H892V48H1054V80H1100V150H1136V620Z" fill="#24332f" stroke="#8c8262" strokeOpacity=".3"/>
 {[110,164,218,272,326,466,520,574,628,682,855,909,963,1017,1071].map((x,c)=>Array.from({length:8},(_,r)=><rect key={`${c}-${r}`} x={x} y={166+r*49} width="17" height="26" fill={(c+r)%5===0?'#d3b879':'#789079'} opacity={(c+r)%5===0?.35:.08}/>))}
 <path d="M0 579L600 511L1200 579V620H0Z" fill="#0c1111"/><path d="M0 616L600 532L1200 616M180 620L600 532L1020 620M390 620L600 532L810 620" fill="none" stroke="#b4a178" strokeOpacity=".12"/>
 <path d="M782 620V360M764 360H800M768 360Q782 327 796 360" fill="none" stroke="#a28a65" strokeWidth="3" opacity=".7"/><ellipse cx="782" cy="365" rx="35" ry="65" fill="#d7b575" opacity=".05"/>
 </svg>;
}
