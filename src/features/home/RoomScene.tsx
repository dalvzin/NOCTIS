import { useId } from 'react';
import type { CategorySlug } from '../../types/catalog';
import styles from './Home.module.css';

// Estudos originais do NOCTIS. Nenhum destes desenhos representa uma obra real.
export function RoomScene({category}:{category:CategorySlug}){
 const id=useId().replace(/:/g,'');
 const ink=`${id}-ink`,light=`${id}-light`,paper=`${id}-paper`,disc=`${id}-disc`;
 return <svg className={styles.scene} viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id={ink} x1="0" x2="1" y2="1"><stop stopColor="#3c3932"/><stop offset=".48" stopColor="#222322"/><stop offset="1" stopColor="#111113"/></linearGradient>
  <radialGradient id={light} cx=".6" cy=".3" r=".7"><stop stopColor="#d8c19a" stopOpacity=".6"/><stop offset=".5" stopColor="#a58d70" stopOpacity=".12"/><stop offset="1" stopColor="#111113" stopOpacity="0"/></radialGradient>
  <linearGradient id={paper} x1="0" x2="1"><stop stopColor="#8c8069"/><stop offset=".45" stopColor="#dfd4bb"/><stop offset="1" stopColor="#b5a58a"/></linearGradient>
  <radialGradient id={disc}><stop stopColor="#292a28"/><stop offset=".18" stopColor="#111113"/><stop offset=".68" stopColor="#30302c"/><stop offset="1" stopColor="#111113"/></radialGradient>
 </defs>
 <rect width="800" height="480" fill={`url(#${ink})`}/>
 {category==='books'&&<>
  <path d="M450 0H697V480H280Z" fill="#d9c69e" opacity=".055"/><path d="M480 0V260M555 0V260M630 0V260M460 112H690" stroke="#a58d70" strokeOpacity=".1"/>
  <ellipse cx="476" cy="370" rx="255" ry="54" fill="#0b0b0c" opacity=".65"/>
  <g transform="translate(60 90) rotate(-12 180 180)"><rect x="104" y="30" width="119" height="267" rx="3" fill="#39342c" stroke="#8f7c5b" strokeOpacity=".6"/><rect x="115" y="36" width="5" height="250" fill="#a58d70" opacity=".6"/><path d="M135 80H198M143 87H191M147 232H190" stroke="#c5b18d" strokeOpacity=".5"/><text x="163" y="145" fill="#b2a183" fontSize="20" fontFamily="Georgia" textAnchor="middle">N</text></g>
  <g className={styles.book}>
   <path d="M262 276Q366 240 441 289Q526 231 667 262L696 355Q534 328 440 375Q341 333 245 365Z" fill="#514532" stroke="#a58d70" strokeWidth="3"/>
   <path d="M267 267Q361 230 441 282Q544 225 665 252L682 341Q546 320 441 362Q349 319 252 350Z" fill={`url(#${paper})`}/>
   <path d="M441 282V362" stroke="#61533d" strokeWidth="3"/>
   {Array.from({length:8},(_,i)=><path key={i} d={`M${287-i*2} ${279+i*7}Q365 ${258+i*7} 424 ${295+i*7}M460 ${293+i*7}Q555 ${254+i*7} ${649+i} ${267+i*8}`} fill="none" stroke="#6a614e" strokeOpacity=".36" strokeWidth="1"/>)}
   <path className={styles.pageTurn} d="M442 283Q402 209 303 222L283 316Q369 296 441 362Z" fill="#e0d4b9" fillOpacity=".36" stroke="#dfd2b5" strokeOpacity=".45"/>
   <path d="M430 353L422 393L438 384L447 392L451 350" fill="#705b46"/>
  </g><rect width="800" height="480" fill={`url(#${light})`}/>
 </>}
 {category==='films'&&<>
  <path d="M203 157L732 63V382L203 273Z" fill="#d3c5a4" opacity=".04" className={styles.projectorBeam}/>
  <g transform="translate(280 30)"><rect x="32" y="33" width="427" height="280" fill="#101112" stroke="#5a564d" strokeWidth="4"/><rect className={styles.screenLight} x="45" y="46" width="401" height="254" fill="#9a9c8e" opacity=".48"/>
   <path d="M47 257L116 211V165L157 150V238L202 213V96H235V219L267 196V147H307V225L344 193V119H374V241L445 223V299H47Z" fill="#242826"/><path d="M80 253L400 183M80 259L400 189" stroke="#d4c4a1" opacity=".3"/>
   <path d="M250 315V358M152 359H347" stroke="#5a564d" strokeWidth="3"/>
  </g><g fill="#242427" stroke="#8a7d67" strokeWidth="2" transform="translate(80 104)"><circle cx="43" cy="44" r="53"/><circle cx="145" cy="44" r="43"/>{[0,60,120,180,240,300].map(angle=><circle key={angle} cx={43+Math.cos(angle*Math.PI/180)*32} cy={44+Math.sin(angle*Math.PI/180)*32} r="10" fill="#111113"/>)}<rect x="25" y="88" width="158" height="105" rx="5"/><path d="M63 195L42 320M144 195L168 320"/><rect x="182" y="110" width="29" height="40"/></g>
 </>}
 {category==='games'&&<>
  <path d="M0 327H800M0 372H800M120 0V480M260 0V480M400 0V480M540 0V480M680 0V480" stroke="#a58d70" strokeOpacity=".06"/>
  <g transform="translate(293 30)"><path d="M23 20H368L393 272H0Z" fill="#393a34" stroke="#686658" strokeWidth="3"/><rect x="33" y="44" width="316" height="196" rx="18" fill="#131e1b"/><g className={styles.bootScreen} fill="none" stroke="#97a18b" strokeWidth="2"><path d="M58 210L125 135L171 171L222 92L323 210Z" strokeOpacity=".7"/><path d="M58 210H322M192 91V210M58 210L192 91L323 210" strokeOpacity=".3"/><path className={styles.bootLine} d="M65 220H320" strokeWidth="3"/><circle cx="275" cy="84" r="12"/></g><path d="M160 275L153 301H238L231 275" fill="#4d4a40"/><rect x="103" y="302" width="188" height="12" rx="3" fill="#626052"/><circle cx="368" cy="258" r="3" fill="#b9a37e"/></g>
  <g transform="translate(535 335) rotate(-8)"><path d="M0 0H111L120 35L101 47H22L-5 30Z" fill="#8e8b7d"/><path d="M27 10V32M16 21H38" stroke="#242427" strokeWidth="7"/><circle cx="85" cy="16" r="5" fill="#4f5149"/><circle cx="101" cy="26" r="5" fill="#4f5149"/></g>
 </>}
 {category==='music'&&<>
  <path d="M130 0L701 480H800V0Z" fill="#b5a27b" opacity=".055"/><g transform="translate(128 30) rotate(-14 275 225)"><rect width="565" height="410" rx="6" fill="#3f3b32" stroke="#82755f" strokeOpacity=".45"/><rect x="14" y="14" width="537" height="382" fill="#1b1d1c"/>
  <g className={styles.vinyl}><circle cx="252" cy="206" r="183" fill={`url(#${disc})`}/>{[78,88,99,112,123,134,146,158,169,178].map(r=><circle key={r} cx="252" cy="206" r={r} fill="none" stroke="#c1b291" strokeOpacity=".11"/>)}<path d="M252 25A181 181 0 0 1 395 96L305 163A65 65 0 0 0 252 140Z" fill="#ddd1b5" opacity=".1"/><circle cx="252" cy="206" r="60" fill="#b3a17d"/><circle cx="252" cy="206" r="55" fill="none" stroke="#514b3c"/><path d="M220 192H284M227 217H277" stroke="#5c5442" strokeWidth="2"/><text x="252" y="207" fontSize="9" fill="#413d32" fontFamily="Georgia" textAnchor="middle" letterSpacing="3">NOCTIS</text><circle cx="252" cy="206" r="5" fill="#111113"/></g>
  <circle cx="468" cy="80" r="24" fill="#5b5649" stroke="#9c8c6e"/><path d="M468 79L482 173L405 276" fill="none" stroke="#b4a58a" strokeWidth="9"/><path d="M468 79L482 173L405 276" fill="none" stroke="#e0d2b4" strokeWidth="2"/><rect x="388" y="267" width="18" height="37" rx="3" transform="rotate(36 397 285)" fill="#595b51"/><circle cx="480" cy="350" r="13" fill="#8c8068"/>
  </g>
 </>}
 {category==='photography'&&<>
  <path d="M0 80Q420 100 800 46" fill="none" stroke="#968873" strokeWidth="2"/>
  <g transform="translate(209 60) rotate(8 210 190)"><rect x="15" y="22" width="365" height="362" fill="#ddd6c7"/><rect x="35" y="42" width="325" height="306" fill="#575d58"/>
   <g className={styles.develop}><path d="M35 243L95 182H134V94H210V214L248 174H300V119H360V348H35Z" fill="#242b29"/><path d="M154 118H188V137H154ZM154 154H188V173H154ZM154 190H188V209H154ZM317 147H341V171H317Z" fill="#c7c9b9" opacity=".55"/><path d="M35 307L360 244V348H35Z" fill="#1b2220"/><path d="M55 315L347 261M55 325L347 271" stroke="#a9afa2" opacity=".35"/><circle cx="282" cy="91" r="22" fill="#cacbbb" opacity=".65"/></g>
   <rect className={styles.emulsion} x="35" y="42" width="325" height="306" fill="#bdbbaa" opacity=".06"/><rect x="70" y="0" width="15" height="44" rx="3" fill="#786c56"/><rect x="306" y="0" width="15" height="44" rx="3" fill="#786c56"/><path d="M154 365H247" stroke="#8c8779"/>
  </g><path d="M0 444H800" stroke="#6c6252" opacity=".3"/>
 </>}
 {category==='art'&&<>
  <path d="M150 0H670L750 480H0Z" fill="#c0ac87" opacity=".04"/><g transform="translate(232 28)"><rect x="0" y="0" width="427" height="345" fill="#5f513e"/><rect x="7" y="7" width="413" height="331" fill="none" stroke="#b39b74" strokeOpacity=".6"/><rect x="20" y="20" width="387" height="305" fill="#232f2b"/><path d="M20 205L200 20H278L400 246V325H20Z" fill="#455347"/><circle cx="292" cy="104" r="53" fill="#b4a17a"/><path d="M20 246Q180 220 407 268V325H20Z" fill="#837158"/><path d="M162 206C126 172 138 145 169 154L199 166L220 150C261 134 276 179 244 210L254 285Q206 307 152 282Z" fill="#c4b494"/><path d="M166 157Q208 185 245 157M165 207Q205 222 244 210" fill="none" stroke="#77684e" strokeWidth="3"/><path className={styles.brush} d="M36 311Q138 273 220 291T392 287" fill="none" stroke="#d1bc92" strokeWidth="5" strokeOpacity=".45"/><rect className={styles.paintLight} x="20" y="20" width="387" height="305" fill={`url(#${light})`}/></g>
  <path d="M407 0V21M336 22H494" stroke="#a58d70" strokeWidth="5"/><rect x="680" y="282" width="40" height="19" fill="#928775" opacity=".65"/>
 </>}
 </svg>;
}
