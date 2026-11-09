import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Room } from '../../data/rooms';
import { works, workPath, type Work } from '../../data/works';
import { fetchWork, findKnown, localCatalog } from '../../services/catalog';
import { validReturnTo } from '../../services/catalogUtils';
import { Information } from '../archive/Pages';
import { WorkContent } from './WorkContent';
import { ItemImage } from '../discovery/ItemImage';
import styles from './Experiences.module.css';
import { usePersonalArchive, useRecordVisit } from '../personal/context';
import { creatorCredit } from '../../services/recordPresentation';
import recordStyles from './FullRecord.module.css';
import { BookManuscriptPage } from '../frankenstein/FrankensteinManuscriptPage';
import { isBookManuscript } from '../frankenstein/bookPresentation';

export function WorkDetail({ room }: { room: Room }) {
  const { workId = '' } = useParams();
  const location = useLocation();
  const { repository } = usePersonalArchive();
  const key = `${room.slug}/${workId}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    key: string;
    item: Work | null;
    loading: boolean;
    error: boolean;
  }>({
    key,
    item: findKnown(room.slug, workId) ?? null,
    loading: !findKnown(room.slug, workId),
    error: false,
  });
  useEffect(() => {
    const controller = new AbortController();
    const known = findKnown(room.slug, workId) ?? repository.findWork(room.slug, workId);
    setState({ key, item: known ?? null, loading: !known, error: false });
    if (!known || known.source.kind === 'live')
      fetchWork(room.slug, workId, controller.signal, !!known)
        .then((item) => {
          if (!controller.signal.aborted)
            setState({ key, item: item ?? known ?? null, loading: false, error: false });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setState({ key, item: known ?? null, loading: false, error: true });
        });
    return () => controller.abort();
  }, [key, room.slug, workId, attempt, repository]);
  const work =
    (state.key === key ? state.item : findKnown(room.slug, workId)) ??
    repository.findWork(room.slug, workId);
  useRecordVisit(work);
  useEffect(() => {
    if (work) document.title = `NOCTIS — ${work.title}`;
  }, [work]);
  if (!work && (state.loading || state.key !== key))
    return (
      <section className={styles.detail}>
        <p role="status">Opening the source record…</p>
      </section>
    );
  if (!work && state.error)
    return (
      <section className={styles.detail}>
        <h1>The source is temporarily out of reach.</h1>
        <p>We could not load this external record. Your local collections are still available.</p>
        <button
          className="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Retry record
        </button>
        <p>
          <Link to={`/${room.slug}`}>Return to the room</Link>
        </p>
      </section>
    );
  if (!work)
    return (
      <Information
        title="This record is out of reach."
        description="404 — No catalog work exists at this address. Explore the rooms to find a record."
      />
    );
  const returnTo = validReturnTo(location.state?.returnTo, `/${room.slug}`);
  if (isBookManuscript(work))
    return (
      <BookManuscriptPage
        key={work.id}
        work={work}
        returnTo={returnTo}
        sourceStatus={state.error ? 'unavailable' : state.loading ? 'updating' : undefined}
      />
    );
  const credit = creatorCredit(work);
  const related = (work.source.kind === 'demo' ? works : localCatalog)
    .filter(
      (item) =>
        item.category === room.slug &&
        item.id !== work.id &&
        (work.source.kind === 'demo' ? item.source.kind === 'demo' : item.source.kind !== 'demo'),
    )
    .slice(0, 2);
  return (
    <article className={styles.detail}>
      <nav
        aria-label="Record breadcrumb"
        className={styles.breadcrumb}
      >
        <Link to={`/${room.slug}`}>
          <ArrowLeft size={14} /> {room.name}
        </Link>
        {returnTo.startsWith('/search') && (
          <Link to={returnTo}>
            Return to search results <ArrowUpRight size={14} />
          </Link>
        )}
        <span>
          {work.source.kind === 'demo'
            ? 'LOCAL DEMONSTRATION'
            : work.source.kind === 'live'
              ? work.source.label
              : 'FROM THE COLLECTION'}
        </span>
      </nav>
      <header
        className={recordStyles.header}
        data-record-medium={work.category}
      >
        <ItemImage
          work={work}
          hero
        />
        <div className={recordStyles.identity}>
          <p className="eyebrow">FULL RECORD / {room.category}</p>
          <h1>{work.title}</h1>
          <p className={recordStyles.metadata}>
            {work.format}
            {work.year !== null && (
              <>
                {' '}
                <span aria-hidden="true">/</span> {work.year}
              </>
            )}
          </p>
          {credit && (
            <p className={recordStyles.creator}>
              <span>{credit.label}</span>
              {credit.name}
            </p>
          )}
          {state.loading && <p role="status">Updating source details…</p>}
          {state.error && (
            <p role="status">
              Additional source details are unavailable. Showing the metadata already retrieved.
            </p>
          )}
          <div className={recordStyles.description}>
            <p className={recordStyles.descriptionLabel}>
              {work.source.kind === 'curated'
                ? 'NOCTIS editorial summary'
                : work.source.kind === 'demo'
                  ? 'Fictional demonstration'
                  : 'From the source record'}
            </p>
            <p>{work.description.trim() || 'A description is not available for this record.'}</p>
          </div>
        </div>
      </header>
      <WorkContent work={work} />
      <Link
        to={returnTo}
        className={`textLink ${recordStyles.returnLink}`}
      >
        {returnTo.startsWith('/search')
          ? 'Back to search results'
          : returnTo.startsWith('/discover/after-hours')
            ? 'Back to the exhibition'
            : returnTo.startsWith('/albums/')
              ? 'Back to the album'
              : returnTo.startsWith('/my-archive')
                ? 'Back to My Archive'
                : 'Back to the collection'}{' '}
        <ArrowUpRight size={14} />
      </Link>
      {!!related.length && (
        <section
          className={styles.related}
          aria-labelledby="related-title"
        >
          <p className="eyebrow">KEEP WANDERING</p>
          <h2 id="related-title">Elsewhere in this room</h2>
          <div>
            {related.map((item) => (
              <Link
                key={item.id}
                to={workPath(item)}
                state={{ returnTo }}
              >
                <span>
                  {item.format} / {item.year ?? 'Date unavailable'}
                </span>
                <h3>
                  {item.title}
                  <ArrowUpRight size={16} />
                </h3>
                <p>{item.creator}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
