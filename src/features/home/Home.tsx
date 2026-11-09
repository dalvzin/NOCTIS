import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, RotateCcw } from 'lucide-react';
import { rooms } from '../../data/rooms';
import { curatedWorks } from '../../data/curated';
import type { CategorySlug } from '../../types/catalog';
import { CatalogResults } from '../discovery/CatalogResults';
import { useMotionPreference } from '../personal/context';
import { ArchiveOpening } from './ArchiveOpening';
import { RoomArtwork, RoomVisualSources } from '../experiences/RoomArtwork';
import { useAwakening } from './useAwakening';
import styles from './Home.module.css';

const descriptions: Record<CategorySlug, string> = {
  books: 'Worlds between pages.',
  films: 'Stories in motion.',
  games: 'Worlds to inhabit.',
  music: 'Memories in sound.',
  photography: 'Moments preserved.',
  art: 'Beyond the visible.',
};
const offsets = [
  [-32, 25, -2],
  [20, -24, 1],
  [35, 20, -1],
  [12, -35, 2],
  [-28, 35, 1],
  [32, 26, -1],
];
const selections = [
  'gutenberg:books:84',
  'thatgamecompany:games:journey',
  'brianeno:music:ambient-2',
];
const gems = ['moma:films:299946', 'loc:photography:migrant-mother', 'aic:art:28560'];
export function Home() {
  const reduced = useMotionPreference(),
    { phase, instant, finish, replay, revision } = useAwakening(reduced);
  const entrance = useRef<HTMLElement>(null);
  const introHadFocus = useRef(false);
  const trackIntroFocus = useCallback((focused: boolean) => {
    introHadFocus.current = focused;
  }, []);
  const [visible, setVisible] = useState(true);
  const [focusedRoom, setFocusedRoom] = useState<CategorySlug | null>(null);
  const skipIntro = useCallback(() => {
    finish();
    entrance.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
  }, [finish]);
  const replayIntro = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    replay();
  };
  useEffect(() => {
    if ((phase === 'assembling' || phase === 'ready') && introHadFocus.current) {
      introHadFocus.current = false;
      entrance.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
    }
  }, [phase]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !entrance.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(entrance.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={styles.home}>
      <section
        ref={entrance}
        className={styles.entrance}
        data-phase={phase}
        data-instant={instant}
        data-reduced={!!reduced}
        data-visible={visible}
        aria-labelledby="living-archive-title"
      >
        <div className={styles.masthead}>
          <div className={styles.brandSpace}>
            <p className={styles.archiveStamp}>
              NO. 001
              <br />
              <span>SIX ROOMS. AN OPEN INVITATION.</span>
            </p>
          </div>
          <h1 id="living-archive-title">
            Not everything deserves
            <br className={styles.lineBreak} /> to be <em>forgotten.</em>
          </h1>
          <div className={styles.edition}>
            <span>THE LIVING ARCHIVE</span>
            <span>VOL. 001 / AN OPEN INVITATION</span>
          </div>
        </div>
        <nav
          className={styles.mosaic}
          aria-label="Six cultural rooms"
        >
          {rooms.map((room, index) => {
            const [x, y, angle] = offsets[index];
            const category = room.slug as CategorySlug;
            return (
              <Link
                key={room.slug}
                to={`/${room.slug}`}
                state={{ fromMosaic: room.slug }}
                className={`${styles.tile} ${styles[room.slug]}`}
                aria-label={`${room.name} — ${room.category}. ${descriptions[category]}`}
                onFocus={() => {
                  finish();
                  setFocusedRoom(category);
                }}
                onBlur={() => setFocusedRoom(null)}
                onClick={finish}
                style={
                  {
                    '--enter-x': `${x}px`,
                    '--enter-y': `${y}px`,
                    '--enter-angle': `${angle}deg`,
                    '--tile-delay': `${index * 65}ms`,
                  } as CSSProperties
                }
              >
                <div className={styles.visual}>
                  <RoomArtwork
                    category={category}
                    active={focusedRoom === category}
                  />
                </div>
                <div className={styles.tileShade} />
                <span className={styles.tileNumber}>
                  0{index + 1} / {room.name}
                </span>
                <div className={styles.tileCopy}>
                  <div>
                    <h2>{room.category}</h2>
                    <p>{descriptions[category]}</p>
                  </div>
                  <span className={styles.arrow}>
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className={styles.entranceFoot}>
          <span>SIX ROOMS. A THOUSAND WAYS TO STAY.</span>
          <a href="#curators-selection">
            A little further in <ArrowDown size={13} />
          </a>
          {!reduced && phase === 'ready' ? (
            <button
              className={styles.replayIntro}
              onClick={replayIntro}
            >
              <RotateCcw
                size={12}
                aria-hidden="true"
              />{' '}
              Replay intro
            </button>
          ) : (
            <span>COLLECTED WITH INTENTION / EST. 2026</span>
          )}
        </div>
        {phase !== 'ready' && (
          <ArchiveOpening
            key={revision}
            phase={phase}
            replaying={revision > 0}
            onSkip={skipIntro}
            onContinue={finish}
            onFocusChange={trackIntroFocus}
          />
        )}
      </section>
      <div className={styles.visualSources}>
        <RoomVisualSources />
      </div>
      <section
        id="curators-selection"
        className={styles.editorial}
        aria-labelledby="curator-home-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">01 / THE CURATOR’S SELECTION</p>
            <h2 id="curator-home-title">
              Some things
              <br />
              <em>stay with you.</em>
            </h2>
          </div>
          <p>
            A book, a journey, a quiet record.
            <br />
            Three invitations to step outside the familiar.
          </p>
        </div>
        <CatalogResults items={curatedWorks.filter((work) => selections.includes(work.id))} />
        <p className={styles.editorialNote}>
          Real works. An editorial selection, never a popularity ranking.
        </p>
      </section>
      <section
        className={`${styles.editorial} ${styles.gems}`}
        aria-labelledby="gems-home-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">02 / HIDDEN GEMS</p>
            <h2 id="gems-home-title">
              Look a little
              <br />
              <em>longer.</em>
            </h2>
          </div>
          <p>
            Another frame. Another perspective.
            <br />
            Familiar works, waiting to be seen again.
          </p>
        </div>
        <CatalogResults items={curatedWorks.filter((work) => gems.includes(work.id))} />
      </section>
      <section className={styles.invitation}>
        <p className="eyebrow">03 / KEEP WANDERING</p>
        <span
          aria-hidden="true"
          className={styles.invitationMark}
        >
          N
        </span>
        <h2>
          You don’t have to know
          <br />
          <em>what you’re looking for.</em>
        </h2>
        <p>Leave with something worth keeping.</p>
        <div>
          <Link
            className="button"
            to="/discover"
          >
            Explore the Archive <ArrowUpRight size={16} />
          </Link>
          <Link
            className="textLink"
            to="/discover#follow-a-thread"
          >
            Follow a thread <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
