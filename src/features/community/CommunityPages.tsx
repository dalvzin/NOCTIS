import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, messageOf } from '../../services/supabase';
import { useAuth } from '../accounts/Auth';
import { rpc, validSharedWork, type ProfileRecord } from './service';
import { RemoteMedia } from './RemoteMedia';
import { accentStyle } from '../personal/AlbumTools';
import { CatalogResults } from '../discovery/CatalogResults';
import styles from '../personal/Personal.module.css';
export function CommunityPage() {
  const [state, setState] = useState<{
    items: { id: string; title: string; description: string; source_album_id: string | null }[];
    loading: boolean;
    error: string;
  }>({ items: [], loading: !!supabase, error: '' });
  useEffect(() => {
    let active = true;
    if (supabase)
      void supabase
        .from('albums')
        .select('id,title,description,source_album_id')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(24)
        .then(({ data, error }) => {
          if (active) setState({ items: data ?? [], loading: false, error: error?.message ?? '' });
        });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className={styles.page}>
      <p className="eyebrow">CONNECTIONS / COMMUNITY</p>
      <h1>Community Albums</h1>
      <p>
        Public collections, made by real people. Private and unlisted albums do not appear here.
      </p>
      {state.loading ? (
        <p role="status">Loading public collections…</p>
      ) : state.error ? (
        <p role="alert">{state.error}</p>
      ) : !state.items.length ? (
        <p>
          {supabase
            ? 'No public collections yet. Create a private album and publish it when you are ready.'
            : 'Community services are not configured yet. Editorial collections and your local archive remain available.'}
        </p>
      ) : (
        <div className={styles.albums}>
          {state.items.map((album) => (
            <article
              className={styles.album}
              key={album.id}
            >
              <p className="eyebrow">
                {album.source_album_id ? 'REMIXED COLLECTION' : 'PUBLIC COLLECTION'}
              </p>
              <h2>
                <Link to={`/community/albums/${album.id}`}>{album.title}</Link>
              </h2>
              <p>{album.description}</p>
            </article>
          ))}
        </div>
      )}
      <Link to="/discover">Return to editorial discovery</Link>
    </section>
  );
}
export function ProfilePage() {
  const { username = '' } = useParams();
  const { session } = useAuth();
  const [state, setState] = useState<{
      record: ProfileRecord | null;
      loading: boolean;
      error: string;
    }>({ record: null, loading: true, error: '' }),
    [message, setMessage] = useState('');
  const load = useCallback(async () => {
    try {
      const record = await rpc<ProfileRecord | null>('profile_read', { p_username: username });
      if (record)
        record.ratings = record.ratings.filter(
          (item) =>
            validSharedWork(item.work) &&
            item.rating >= 0.5 &&
            item.rating <= 5 &&
            Number.isInteger(item.rating * 2),
        );
      setState({ record, loading: false, error: '' });
    } catch (error) {
      setState({ record: null, loading: false, error: messageOf(error) });
    }
  }, [username]);
  useEffect(() => {
    setState({ record: null, loading: true, error: '' });
    void load();
  }, [load]);
  const r = state.record,
    p = r?.profile;
  if (state.loading)
    return (
      <section className={styles.page}>
        <p role="status">Opening profile…</p>
      </section>
    );
  if (!r || !p)
    return (
      <section className={styles.page}>
        <h1>Profile unavailable</h1>
        <p>
          {state.error ||
            'This profile is private, unavailable, or its username has changed. Following does not grant access to a private profile.'}
        </p>
        <Link to="/community">Explore public albums</Link>
      </section>
    );
  return (
    <section
      className={styles.page}
      style={accentStyle(p.accent)}
    >
      {p.cover_id && (
        <RemoteMedia
          owner={p.id}
          id={p.cover_id}
          alt="Profile cover"
        />
      )}
      {p.avatar_id && (
        <RemoteMedia
          owner={p.id}
          id={p.avatar_id}
          alt="Profile avatar"
          avatar
        />
      )}
      <p
        className="eyebrow"
        style={{ color: 'var(--accent)' }}
      >
        {p.is_public ? 'PUBLIC PROFILE' : 'YOUR PRIVATE PROFILE'}
      </p>
      <h1>{p.display_name || `@${p.username}`}</h1>
      <p>@{p.username}</p>
      <p>{p.bio}</p>
      {session?.user.id !== p.id &&
        (session ? (
          <button
            onClick={async () => {
              try {
                await rpc('profile_follow', { p_id: p.id, p_value: !r.following });
                await load();
              } catch (error) {
                setMessage(messageOf(error));
              }
            }}
          >
            {r.following ? 'Unfollow' : 'Follow'}
          </button>
        ) : (
          <Link
            className="button"
            to={`/auth?next=${encodeURIComponent(`/u/${username}`)}`}
          >
            Sign in to follow
          </Link>
        ))}
      {message && <p role="status">{message}</p>}
      <section className={styles.panel}>
        <h2>Public albums</h2>
        {r.albums.length ? (
          r.albums
            .sort((a, b) => Number(b.featured) - Number(a.featured))
            .map((album) => (
              <p key={album.id}>
                <Link to={`/community/albums/${album.id}`}>
                  {album.featured ? 'Featured · ' : ''}
                  {album.title}
                </Link>
              </p>
            ))
        ) : (
          <p>No public albums to show.</p>
        )}
      </section>
      <section className={styles.panel}>
        <h2>Visible followers {r.followers ? `(${r.followers.length})` : ''}</h2>
        {r.followers === null ? (
          <p>This list and its count are private.</p>
        ) : (
          r.followers.map((person) => (
            <p key={person.username}>
              <Link to={`/u/${person.username}`}>@{person.username}</Link>
            </p>
          ))
        )}
        <h2>Visible following {r.following_list ? `(${r.following_list.length})` : ''}</h2>
        {r.following_list === null ? (
          <p>This list and its count are private.</p>
        ) : (
          r.following_list.map((person) => (
            <p key={person.username}>
              <Link to={`/u/${person.username}`}>@{person.username}</Link>
            </p>
          ))
        )}
      </section>
      <section className={styles.panel}>
        <h2>Shared ratings</h2>
        {r.ratings.length ? (
          <>
            <p>{r.ratings.map((item) => `${item.work.title}: ${item.rating} / 5`).join(' · ')}</p>
            <CatalogResults items={r.ratings.map((item) => item.work)} />
          </>
        ) : (
          <p>No ratings are shared with you.</p>
        )}
      </section>
    </section>
  );
}
