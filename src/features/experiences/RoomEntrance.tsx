import { useMotionPreference } from '../personal/context';
import { useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { Room } from '../../data/rooms';
import type { Work } from '../../data/works';
import { useLocation } from 'react-router-dom';
import { ItemImage } from '../discovery/ItemImage';
import { RoomScene } from '../home/RoomScene';
import type { CategorySlug } from '../../types/catalog';
import { WorkVisual } from './WorkVisual';
import styles from './RoomEntrance.module.css';

const rituals: Record<string, string> = {
  books: 'Turn a page. Stay a while.',
  films: 'The lights dim. A story begins.',
  games: 'A signal. A door. Another world.',
  music: 'Lower the needle. Listen closer.',
  photography: 'Let the unseen come to light.',
  art: 'A gesture becomes a way of seeing.',
};

export function RoomEntrance({ room, work }: { room: Room; work: Work }) {
  const reduced = useMotionPreference();
  const location = useLocation();
  const [visited] = useState(()=>{try{return sessionStorage.getItem(`noctis.room.${room.slug}`)==='seen';}catch{return false;}});
  useEffect(()=>{try{sessionStorage.setItem(`noctis.room.${room.slug}`,'seen');}catch{/* Navigation remains available without storage. */}},[room.slug]);
  const pilot = room.slug === 'books';
  const [take, setTake] = useState(0);
  return <header className={`${styles.entrance} ${styles[room.slug]} ${pilot ? styles.pilotBooks : ''}`} style={{ '--room-light': work.palette[0] } as CSSProperties}>
    {!pilot && location.state?.fromMosaic === room.slug && <div className={styles.mosaicEcho} aria-hidden="true"><RoomScene category={room.slug as CategorySlug}/></div>}
    <div className={styles.atmosphere} aria-hidden="true"/>
    <motion.div className={styles.copy} initial={pilot || reduced || visited ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
      <p className="eyebrow">THE ARCHIVE / {room.category.toUpperCase()}</p>
      <h1>{room.name}</h1>
      <p className={styles.ritual}>{rituals[room.slug]}</p>
      <p className={styles.description}>{room.description}</p>
      <a href="#collection" className="textLink">Explore the collection <span aria-hidden="true">↓</span></a>
      <p className={styles.demo}>AN EDITORIAL COLLECTION</p>
    </motion.div>
    <div className={styles.stage}>
      <div key={take} data-testid="room-entrance" data-motion={reduced ? 'reduced' : 'full'} className={`${styles.scene} ${pilot || reduced || (visited && !take) ? styles.still : styles.playing}`}>
        <div className={styles.composition}>{pilot ? <div className={styles.bookPlate}><ItemImage work={work} context="preview" compactCredits/><aside className={styles.bookMargin}><span>ON THE MARGIN / 01</span><p>{work.note}</p><span>{work.creator}<br/>{work.year}</span></aside></div> : <WorkVisual work={work} hero/>}</div>

        {!pilot && <span className={styles.sceneLabel} aria-hidden="true">{room.category === 'Games' ? 'NOCTIS / SYSTEM READY' : 'NOCTIS / ROOM STUDY 002'}</span>}
      </div>
      {!pilot && !reduced && <button className={styles.replay} onClick={() => setTake(value => value + 1)} aria-label={`Replay ${room.category.toLowerCase()} entry animation`}><RotateCcw size={12}/> Replay the entrance</button>}
    </div>
  </header>;
}
