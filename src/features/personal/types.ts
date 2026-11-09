import type { Work } from '../../types/catalog';

export type Accent = 'bronze' | 'sage' | 'slate' | 'rose';
export type AlbumLayout = 'grid' | 'editorial' | 'list';
export type AlbumCover =
  { kind: 'none' } | { kind: 'work'; workId: string } | { kind: 'upload'; imageId: string };
export interface PersonalEntry {
  work: Work;
  saved: boolean;
  wanted: boolean;
  rating: number | null;
  updatedAt: string;
}
export interface PersonalAlbum {
  id: string;
  title: string;
  description: string;
  accent: Accent;
  layout: AlbumLayout;
  visibility: 'private';
  workIds: string[];
  cover: AlbumCover;
  createdAt: string;
  updatedAt: string;
}
export interface ArchiveData {
  version: 1;
  entries: Record<string, PersonalEntry>;
  albums: PersonalAlbum[];
  history: { id: string; workId: string; visitedAt: string }[];
  preferences: { historyEnabled: boolean; motion: 'system' | 'reduce' };
}
export interface ArchiveView {
  data: ArchiveData;
  error: string | null;
  blocked: boolean;
  loading?: boolean;
}
export type AlbumFields = Pick<PersonalAlbum, 'title' | 'description' | 'accent' | 'layout'>;
export type ArchiveCommand =
  | { type: 'save' | 'want'; work: Work; value: boolean }
  | { type: 'rate'; work: Work; rating: number | null }
  | { type: 'createAlbum'; fields: AlbumFields; work?: Work }
  | { type: 'updateAlbum'; id: string; fields: Partial<AlbumFields> & { cover?: AlbumCover } }
  | { type: 'albumWork'; id: string; work: Work; value: boolean }
  | { type: 'moveAlbumWork'; id: string; workId: string; direction: -1 | 1 }
  | { type: 'deleteAlbum'; id: string }
  | { type: 'preferences'; patch: Partial<ArchiveData['preferences']> }
  | { type: 'visit'; work: Work }
  | { type: 'deleteHistory'; id: string }
  | { type: 'clearHistory' | 'reset' };
export interface CommandResult {
  ok: boolean;
  id?: string;
  error?: string;
}
export interface ArchiveRepository {
  readonly mode?: 'local' | 'cloud';
  getSnapshot: () => ArchiveView;
  subscribe: (listener: () => void) => () => void;
  dispatch: (command: ArchiveCommand) => Promise<CommandResult>;
  findWork: (category: string, id: string) => Work | undefined;
  rawExport: () => string;
  reportIssue: (message: string) => void;
}
