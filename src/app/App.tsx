import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NoctisWordmark } from '../components/brand/NoctisWordmark';
import { Navigation } from '../components/navigation/Navigation';
import { AfterHours } from '../features/exhibitions/AfterHours';
import { Home, Information } from '../features/archive/Pages';
import { rooms, personalPages } from '../data/rooms';
import { knownPageTitle } from '../services/catalog';
import { SearchPage } from '../features/discovery/SearchPage';
import { DiscoverPage } from '../features/discovery/DiscoverPage';
import { RoomExperience } from '../features/experiences/RoomExperience';
import { WorkDetail } from '../features/experiences/WorkDetail';
import { AlbumPage, MyArchive, RecentPage, SettingsPage } from '../features/personal/PersonalPages';
import { StorageNotice, usePersonalArchive } from '../features/personal/context';
const AuthPage=lazy(()=>import('../features/accounts/AuthPages').then(module=>({default:module.AuthPage})));
const AuthCallback=lazy(()=>import('../features/accounts/AuthPages').then(module=>({default:module.AuthCallback})));
const PasswordRecovery=lazy(()=>import('../features/accounts/AuthPages').then(module=>({default:module.PasswordRecovery})));
const AccountPage=lazy(()=>import('../features/accounts/AccountPage').then(module=>({default:module.AccountPage})));
const CommunityPage=lazy(()=>import('../features/community/CommunityPages').then(module=>({default:module.CommunityPage})));
const ProfilePage=lazy(()=>import('../features/community/CommunityPages').then(module=>({default:module.ProfilePage})));
import { SharedAlbumPage } from '../features/community/AlbumSharing';
import styles from './App.module.css';
export function App() {
  const location = useLocation();
  const { data } = usePersonalArchive();
  const albumTitle = location.pathname.startsWith("/albums/") ? data.albums.find(album => `/albums/${album.id}` === location.pathname)?.title ?? "Album unavailable" : undefined;
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const accountTitle=location.pathname.startsWith('/auth')?'Sign in':location.pathname==='/account'?'Account':location.pathname.startsWith('/community')?'Community':location.pathname.startsWith('/u/')?'Profile':location.pathname.startsWith('/s/')?'Shared album':undefined;
    const title = accountTitle ?? albumTitle ?? knownPageTitle(location.pathname) ?? rooms.find(room => `/${room.slug}` === location.pathname)?.name ?? personalPages.find(page => `/${page.slug}` === location.pathname)?.title ?? (location.pathname === '/' ? 'A library of experiences' : location.pathname === '/discover/after-hours' ? 'After Hours — The City Remembers' : location.pathname === '/discover' ? 'Discover' : location.pathname === '/search' ? 'Search' : 'Page not found');
    document.title = `NOCTIS — ${title}`;
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Wait until the navigation dialog has closed before focusing inert content.
    const focusContent = () => (location.hash ? document.getElementById(location.hash.slice(1)) ?? main.current : main.current)?.focus({ preventScroll: true });
    const dialog = document.querySelector('dialog[open]');
    dialog?.addEventListener('close', focusContent, { once: true });
    const frame = requestAnimationFrame(() => {
      if (!document.querySelector('dialog[open]')) focusContent();
    });
    return () => { cancelAnimationFrame(frame); dialog?.removeEventListener('close', focusContent); };
  }, [location.pathname, albumTitle]);
  return <><a href="#main" className="skip">Skip to content</a><Navigation/><StorageNotice/><main id="main" tabIndex={-1} ref={main}><div key={location.pathname} className={styles.page} data-enter={!first.current}><Suspense fallback={<p role="status">Opening this space…</p>}><Routes><Route path="/" element={<Home/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/discover/after-hours" element={<AfterHours/>}/><Route path="/discover" element={<DiscoverPage/>}/>{rooms.flatMap(room => [<Route key={room.slug} path={`/${room.slug}`} element={<RoomExperience key={room.slug} room={room}/>}/>, <Route key={`${room.slug}-detail`} path={`/${room.slug}/:workId`} element={<WorkDetail room={room}/>}/>])}<Route path="/archive" element={<Navigate to={`/my-archive${location.search}${location.hash}`} replace/>}/><Route path="/my-archive" element={<MyArchive/>}/><Route path="/recently-explored" element={<RecentPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="/albums" element={<Navigate to="/my-archive?tab=albums" replace/>}/><Route path="/albums/:albumId" element={<AlbumPage/>}/><Route path="/auth" element={<AuthPage/>}/><Route path="/auth/callback" element={<AuthCallback/>}/><Route path="/auth/recovery" element={<PasswordRecovery/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/community" element={<CommunityPage/>}/><Route path="/community/albums/:albumId" element={<SharedAlbumPage/>}/><Route path="/s/:token" element={<SharedAlbumPage/>}/><Route path="/u/:username" element={<ProfilePage/>}/><Route path="*" element={<Information title="A little off the map." description="404 — This room doesn’t exist. Let’s find your way back."/>}/></Routes></Suspense></div></main><footer><div><Link to="/" className="footerBrand"><NoctisWordmark/></Link><p>A library of experiences.</p></div><p>Collected with intention.<br/>Look closer. Stay a little longer.</p><span>EXPERIENCES / 2026</span></footer></>;
}

