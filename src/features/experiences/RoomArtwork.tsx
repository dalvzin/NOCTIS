import { useEffect, useRef, useState } from 'react';
import { roomWorks } from '../../data/roomMedia';
import type { CategorySlug } from '../../types/catalog';
import { ItemImage } from '../discovery/ItemImage';
import { useMotionPreference } from '../personal/context';
import styles from './RoomArtwork.module.css';

export function RoomArtwork({
  category,
  active = false,
}: {
  category: CategorySlug;
  active?: boolean;
}) {
  const reduced = useMotionPreference();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [requested, setRequested] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const moving = !reduced && visible && (active || hovered);
  useEffect(() => {
    if (!frame.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (category === 'films' && moving && !videoFailed) setRequested(true);
  }, [category, moving, videoFailed]);
  useEffect(() => {
    const player = video.current;
    if (!player || !requested || videoFailed) return;
    const sync = () => {
      if (moving && !document.hidden) {
        void player.play()?.catch(() => setVideoReady(false));
      } else player.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      player.pause();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [moving, requested, videoFailed]);
  return (
    <div
      className={`${styles.artwork} ${styles[category]}`}
      ref={frame}
      data-room-artwork={category}
      data-active={moving}
      aria-hidden="true"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {roomWorks(category).map((work, index) => (
        <div
          className={styles.piece}
          data-piece={index}
          key={work.id}
        >
          <ItemImage
            work={work}
            context="card"
            decorative
            compactCredits
          />
        </div>
      ))}
      {category === 'films' && !videoFailed && (
        <div
          className={styles.clip}
          data-ready={videoReady}
        >
          <video
            ref={video}
            src={requested && !reduced ? '/media/trip-to-the-moon-excerpt.mp4' : undefined}
            poster="/artworks/trip-to-the-moon-frame.jpg"
            muted
            loop
            playsInline
            preload="none"
            onPlaying={() => setVideoReady(true)}
            onError={() => {
              setVideoFailed(true);
              setVideoReady(false);
            }}
          />
          <span>A Trip to the Moon · 1902 · Silent excerpt</span>
        </div>
      )}
      <div className={styles.light} />
    </div>
  );
}

export function RoomVisualSources({ category }: { category?: CategorySlug }) {
  const categories: CategorySlug[] = category
    ? [category]
    : ['books', 'films', 'games', 'music', 'photography', 'art'];
  const works = categories.flatMap(roomWorks);
  return (
    <details className={styles.sources}>
      <summary>Artwork & sources</summary>
      <p>Original works from the collection. Hover or focus a room to explore the composition.</p>
      {(!category || category === 'films') && (
        <p>
          Film excerpt: Georges Méliès, A Trip to the Moon (1902). Public domain; 12 seconds,
          without a soundtrack.{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:Le_Voyage_dans_la_Lune_(1902).webm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Film source ↗
          </a>
        </p>
      )}
      <ul>
        {works.map((work) => (
          <li key={work.id}>
            <a
              href={work.image?.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {work.title} ↗
            </a>
            <span>
              {work.image?.credit} · {work.image?.rights}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
