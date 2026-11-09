import { describe, expect, it } from 'vitest';
import { LocalArchiveRepository } from '../features/personal/repository';
import {
  compactWork,
  emptyArchive,
  parseArchive,
  STORAGE_KEY,
  validateArchive,
} from '../features/personal/schema';
import { validateCover } from '../features/personal/images';
import { localCatalog } from '../services/catalog';
import type { AlbumFields } from '../features/personal/types';

const fields: AlbumFields = {
  title: 'Night connections',
  description: 'Across rooms',
  accent: 'bronze',
  layout: 'grid',
};
function fixture() {
  const store = new Map<string, string>();
  let sequence = 0,
    fail = false;
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (fail) throw new DOMException('Full', 'QuotaExceededError');
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  const create = () =>
    new LocalArchiveRepository({
      storage: () => storage,
      id: () => `test-${++sequence}`,
      now: () => '2026-11-04T12:00:00.000Z',
      listenToStorage: false,
    });
  return {
    store,
    storage,
    create,
    repo: create(),
    fail: () => {
      fail = true;
    },
  };
}
describe('Personal archive repository', () => {
  it.each(['books', 'films', 'games', 'music', 'photography', 'art'])(
    'persists %s independently without duplicate references',
    async (category) => {
      const { repo, create } = fixture();
      const work = localCatalog.find((item) => item.category === category)!;
      expect((await repo.dispatch({ type: 'save', work, value: true })).ok).toBe(true);
      await repo.dispatch({ type: 'save', work, value: true });
      await repo.dispatch({ type: 'want', work, value: true });
      await repo.dispatch({ type: 'rate', work, rating: 4.5 });
      await repo.dispatch({ type: 'save', work, value: false });
      const data = create().getSnapshot().data;
      expect(Object.keys(data.entries)).toEqual([work.id]);
      expect(data.entries[work.id]).toMatchObject({ saved: false, wanted: true, rating: 4.5 });
    },
  );
  it('accepts half stars, changes/removes ratings and rejects invalid values without mutation', async () => {
    const { repo } = fixture();
    const work = localCatalog[0];
    for (const rating of [0.5, 1, 1.5, 5])
      expect((await repo.dispatch({ type: 'rate', work, rating })).ok).toBe(true);
    expect((await repo.dispatch({ type: 'rate', work, rating: 4.7 })).ok).toBe(false);
    expect(repo.getSnapshot().data.entries[work.id].rating).toBe(5);
    await repo.dispatch({ type: 'rate', work, rating: null });
    expect(repo.getSnapshot().data.entries[work.id]).toBeUndefined();
  });
  it('creates, edits, deduplicates, reorders, removes and deletes multimedia albums after refresh', async () => {
    const { repo, create } = fixture();
    const book = localCatalog.find((w) => w.category === 'books')!,
      music = localCatalog.find((w) => w.category === 'music')!;
    const result = await repo.dispatch({ type: 'createAlbum', fields, work: book });
    expect(result.ok).toBe(true);
    const id = result.id!;
    for (let i = 0; i < 2; i++)
      await repo.dispatch({ type: 'albumWork', id, work: music, value: true });
    await repo.dispatch({
      type: 'updateAlbum',
      id,
      fields: {
        title: 'Changed',
        accent: 'sage',
        layout: 'list',
        description: 'New',
        cover: { kind: 'work', workId: book.id },
      },
    });
    await repo.dispatch({ type: 'moveAlbumWork', id, workId: music.id, direction: -1 });
    expect(create().getSnapshot().data.albums[0]).toMatchObject({
      title: 'Changed',
      accent: 'sage',
      layout: 'list',
      visibility: 'private',
      workIds: [music.id, book.id],
    });
    await repo.dispatch({ type: 'albumWork', id, work: book, value: false });
    expect(repo.getSnapshot().data.albums[0].cover.kind).toBe('none');
    await repo.dispatch({ type: 'deleteAlbum', id });
    expect(repo.getSnapshot().data.albums).toEqual([]);
    expect(repo.getSnapshot().data.entries).toEqual({});
  });
  it('rejects invalid albums, missing cover members and unsupported visibility', async () => {
    const { repo } = fixture();
    expect(
      (await repo.dispatch({ type: 'createAlbum', fields: { ...fields, title: '   ' } })).ok,
    ).toBe(false);
    const { id } = await repo.dispatch({ type: 'createAlbum', fields });
    expect(
      (
        await repo.dispatch({
          type: 'updateAlbum',
          id: id!,
          fields: { cover: { kind: 'work', workId: 'missing' } },
        })
      ).ok,
    ).toBe(false);
    const raw = structuredClone(repo.getSnapshot().data);
    (raw.albums[0] as unknown as { visibility: string }).visibility = 'public';
    expect(validateArchive(raw)).toBe(false);
  });
  it('history is opt-in, consecutive-deduplicated, paused and removable without deleting saved works', async () => {
    const { repo } = fixture();
    const [a, b] = localCatalog;
    await repo.dispatch({ type: 'visit', work: a });
    expect(repo.getSnapshot().data.entries).toEqual({});
    await repo.dispatch({ type: 'preferences', patch: { historyEnabled: true } });
    await repo.dispatch({ type: 'visit', work: a });
    await repo.dispatch({ type: 'visit', work: a });
    expect(repo.getSnapshot().data.history).toHaveLength(1);
    await repo.dispatch({ type: 'preferences', patch: { historyEnabled: false } });
    await repo.dispatch({ type: 'visit', work: b });
    expect(repo.getSnapshot().data.history).toHaveLength(1);
    await repo.dispatch({ type: 'preferences', patch: { historyEnabled: true } });
    await repo.dispatch({ type: 'visit', work: b });
    await repo.dispatch({ type: 'deleteHistory', id: repo.getSnapshot().data.history[1].id });
    expect(repo.getSnapshot().data.entries[a.id]).toBeUndefined();
    await repo.dispatch({ type: 'save', work: b, value: true });
    await repo.dispatch({ type: 'clearHistory' });
    expect(repo.getSnapshot().data.history).toEqual([]);
    expect(repo.getSnapshot().data.entries[b.id].saved).toBe(true);
  });
  it('bounds history and discards unreferenced snapshots', async () => {
    const { repo } = fixture();
    await repo.dispatch({ type: 'preferences', patch: { historyEnabled: true } });
    for (let i = 0; i < 105; i++)
      await repo.dispatch({
        type: 'visit',
        work: { ...localCatalog[0], id: `noctis:books:test-${i}` },
      });
    expect(repo.getSnapshot().data.history).toHaveLength(100);
    expect(Object.keys(repo.getSnapshot().data.entries)).toHaveLength(100);
  });
  it.each(['{broken', '{"version":99}', '{"version":1,"entries":{}}'])(
    'preserves unreadable storage: %s',
    async (raw) => {
      const { store, create } = fixture();
      store.set(STORAGE_KEY, raw);
      const repo = create();
      expect(repo.getSnapshot().blocked).toBe(true);
      expect((await repo.dispatch({ type: 'save', work: localCatalog[0], value: true })).ok).toBe(
        false,
      );
      expect(repo.rawExport()).toBe(raw);
      expect(store.get(STORAGE_KEY)).toBe(raw);
      await repo.dispatch({ type: 'reset' });
      expect(repo.getSnapshot().blocked).toBe(false);
    },
  );
  it('never reports unsaved data as persisted when storage is full', async () => {
    const f = fixture();
    f.fail();
    expect((await f.repo.dispatch({ type: 'save', work: localCatalog[0], value: true })).ok).toBe(
      false,
    );
    expect(f.repo.getSnapshot().data.entries).toEqual({});
    expect(f.repo.getSnapshot().error).toMatch(/full or blocked/);
  });
  it('reset only clears its own key and returns history to off', async () => {
    const { repo, store } = fixture();
    store.set('unrelated', 'keep');
    await repo.dispatch({ type: 'preferences', patch: { historyEnabled: true, motion: 'reduce' } });
    await repo.dispatch({ type: 'reset' });
    expect(store.get('unrelated')).toBe('keep');
    expect(repo.getSnapshot().data).toEqual(emptyArchive());
  });
  it('retains all catalog snapshots, source rights and safe destinations without API payloads', () => {
    for (const work of localCatalog) {
      const data = emptyArchive();
      data.entries[work.id] = {
        work: compactWork(work),
        saved: true,
        wanted: false,
        rating: null,
        updatedAt: '2026-11-04T12:00:00Z',
      };
      expect(() => parseArchive(JSON.stringify(data)), work.id).not.toThrow();
      expect(data.entries[work.id].work.mediaPreviews).toEqual([]);
    }
  });
  it('rejects dangerous image URLs in persisted metadata', () => {
    const data = emptyArchive();
    data.entries[localCatalog[0].id] = {
      work: {
        ...compactWork(localCatalog[0]),
        image: {
          url: 'javascript:alert(1)',
          sourceUrl: 'https://example.com',
          alt: '',
          credit: '',
          rights: '',
        },
      },
      saved: true,
      wanted: false,
      rating: null,
      updatedAt: '2026-11-04T12:00:00Z',
    };
    expect(validateArchive(data)).toBe(false);
  });
});
describe('Local cover validation', () => {
  const small = new File(['image bytes'], 'cover.png', { type: 'image/png' });
  it('accepts decodable images and releases the decoder', async () => {
    let closed = false;
    await validateCover(small, async () => ({
      width: 1600,
      height: 900,
      close: () => {
        closed = true;
      },
    }));
    expect(closed).toBe(true);
  });
  it('rejects SVG, oversized, broken and excessive resolution images', async () => {
    await expect(
      validateCover(new File(['<svg/>'], 'cover.svg', { type: 'image/svg+xml' }), async () => ({
        width: 1,
        height: 1,
      })),
    ).rejects.toThrow(/JPEG/);
    await expect(
      validateCover(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }),
        async () => ({ width: 1, height: 1 }),
      ),
    ).rejects.toThrow(/2 MB/);
    await expect(
      validateCover(small, async () => {
        throw new Error();
      }),
    ).rejects.toThrow(/decoded/);
    await expect(validateCover(small, async () => ({ width: 6000, height: 6000 }))).rejects.toThrow(
      /megapixels/,
    );
  });
});
