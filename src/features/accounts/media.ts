import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoverStorage } from '../personal/images';
export function cloudMedia(client: SupabaseClient, userId: string): CoverStorage {
  const bucket = client.storage.from('noctis-media');
  const path = (id: string) => `${userId}/${id}`;
  return {
    get: async (id) => {
      const { data, error } = await bucket.download(path(id));
      if (error) throw error;
      return data ?? undefined;
    },
    put: async (id, blob) => {
      const { error } = await bucket.upload(path(id), blob, {
        upsert: false,
        contentType: blob.type,
        cacheControl: '60',
      });
      if (error) throw error;
      return id;
    },
    remove: async (id) => {
      const { error } = await bucket.remove([path(id)]);
      if (error) throw error;
    },
    clear: async () => {
      let batch;
      do {
        const { data, error } = await bucket.list(userId, { limit: 100 });
        if (error) throw error;
        batch = data ?? [];
        if (batch.length) {
          const { error } = await bucket.remove(batch.map((file) => path(file.name)));
          if (error) throw error;
        }
      } while (batch.length === 100);
    },
  };
}
