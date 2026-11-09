import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { rooms } from '../../data/rooms';
import { Artwork } from '../../components/ui/Artwork';
import styles from './Pages.module.css';
export function RoomGrid() {
  return (
    <div className={styles.grid}>
      {rooms.map((room, i) => (
        <Link
          to={`/${room.slug}`}
          key={room.slug}
          className={styles.room}
        >
          <Artwork motif={room.motif} />
          <div className={styles.roomMeta}>
            <span className="eyebrow">
              0{i + 1} / {room.category}
            </span>
            <ArrowUpRight size={17} />
          </div>
          <h3>{room.name}</h3>
          <p>{room.description}</p>
        </Link>
      ))}
    </div>
  );
}
export { Home } from '../home/Home';
export function Information({ title, description }: { title: string; description: string }) {
  return (
    <section className={`${styles.section} ${styles.page} ${styles.information}`}>
      <p className="eyebrow">NOCTIS / FOUNDATION</p>
      <h1>{title}</h1>
      <p className={styles.intro}>{description}</p>
      <Link
        className="button"
        to="/"
      >
        Return to the Archive <ArrowRight size={16} />
      </Link>
    </section>
  );
}
