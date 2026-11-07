import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ArrowUpRight } from 'lucide-react';
import { rooms, personalPages } from '../../data/rooms';
import { Modal } from '../ui/Modal';
import styles from './Navigation.module.css';
import { NoctisWordmark } from '../brand/NoctisWordmark';
import { portfolioMode } from '../../config/portfolio';
import { SearchPanel } from '../../features/discovery/SearchPanel';
export function Navigation() {
  const [panel, setPanel] = useState<'menu' | 'search' | null>(null);
  const location = useLocation();
  useEffect(() => { setPanel(null); }, [location.pathname, location.search]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (!panel && document.querySelector('dialog[open]')) return;
        event.preventDefault(); setPanel(current => current === 'search' ? null : 'search');
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [panel]);
  const destinations = [{ slug: '', category: 'Home' }, { slug: 'discover', category: 'Discover' }];
  return <><header className={styles.header}><Link to="/" className={styles.brand} aria-label="NOCTIS home"><NoctisWordmark/><span className={styles.subbrand}>A LIBRARY OF EXPERIENCES</span></Link><nav aria-label="Primary" className={styles.actions}><NavLink to="/discover" className={styles.discover}>Discover <ArrowUpRight size={13}/></NavLink><span className={styles.divider} aria-hidden="true"/><button className={styles.searchTrigger} aria-label="Search archive" aria-haspopup="dialog" aria-expanded={panel === 'search'} onClick={() => { setPanel('search'); }}><Search size={20} aria-hidden="true"/><kbd aria-hidden="true">⌘ / Ctrl K</kbd></button><button className={styles.menuTrigger} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={panel === 'menu'} onClick={() => setPanel('menu')}><Menu size={20} aria-hidden="true"/></button></nav></header>
  {panel === 'menu' && <Modal title="Navigation" side onClose={() => setPanel(null)}><nav aria-label="The Archive" className={styles.links}><p className="eyebrow">The Archive</p>{destinations.map(item => <NavLink end={item.slug === ''} key={item.slug} to={`/${item.slug}`}>{item.category}<ArrowUpRight size={14}/></NavLink>)}<p className="eyebrow">The Rooms</p>{rooms.map((room, index) => <NavLink key={room.slug} to={`/${room.slug}`}><span><small className={styles.roomNumber} aria-hidden="true">0{index + 1}</small>{room.category}</span><ArrowUpRight size={14} aria-hidden="true"/></NavLink>)}<p className="eyebrow">Your Space</p>{personalPages.map(item => <NavLink key={item.slug} to={`/${item.slug}`} className={item.slug === 'my-archive' && location.pathname.startsWith('/albums/') ? styles.relatedActive : undefined}>{item.title}</NavLink>)}{!portfolioMode && <><NavLink to="/account">Account</NavLink><NavLink to="/community">Community Albums</NavLink></>}<p className={styles.localNote}>Your collection stays in this browser.<br/>No account needed.</p></nav></Modal>}
  {panel === 'search' && <SearchPanel onClose={() => setPanel(null)}/>}</>;
}
