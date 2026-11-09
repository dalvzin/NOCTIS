import { useMotionPreference } from '../personal/context';
import { useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { Room } from '../../data/rooms';
import type { Work } from '../../data/works';
import { ItemImage } from '../discovery/ItemImage';
import type { CategorySlug } from '../../types/catalog';
import { RoomArtwork, RoomVisualSources } from './RoomArtwork';
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
  const [visited] = useState(() => {
    try {
      return sessionStorage.getItem(`noctis.room.${room.slug}`) === 'seen';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(`noctis.room.${room.slug}`, 'seen');
    } catch {
      /* Navigation remains available without storage. */
    }
  }, [room.slug]);
  const pilot = room.slug === 'books';
  const [take, setTake] = useState(0);
  const [clipPlaying, setClipPlaying] = useState(false);
  const [settled, setSettled] = useState(false);
  const playing = !pilot && !reduced && (!visited || take > 0) && !settled;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, [playing, take]);
  return (
    <header
      className={`${styles.entrance} ${styles[room.slug]} ${pilot ? styles.pilotBooks : ''}`}
      style={{ '--room-light': work.palette[0] } as CSSProperties}
    >
      <div
        className={styles.atmosphere}
        aria-hidden="true"
      />
      <motion.div
        className={styles.copy}
        initial={pilot || reduced || visited ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <p className="eyebrow">THE ARCHIVE / {room.category.toUpperCase()}</p>
        <h1>{room.name}</h1>
        <p className={styles.ritual}>{rituals[room.slug]}</p>
        <p className={styles.description}>{room.description}</p>
        <a
          href="#collection"
          className="textLink"
        >
          Explore the collection <span aria-hidden="true">↓</span>
        </a>
        <p className={styles.demo}>AN EDITORIAL COLLECTION</p>
      </motion.div>
      <div className={styles.stage}>
        <div
          key={take}
          data-testid="room-entrance"
          data-motion={reduced ? 'reduced' : playing ? 'full' : 'still'}
          className={`${styles.scene} ${playing ? styles.playing : styles.still}`}
        >
          <div className={styles.composition}>
            {pilot ? (
              <div className={styles.bookPlate}>
                <ItemImage
                  work={work}
                  context="preview"
                  compactCredits
                />
                <aside className={styles.bookMargin}>
                  <span>ON THE MARGIN / 01</span>
                  <p>{work.note}</p>
                  <span>
                    {work.creator}
                    <br />
                    {work.year}
                  </span>
                </aside>
              </div>
            ) : (
              <RoomArtwork
                category={room.slug as CategorySlug}
                active={room.slug === 'films' && clipPlaying}
              />
            )}
          </div>
        </div>
        <div className={styles.motionControls}>
          {room.slug === 'films' && !reduced && (
            <button
              onClick={() => setClipPlaying((value) => !value)}
              aria-pressed={clipPlaying}
            >
              {clipPlaying ? 'Pause film excerpt' : 'Play film excerpt'}
            </button>
          )}
          {playing && <button onClick={() => setSettled(true)}>Skip room animation</button>}
          {!pilot && !reduced && (
            <button
              className={styles.replay}
              onClick={() => {
                setSettled(false);
                setTake((value) => value + 1);
              }}
              aria-label={`Replay ${room.category.toLowerCase()} entry animation`}
            >
              <RotateCcw size={12} /> Replay the entrance
            </button>
          )}
        </div>
        <RoomVisualSources category={room.slug as CategorySlug} />
      </div>
    </header>
  );
}
