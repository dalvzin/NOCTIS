import { useId, type CSSProperties } from 'react';
import type { Work } from '../../data/works';
import styles from './WorkVisual.module.css';

export function WorkVisual({ work, hero = false }: { work: Work; hero?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const variant = (work.year ?? 0) % 3;
  return <div aria-hidden="true" className={`${styles.visual} ${styles[work.category]} ${hero ? styles.hero : ''}`} style={{ '--ink': work.palette[0], '--paper': work.palette[1], '--shadow': work.palette[2] } as CSSProperties}>
    <svg viewBox="0 0 480 560" focusable="false">
      <defs>
        <linearGradient id={`${id}-ground`} x2="1" y2="1"><stop stopColor={work.palette[0]}/><stop offset="1" stopColor={work.palette[2]}/></linearGradient>
        <radialGradient id={`${id}-light`}><stop stopColor={work.palette[1]} stopOpacity=".38"/><stop offset="1" stopColor={work.palette[1]} stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="480" height="560" fill={`url(#${id}-ground)`}/>
      <circle cx={180 + variant * 60} cy="230" r="250" fill={`url(#${id}-light)`}/>
      <g stroke={work.palette[1]}>
        {work.category === 'books' && <g transform={`translate(${variant * 12} 0) rotate(-8 240 280)`}><rect x="108" y="75" width="242" height="385" fill={work.palette[2]} strokeWidth="2"/><path d="M127 75V460M132 91H333V443H132" fill="none" opacity=".4"/><circle cx="232" cy="230" r={62 + variant * 10} fill="none" opacity=".6"/><path d="M170 230H294M232 168V292" opacity=".5"/><text x="150" y="355" stroke="none" fill={work.palette[1]} fontSize="13" letterSpacing="4">NOCTIS EDITIONS</text><path d="M150 380H296M150 390H252" opacity=".4"/></g>}
        {work.category === 'films' && <><rect x="30" y="92" width="420" height="280" rx="12" fill={work.palette[2]} strokeOpacity=".35"/><path d={`M40 350L${140 + variant * 60} 190L295 350L370 225L440 350Z`} fill={work.palette[0]} stroke="none"/><circle cx={280 - variant * 35} cy="174" r="34" fill={work.palette[1]} stroke="none" opacity=".5"/><path d="M30 392H450M30 406H450" strokeOpacity=".3"/><text x="240" y="455" textAnchor="middle" stroke="none" fill={work.palette[1]} fontSize="10" letterSpacing="6">A NOCTIS SCREEN STUDY</text></>}
        {work.category === 'games' && <g fill="none"><path d="M35 490L240 240L445 490M0 390H480M0 440H480M0 510H480" strokeOpacity=".25"/><rect x="120" y="90" width="240" height="310" strokeOpacity=".25"/><rect x="145" y="120" width="190" height="250" strokeOpacity=".5"/><rect x="170" y="150" width="140" height="190"/><circle cx="240" cy="245" r={22 + variant * 9}/><path d="M220 245H260M240 225V265"/></g>}
        {work.category === 'music' && <>
          <rect x="52" y="82" width="376" height="376" fill={work.palette[0]} strokeOpacity=".25"/>
          <g data-part="record">
            <circle cx="240" cy="270" r="154" fill="#141415" strokeOpacity=".3"/>
            {[140,130,120,110,100,90,80].map(r => <circle key={r} cx="240" cy="270" r={r} fill="none" strokeOpacity=".14"/>)}
            <circle cx="240" cy="270" r="49" fill={work.palette[1]} stroke="none"/>
            <path d="M214 256L260 280" stroke={work.palette[2]} strokeWidth="2"/>
            <circle cx="240" cy="270" r="5" fill={work.palette[2]} stroke="none"/>
          </g>
          <path d="M390 116L348 295L315 313" fill="none" strokeWidth="5"/>
        </>}
        {work.category === 'photography' && <><rect x="60" y="60" width="360" height="430" fill={work.palette[1]} stroke="none"/><rect x="75" y="75" width="330" height="375" fill={work.palette[2]} stroke="none"/><path d={`M75 345L${180 + variant * 45} 155L405 330V450H75Z`} fill={work.palette[0]} stroke="none"/><path d="M135 80V450M220 80V450M305 80V450M75 200H405M75 310H405" strokeWidth="7" strokeOpacity=".35"/><path d="M85 86L395 440" strokeOpacity=".3"/></>}
        {work.category === 'art' && <><path d={`M100 440C${30 + variant * 40} 100 360 45 355 290C350 380 260 385 300 470Z`} fill={work.palette[1]} fillOpacity=".6" stroke="none"/><path d="M170 440C130 220 320 100 300 290C290 350 190 400 240 470" fill={work.palette[2]} strokeWidth="3"/><path d="M75 160Q190 100 390 180M60 180Q190 120 410 205M85 205Q240 150 395 225" fill="none" strokeWidth={8 + variant * 4} strokeOpacity=".55"/><path d="M75 475H405" strokeOpacity=".3"/></>}
      </g>
    </svg>
    <span className={styles.number}>N / {work.category.toUpperCase()} / {work.year}</span>
    <span className={styles.caption}>ORIGINAL VISUAL STUDY</span>
  </div>;
}

