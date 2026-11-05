import { Link, useSearchParams } from 'react-router-dom';
import { curatedWorks, editorialCollections } from '../../data/curated';
import { RoomGrid } from '../archive/Pages';
import { CatalogResults } from './CatalogResults';
import styles from './Discovery.module.css';

export function DiscoverPage() {
  const [params] = useSearchParams();
  const selected = editorialCollections.find(collection => collection.id === params.get('collection'));
  const sectionItems = selected ? curatedWorks.filter(work => selected.ids.includes(work.id)) : curatedWorks.slice(0, 3);
  return <div className={styles.page}><p className="eyebrow">DISCOVER / EDITORIAL COLLECTIONS</p><h1>Let curiosity<br/><em>lead the way.</em></h1><p className={styles.lead}>Real works. Considered connections. A handpicked route through the archive.</p>
    <section className={styles.section} aria-labelledby="curator-title"><p className="eyebrow">01 / SELECTED WITH INTENTION</p><h2 id="curator-title">{selected?.title ?? 'The Curator’s Selection'}</h2><p className={styles.hint}>{selected?.description ?? 'Editorial recommendations, not trending statistics or personalized results.'}</p><CatalogResults key={selected?.id ?? 'curator'} items={sectionItems}/></section>
    <section className={styles.section} aria-labelledby="collections-title"><h2 id="collections-title">Editorial Collections</h2><div className={styles.collections}>{editorialCollections.map(collection => <Link key={collection.id} to={`/discover?collection=${collection.id}`}><p className="eyebrow">NOCTIS / EDITORIAL</p><h3>{collection.title} ↗</h3><p>{collection.description}</p></Link>)}</div></section>
    <section className={styles.section} aria-labelledby="gems-title"><p className="eyebrow">02 / LOOK A LITTLE CLOSER</p><h2 id="gems-title">Hidden Gems</h2><p className={styles.hint}>A curator’s invitation to revisit these works — no claim about their audience size.</p><CatalogResults items={curatedWorks.filter(work => ['music', 'photography', 'art'].includes(work.category)).slice(0, 3)}/></section>
    <section className={styles.section} aria-labelledby="browse-title"><h2 id="browse-title">Explore by Category</h2><RoomGrid/></section>
    <section className={styles.section}><h2>Community Albums</h2><p className={styles.hint}>Explore collections published by their creators.</p><Link className="textLink" to="/community">Open community collections ↗</Link></section><section className={styles.section} aria-labelledby="featured-title"><h2 id="featured-title">Featured Works</h2><CatalogResults items={curatedWorks.slice(3, 6)}/><Link className="button" to="/search">Search the collection ↗</Link></section>
  </div>;
}
