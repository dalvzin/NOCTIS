import type { Work } from '../../types/catalog';
import type {
  ArchiveCommand,
  ArchiveRepository,
  ArchiveView,
  CommandResult,
  PersonalEntry,
} from './types';
import {
  compactWork,
  emptyArchive,
  limits,
  parseArchive,
  pruneEntries,
  STORAGE_KEY,
  validateArchive,
} from './schema';

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export class LocalArchiveRepository implements ArchiveRepository {
  private view: ArchiveView = { data: emptyArchive(), error: null, blocked: false };
  private listeners = new Set<() => void>();
  private storage: () => StoragePort;
  private now: () => string;
  private id: () => string;
  constructor(
    options: {
      storage?: () => StoragePort;
      now?: () => string;
      id?: () => string;
      listenToStorage?: boolean;
    } = {},
  ) {
    this.storage = options.storage ?? (() => window.localStorage);
    this.now = options.now ?? (() => new Date().toISOString());
    this.id = options.id ?? (() => crypto.randomUUID());
    this.listenToStorage = options.listenToStorage ?? true;
    this.reload();
  }
  private listenToStorage: boolean;
  private emit() {
    this.listeners.forEach((listener) => listener());
  }
  private onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) this.reload();
  };
  reload = () => {
    try {
      this.view = {
        data: parseArchive(this.storage().getItem(STORAGE_KEY)),
        error: null,
        blocked: false,
      };
    } catch (error) {
      this.view = {
        data: emptyArchive(),
        blocked: true,
        error: error instanceof Error ? error.message : 'Local storage is unavailable.',
      };
    }
    this.emit();
  };
  getSnapshot = () => this.view;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1 && this.listenToStorage && typeof window !== 'undefined') {
      window.addEventListener('storage', this.onStorage);
      this.reload();
    }
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size && typeof window !== 'undefined')
        window.removeEventListener('storage', this.onStorage);
    };
  };
  rawExport = () => {
    try {
      return this.storage().getItem(STORAGE_KEY) ?? JSON.stringify(this.view.data);
    } catch {
      return JSON.stringify(this.view.data);
    }
  };
  reportIssue = (message: string) => {
    this.view = { ...this.view, error: message };
    this.emit();
  };
  findWork = (category: string, id: string) =>
    Object.values(this.view.data.entries).find(
      (entry) =>
        entry.work.category === category && (entry.work.id === id || entry.work.legacyId === id),
    )?.work;

  dispatch = async (command: ArchiveCommand): Promise<CommandResult> => {
    try {
      const storage = this.storage();
      if (command.type === 'reset') {
        storage.removeItem(STORAGE_KEY);
        this.view = { data: emptyArchive(), error: null, blocked: false };
        this.emit();
        return { ok: true };
      }
      if (this.view.blocked)
        throw new Error(
          'Export or reset the unreadable archive in Settings before making changes.',
        );
      // Relê o valor mais recente para não sobrescrever uma alteração conhecida de outra aba.
      const current = parseArchive(storage.getItem(STORAGE_KEY));
      const next = structuredClone(current),
        stamp = this.now();
      let createdId: string | undefined;
      const entry = (work: Work): PersonalEntry => {
        const existing = next.entries[work.id];
        return (next.entries[work.id] = {
          saved: existing?.saved ?? false,
          wanted: existing?.wanted ?? false,
          rating: existing?.rating ?? null,
          work: compactWork(work),
          updatedAt: stamp,
        });
      };
      switch (command.type) {
        case 'save':
          entry(command.work).saved = command.value;
          break;
        case 'want':
          entry(command.work).wanted = command.value;
          break;
        case 'rate':
          entry(command.work).rating = command.rating;
          break;
        case 'preferences':
          next.preferences = { ...next.preferences, ...command.patch };
          break;
        case 'createAlbum': {
          if (next.albums.length >= limits.albums)
            throw new Error('This browser archive supports up to 50 albums.');
          createdId = this.id();
          if (command.work) entry(command.work);
          next.albums.push({
            ...command.fields,
            title: command.fields.title.trim(),
            id: createdId,
            visibility: 'private',
            workIds: command.work ? [command.work.id] : [],
            cover: { kind: 'none' },
            createdAt: stamp,
            updatedAt: stamp,
          });
          break;
        }
        case 'updateAlbum': {
          const album = next.albums.find((item) => item.id === command.id);
          if (!album) throw new Error('Album not found in this browser.');
          if (command.fields.title !== undefined) album.title = command.fields.title.trim();
          if (command.fields.description !== undefined)
            album.description = command.fields.description;
          if (command.fields.accent !== undefined) album.accent = command.fields.accent;
          if (command.fields.layout !== undefined) album.layout = command.fields.layout;
          if (command.fields.cover !== undefined) album.cover = command.fields.cover;
          album.updatedAt = stamp;
          break;
        }
        case 'albumWork': {
          const album = next.albums.find((item) => item.id === command.id);
          if (!album) throw new Error('Album not found in this browser.');
          if (command.value) {
            entry(command.work);
            if (!album.workIds.includes(command.work.id)) album.workIds.push(command.work.id);
          } else {
            album.workIds = album.workIds.filter((id) => id !== command.work.id);
            if (album.cover.kind === 'work' && album.cover.workId === command.work.id)
              album.cover = { kind: 'none' };
          }
          album.updatedAt = stamp;
          break;
        }
        case 'moveAlbumWork': {
          const album = next.albums.find((item) => item.id === command.id);
          if (!album) throw new Error('Album not found in this browser.');
          const index = album.workIds.indexOf(command.workId),
            target = index + command.direction;
          if (index < 0 || target < 0 || target >= album.workIds.length) return { ok: true };
          [album.workIds[index], album.workIds[target]] = [
            album.workIds[target],
            album.workIds[index],
          ];
          album.updatedAt = stamp;
          break;
        }
        case 'deleteAlbum':
          next.albums = next.albums.filter((album) => album.id !== command.id);
          break;
        case 'visit':
          if (!next.preferences.historyEnabled || next.history[0]?.workId === command.work.id)
            return { ok: true };
          entry(command.work);
          next.history.unshift({ id: this.id(), workId: command.work.id, visitedAt: stamp });
          next.history = next.history.slice(0, limits.history);
          break;
        case 'deleteHistory':
          next.history = next.history.filter((item) => item.id !== command.id);
          break;
        case 'clearHistory':
          next.history = [];
          break;
      }
      pruneEntries(next);
      if (!validateArchive(next))
        throw new Error(
          'This change is invalid or exceeds the local archive limits. Nothing was changed.',
        );
      const serialized = JSON.stringify(next);
      if (serialized.length > limits.characters)
        throw new Error('The personal archive is too large. Export it and remove some items.');
      storage.setItem(STORAGE_KEY, serialized);
      this.view = { data: next, error: null, blocked: false };
      this.emit();
      return { ok: true, id: createdId };
    } catch (error) {
      const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
      const message = ['QuotaExceededError', 'SecurityError'].includes(name)
        ? 'Browser storage is full or blocked. This change was not saved.'
        : error instanceof Error
          ? error.message
          : 'Could not save this change to browser storage.';
      this.reportIssue(message);
      return { ok: false, error: message };
    }
  };
}
