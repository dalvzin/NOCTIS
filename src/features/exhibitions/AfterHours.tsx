import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { afterHoursStops } from '../../data/editorialPaths';
import { curatedWorks } from '../../data/curated';
import { workPath } from '../../data/works';
import type { Work } from '../../types/catalog';
import { ItemImage } from '../discovery/ItemImage';
import { QuickPreview } from '../discovery/QuickPreview';
import { useMotionPreference } from '../personal/context';
import { NightCity } from './NightCity';
import styles from './AfterHours.module.css';
const stops = afterHoursStops.map((stop) => ({
  ...stop,
  work: curatedWorks.find((work) => work.id === stop.id)!,
}));
export function AfterHours() {
  const [preview, setPreview] = useState<Work | null>(null);
  const reduced = useMotionPreference();
  return (
    <article
      className={styles.exhibition}
      data-reduced={!!reduced}
    >
      <header className={styles.heading}>
        <Link
          className={styles.back}
          to="/discover"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>
        <div className={styles.titleRow}>
          <div>
            <p className="eyebrow">SPECIAL EXHIBITION / NO. 001</p>
            <h1>
              After Hours
              <br />
              <em>The City Remembers</em>
            </h1>
          </div>
          <p className={styles.invitation}>
            A city after dark.
            <br /> Three ways of looking at power,
            <br /> passage and the idea of home.
          </p>
        </div>
        <p className={styles.direction}>Follow the lights. Every window opens onto a work.</p>
      </header>
      <div className={styles.cityStage}>
        <NightCity />
        <nav
          className={styles.city}
          aria-label="Three illuminated rooms"
        >
          {stops.map((stop, index) => (
            <Link
              key={stop.id}
              className={styles.window}
              to={workPath(stop.work)}
              state={{ returnTo: '/discover/after-hours' }}
              aria-label={`Explore ${stop.work.title}`}
            >
              <span className={styles.address}>{stop.address}</span>
              <ItemImage
                work={stop.work}
                context="preview"
                decorative
                compactCredits
              />
              <span className={styles.windowLabel}>
                <small>
                  0{index + 1} / {stop.name}
                </small>
                <strong>{stop.work.title}</strong>
                <span>
                  {stop.work.creator} · {stop.work.year}
                </span>
              </span>
              <ArrowUpRight
                size={18}
                className={styles.windowArrow}
              />
            </Link>
          ))}
        </nav>
      </div>
      <p className={styles.cityCredit}>
        City photograph: Samuel H. Gottscho / Library of Congress. New York city views, 1933. No
        known restrictions on publication.{' '}
        <a
          href="https://www.loc.gov/pictures/item/gsc1994017109/PP/"
          target="_blank"
          rel="noopener noreferrer"
        >
          View photograph source ↗
        </a>
      </p>
      <section
        className={styles.route}
        aria-labelledby="route-title"
      >
        <div className={styles.routeHeading}>
          <p className="eyebrow">THE EXHIBITION ROUTE</p>
          <h2 id="route-title">
            The outside world.
            <br />
            <em>The places we keep.</em>
          </h2>
          <p>
            Look at the distance between these works. The connection is an invitation to read them
            together.
          </p>
        </div>
        <ol>
          {stops.map((stop, index) => (
            <li key={stop.id}>
              <span className={styles.number}>0{index + 1}</span>
              <div>
                <p className="eyebrow">{stop.name}</p>
                <h3>
                  <Link
                    to={workPath(stop.work)}
                    state={{ returnTo: '/discover/after-hours' }}
                  >
                    {stop.work.title} <ArrowUpRight size={15} />
                  </Link>
                </h3>
                <p className={styles.creator}>
                  {stop.work.creator} · {stop.work.year}
                </p>
                <p className={styles.note}>{stop.note}</p>
                <p className={styles.context}>{stop.context}</p>
                <button
                  className="textLink"
                  aria-haspopup="dialog"
                  onClick={() => setPreview(stop.work)}
                >
                  Quick preview: {stop.work.title}
                </button>
                <details className={styles.credits}>
                  <summary>Image & source</summary>
                  <p>
                    {stop.work.image?.credit}. {stop.work.image?.rights}
                  </p>
                  <a
                    href={stop.work.image?.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View image source (opens in new tab) ↗
                  </a>
                </details>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <footer className={styles.foot}>
        <p>Some lights stay with you.</p>
        <Link
          to="/discover#follow-a-thread"
          className="textLink"
        >
          Follow another thread <ArrowUpRight size={14} />
        </Link>
      </footer>
      {preview && (
        <QuickPreview
          work={preview}
          returnTo="/discover/after-hours"
          onClose={() => setPreview(null)}
        />
      )}
    </article>
  );
}
