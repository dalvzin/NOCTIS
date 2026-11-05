import { useMotionPreference } from '../personal/context';
import { useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { Room } from '../../data/rooms';
import type { Work } from '../../data/works';
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
  const [take, setTake] = useState(0);
  return <header className={`${styles.entrance} ${styles[room.slug]}`} style={{ '--room-light': work.palette[0] } as CSSProperties}>
    <div className={styles.atmosphere} aria-hidden="true"/>
    <motion.div className={styles.copy} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
      <p className="eyebrow">THE ARCHIVE / {room.category.toUpperCase()}</p>
      <h1>{room.name}</h1>
      <p className={styles.ritual}>{rituals[room.slug]}</p>
      <p className={styles.description}>{room.description}</p>
      <a href="#collection" className="textLink">Explore the collection <span aria-hidden="true">↓</span></a>
      <p className={styles.demo}>CURATED WORKS + IDENTIFIED DEMONSTRATIONS</p>
    </motion.div>
    <div className={styles.stage}>
      <div key={take} data-testid="room-entrance" data-motion={reduced ? 'reduced' : 'full'} className={`${styles.scene} ${reduced ? styles.still : styles.playing}`}>
        <div className={styles.composition}><WorkVisual work={work} hero/></div>
        <div className={styles.leaf} aria-hidden="true"/><div className={styles.leafTwo} aria-hidden="true"/>
        <span className={styles.sceneLabel} aria-hidden="true">{room.category === 'Games' ? 'NOCTIS / SYSTEM READY' : 'NOCTIS / ROOM STUDY 002'}</span>
      </div>
      {!reduced && <button className={styles.replay} onClick={() => setTake(value => value + 1)} aria-label={`Replay ${room.category.toLowerCase()} entry animation`}><RotateCcw size={12}/> Replay the entrance</button>}
    </div>
  </header>;
}
