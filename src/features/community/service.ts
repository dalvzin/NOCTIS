import { supabase } from '../../services/supabase';
import type { Work } from '../../types/catalog';
import type { Accent, AlbumCover, AlbumLayout } from '../personal/types';
import { emptyArchive, parseArchive } from '../personal/schema';
export interface Creator {
  id: string;
  username: string | null;
  display_name: string;
  avatar_id: string | null;
}
export interface CommunityAlbum {
  id: string;
  title: string;
  description: string;
  accent: Accent;
  layout: AlbumLayout;
  visibility: 'private' | 'public' | 'unlisted';
  allow_remix: boolean;
  owner: boolean;
  creator: Creator | null;
  cover: AlbumCover;
  media_owner: string;
  likes: number;
  liked: boolean;
  source_album_id: string | null;
  original_creator: string | null;
  items: { work: Work; contributor: string | null; origin_album_id: string | null }[];
}
export interface Profile {
  id: string;
  username: string | null;
  display_name: string;
  bio: string;
  accent: Accent;
  is_public: boolean;
  avatar_id: string | null;
  cover_id: string | null;
}
export type Scope = 'public' | 'followers' | 'private';
export interface Preferences {
  hide_activity: boolean;
  public_ratings: boolean;
  followers_scope: Scope;
  following_scope: Scope;
  category_scopes: Record<string, Scope>;
}
export interface ProfileRecord {
  profile: Profile;
  following: boolean;
  followers: { username: string; display_name: string }[] | null;
  following_list: { username: string; display_name: string }[] | null;
  albums: { id: string; title: string; description: string; featured: boolean }[];
  ratings: { work: Work; rating: number }[];
}
export async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error('Account services are not configured.');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}
export function validSharedWork(work: Work): boolean {
  try {
    const data = emptyArchive();
    data.entries[work.id] = {
      work,
      saved: true,
      wanted: false,
      rating: null,
      updatedAt: new Date().toISOString(),
    };
    parseArchive(JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export async function readAlbum(id?: string, token?: string) {
  const album = await rpc<CommunityAlbum | null>('album_read', {
    p_id: id ?? null,
    p_token: token ?? null,
  });
  if (album) album.items = album.items.filter((item) => validSharedWork(item.work));
  return album;
}
export async function mediaUrl(owner: string, id: string, token?: string) {
  if (!supabase) return null;
  if (token) {
    const { data, error } = await supabase.functions.invoke('shared-cover', { body: { token } });
    if (error) throw error;
    return String(data.url);
  }
  const { data, error } = await supabase.storage
    .from('noctis-media')
    .createSignedUrl(`${owner}/${id}`, 60);
  if (error) throw error;
  return data.signedUrl;
}
