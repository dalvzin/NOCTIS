import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './Auth';
import { useArchiveScope } from './ArchiveScope';
import { LocalArchiveRepository } from '../personal/repository';
import { parseArchive } from '../personal/schema';
import { Confirm } from '../personal/AlbumTools';
import { usePersonalArchive } from '../personal/context';
import { validateCover } from '../personal/images';
import { cloudMedia } from './media';
import { importLocalArchive } from './migration';
import { supabase, messageOf } from '../../services/supabase';
import { rpc, type Profile, type Preferences, type Scope } from '../community/service';
import { RemoteMedia } from '../community/RemoteMedia';
import styles from '../personal/Personal.module.css';

function FollowingManager() {
  const { session } = useAuth();
  const [ids, setIds] = useState<string[]>([]),
    [message, setMessage] = useState('');
  useEffect(() => {
    if (supabase && session)
      void supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', session.user.id)
        .then(({ data, error }) => {
          if (error) setMessage(error.message);
          else setIds((data ?? []).map((row) => row.followed_id));
        });
  }, [session]);
  return (
    <section className={styles.panel}>
      <h2>Manage following ({ids.length})</h2>
      <p>
        Your own connections remain removable even when a profile becomes private. Private names are
        not disclosed.
      </p>
      {ids.map((id, index) => (
        <p key={id}>
          Connection {index + 1}{' '}
          <button
            onClick={async () => {
              try {
                await rpc('profile_follow', { p_id: id, p_value: false });
                setIds(ids.filter((value) => value !== id));
              } catch (error) {
                setMessage(messageOf(error));
              }
            }}
          >
            Unfollow connection {index + 1}
          </button>
        </p>
      ))}
      {message && <p role="status">{message}</p>}
    </section>
  );
}

function ProfileEditor() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null),
    [preferences, setPreferences] = useState<Preferences | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [featured, setFeatured] = useState<string[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const load = useCallback(async () => {
    if (!supabase || !session) return;
    try {
      await rpc('archive_snapshot');
      const [p, f, feats, publicAlbums] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', session.user.id).single(),
        supabase.from('featured_albums').select('album_id').eq('user_id', session.user.id),
        supabase
          .from('albums')
          .select('id,title')
          .eq('owner_id', session.user.id)
          .eq('visibility', 'public'),
      ]);
      if (p.error) throw p.error;
      if (f.error) throw f.error;
      setProfile(p.data);
      setPreferences(f.data);
      setAlbums(publicAlbums.data ?? []);
      setFeatured((feats.data ?? []).map((row) => row.album_id));
    } catch (error) {
      setMessage(messageOf(error));
    }
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  if (!profile || !preferences)
    return (
      <section className={styles.panel}>
        <p role="status">{message || 'Loading profile and privacy settings…'}</p>
        <button onClick={() => void load()}>Retry profile</button>
      </section>
    );
  const p = profile,
    pref = preferences;
  async function upload(file: File | undefined, field: 'avatar_id' | 'cover_id') {
    if (!file || !supabase || !session) return;
    setBusy(true);
    let id: string | undefined;
    try {
      await validateCover(file);
      id = crypto.randomUUID();
      const storage = cloudMedia(supabase, session.user.id);
      await storage.put(id, file);
      await rpc('profile_update', { fields: { id: session.user.id, [field]: id } });
      const old = p[field];
      if (old) await storage.remove(old);
      await load();
      setMessage('Image saved to your account.');
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.panel}>
      <h2>Your profile & privacy</h2>
      <p>
        Profiles, ratings, activity and social lists start private. Public or unlisted albums can
        still be deliberately shared separately. Private profiles do not accept new follows.
      </p>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await rpc('profile_update', { fields: { ...p, ...pref, featured } });
            setMessage('Profile and privacy saved.');
            await load();
          } catch (error) {
            setMessage(messageOf(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="profile-username">Username (3–30 lowercase characters)</label>
        <input
          id="profile-username"
          required
          pattern="[a-z][a-z0-9_]{2,29}"
          maxLength={30}
          value={p.username ?? ''}
          onChange={(e) => setProfile({ ...p, username: e.target.value })}
        />
        <p>
          Changing your username changes your profile address. Old addresses will stop resolving.
        </p>
        <label htmlFor="profile-name">Display name</label>
        <input
          id="profile-name"
          maxLength={80}
          value={p.display_name}
          onChange={(e) => setProfile({ ...p, display_name: e.target.value })}
        />
        <label htmlFor="profile-bio">Biography</label>
        <textarea
          id="profile-bio"
          maxLength={1000}
          value={p.bio}
          onChange={(e) => setProfile({ ...p, bio: e.target.value })}
        />
        <label htmlFor="profile-accent">Profile accent</label>
        <select
          id="profile-accent"
          value={p.accent}
          onChange={(e) => setProfile({ ...p, accent: e.target.value as Profile['accent'] })}
        >
          {['bronze', 'sage', 'slate', 'rose'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <p>
          <label>
            <input
              type="checkbox"
              checked={p.is_public}
              onChange={(e) => setProfile({ ...p, is_public: e.target.checked })}
            />{' '}
            Public profile
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={pref.hide_activity}
              onChange={(e) => setPreferences({ ...pref, hide_activity: e.target.checked })}
            />{' '}
            Hide all personal activity
          </label>
        </p>
        <p>
          This suppresses shared ratings. Published albums remain accessible until their visibility
          is changed. There is no behavioral activity feed.
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={pref.public_ratings}
              onChange={(e) => setPreferences({ ...pref, public_ratings: e.target.checked })}
            />{' '}
            Allow sharing my ratings within the category scopes below
          </label>
        </p>
        {(['followers_scope', 'following_scope'] as const).map((key) => (
          <label key={key}>
            {key === 'followers_scope' ? 'Followers list visibility' : 'Following list visibility'}
            <select
              value={pref[key]}
              onChange={(e) => setPreferences({ ...pref, [key]: e.target.value as Scope })}
            >
              {['private', 'followers', 'public'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
        {Object.entries(pref.category_scopes)
          .filter(([key]) => !['albums', 'remixes', 'follows'].includes(key))
          .map(([category, value]) => (
            <label key={category}>
              {category} activity scope
              <select
                value={value}
                onChange={(e) =>
                  setPreferences({
                    ...pref,
                    category_scopes: {
                      ...pref.category_scopes,
                      [category]: e.target.value as Scope,
                    },
                  })
                }
              >
                {['private', 'followers', 'public'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
        <p>
          Only ratings currently have a shared activity surface. Album, remix and follow scopes are
          stored for future activity surfaces; they never publish events or override album/list
          visibility.
        </p>
        <fieldset>
          <legend>Featured public albums (up to six)</legend>
          {albums.map((album) => (
            <label key={album.id}>
              <input
                type="checkbox"
                checked={featured.includes(album.id)}
                onChange={(e) =>
                  setFeatured(
                    e.target.checked
                      ? [...featured, album.id]
                      : featured.filter((id) => id !== album.id),
                  )
                }
              />
              {album.title}
            </label>
          ))}
          <p>Only your public albums can be featured.</p>
        </fieldset>
        <button disabled={busy}>Save profile & privacy</button>
      </form>
      <h3>Profile images</h3>
      {(['avatar_id', 'cover_id'] as const).map((field) => (
        <div key={field}>
          {p[field] && (
            <RemoteMedia
              owner={p.id}
              id={p[field]}
              alt={field === 'avatar_id' ? 'Your avatar' : 'Your profile cover'}
              avatar={field === 'avatar_id'}
            />
          )}
          <label>
            {field === 'avatar_id' ? 'Avatar' : 'Profile cover'} (JPEG, PNG, WebP · up to 2 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void upload(file, field);
              }}
            />
          </label>
          <button
            disabled={busy || !p[field]}
            onClick={async () => {
              if (!supabase || !session) return;
              setBusy(true);
              try {
                await rpc('profile_update', { fields: { id: session.user.id, [field]: null } });
                await cloudMedia(supabase, session.user.id).remove(p[field]!);
                await load();
              } catch (error) {
                setMessage(messageOf(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            Remove {field === 'avatar_id' ? 'avatar' : 'profile cover'}
          </button>
        </div>
      ))}
      {p.username && (
        <p>
          <Link to={`/u/${p.username}`}>View my profile</Link>
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
export function AccountPage() {
  const { session, loading, error } = useAuth(),
    scope = useArchiveScope();
  const archive = usePersonalArchive();
  const local = useMemo(() => new LocalArchiveRepository({ listenToStorage: false }), []);
  const [history, setHistory] = useState(false),
    [confirm, setConfirm] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  if (loading)
    return (
      <section className={styles.page}>
        <h1>Account</h1>
        <p role="status">Restoring session…</p>
      </section>
    );
  if (!session)
    return (
      <section className={styles.page}>
        <h1>Account</h1>
        <p>
          {supabase
            ? 'Sign in to use your cloud archive and community features.'
            : 'Supabase is not configured yet. Local archive functionality remains available.'}
        </p>
        {error && <p role="alert">{error}</p>}
        <Link
          className="button"
          to="/auth"
        >
          Sign in or create account
        </Link>
        <p>
          <Link to="/my-archive">Open local archive</Link>
        </p>
      </section>
    );
  return (
    <section className={styles.page}>
      <p className="eyebrow">YOUR SPACE / ACCOUNT</p>
      <h1>Account</h1>
      <p>
        Signed in as {session.user.email ?? 'an authenticated account'}. Current archive:{' '}
        <strong>{scope.cloud ? 'Cloud account' : 'This browser only'}</strong>.
      </p>
      <div className={styles.row}>
        <button
          disabled={busy}
          onClick={() => scope.setCloud(!scope.cloud)}
        >
          {scope.cloud ? 'Use local archive' : 'Use cloud archive'}
        </button>
        <button
          onClick={async () => {
            await scope.repository?.reload();
            setMessage('Cloud reload completed. Check any error below.');
          }}
        >
          Reload cloud archive
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            if (!supabase) return;
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error) setMessage(error.message);
            else scope.setCloud(false);
          }}
        >
          Sign out
        </button>
      </div>
      {scope.cloud && archive.loading && <p role="status">Loading cloud archive…</p>}
      {scope.repository?.getSnapshot().error && (
        <p role="alert">{scope.repository.getSnapshot().error}</p>
      )}
      <section className={styles.panel}>
        <h2>Import this browser’s archive</h2>
        <p>
          Nothing is uploaded automatically. Import merges Saved and Want to Experience, keeps an
          existing cloud rating in a conflict, and creates private copies of albums with their order
          and covers. Repeated imports skip albums already imported. Local data is kept.
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={history}
              onChange={(e) => setHistory(e.target.checked)}
            />{' '}
            Also import my private history and its recording preference
          </label>
        </p>
        <p>
          Without this separate consent, history and history-only work snapshots are excluded.
          Import is not a two-way synchronization.
        </p>
        <button
          disabled={busy}
          onClick={() => setConfirm(true)}
        >
          Review and import local archive
        </button>
      </section>
      <ProfileEditor />
      <FollowingManager />
      {message && <p role="status">{message}</p>}
      {confirm && (
        <Confirm
          title="Import local archive"
          onClose={() => setConfirm(false)}
          action={async () => {
            if (!supabase) return { ok: false, error: 'Supabase is unavailable.' };
            setBusy(true);
            try {
              local.reload();
              if (local.getSnapshot().blocked)
                throw new Error(
                  'Local data could not be read. Export recovery data before importing.',
                );
              const data = parseArchive(local.rawExport());
              const result = await importLocalArchive(supabase, session.user.id, data, history);
              await scope.repository?.reload();
              setMessage(
                `Import verified. ${result.albumsImported} new albums; ${result.ratingConflicts} rating conflicts kept the cloud rating. Local originals remain intact.`,
              );
              return { ok: true };
            } catch (error) {
              return { ok: false, error: messageOf(error) };
            } finally {
              setBusy(false);
            }
          }}
        >
          Transfer saved works, wishlist, ratings, albums and uploaded covers to this account?{' '}
          {history
            ? 'You also explicitly selected history and its recording preference.'
            : 'Browsing history will not be transferred.'}{' '}
          Existing cloud data will be merged, and local originals will remain.
        </Confirm>
      )}
    </section>
  );
}
