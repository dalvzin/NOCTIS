import { coverStore, validateCover, type CoverStorage } from './images';
import type { AlbumCover, ArchiveRepository, PersonalAlbum } from './types';

export async function changeAlbumCover(repository: ArchiveRepository, album: PersonalAlbum, cover: AlbumCover, storage:CoverStorage=coverStore) {
  const result = await repository.dispatch({ type: 'updateAlbum', id: album.id, fields: { cover } });
  if (result.ok && album.cover.kind === 'upload' && (cover.kind !== 'upload' || cover.imageId !== album.cover.imageId)) {
    try { await storage.remove(album.cover.imageId); }
    catch { repository.reportIssue('The old uploaded cover could not be removed. Use Clear personal archive in Settings to retry cleanup.'); }
  }
  return result;
}

export async function uploadAlbumCover(repository: ArchiveRepository, album: PersonalAlbum, file: File, storage:CoverStorage=coverStore) {
  await validateCover(file);
  const imageId = crypto.randomUUID();
  // O Blob é confirmado antes de trocar a referência. Se os metadados falharem,
  // a capa antiga permanece válida e a nova imagem não utilizada é removida.
  await storage.put(imageId, file);
  const result = await changeAlbumCover(repository, album, { kind: 'upload', imageId },storage);
  if (!result.ok) {
    try { await storage.remove(imageId); }
    catch { repository.reportIssue('An unused cover could not be removed. Clear personal archive in Settings to retry cleanup.'); }
  }
  return result;
}
