const DATABASE = 'noctis-personal-images';
function database(): Promise<IDBDatabase> { return new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') { reject(new Error('This browser does not support local image storage.')); return; }
  const request = indexedDB.open(DATABASE, 1);
  let settled = false;
  const timer = setTimeout(() => { settled = true; reject(new Error('Image storage did not respond. Close other NOCTIS tabs and try again.')); }, 8000);
  request.onupgradeneeded = () => { request.result.createObjectStore('covers'); };
  request.onsuccess = () => { clearTimeout(timer); if (settled) { request.result.close(); return; } settled = true; request.result.onversionchange = () => request.result.close(); resolve(request.result); };
  request.onerror = () => { clearTimeout(timer); settled = true; reject(new Error('Image storage is unavailable.')); };
  request.onblocked = () => { clearTimeout(timer); settled = true; reject(new Error('Close other NOCTIS tabs to access image storage.')); };
}); }
async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const tx = db.transaction('covers', mode);
      timer = setTimeout(() => { try { tx.abort(); } catch { db.close(); reject(new Error('Image storage did not respond.')); } }, 8000);
      tx.oncomplete = () => { clearTimeout(timer); db.close(); resolve(request.result); };
      tx.onerror = tx.onabort = () => { clearTimeout(timer); db.close(); reject(new Error('Could not store or remove this cover. Browser storage may be full or blocked.')); };
      const request = run(tx.objectStore('covers'));
    } catch { clearTimeout(timer); db.close(); reject(new Error('Could not access local image storage.')); }
  });
}
export const localCoverStore = {
  get: (id: string) => transaction('readonly', store => store.get(id) as IDBRequest<Blob | undefined>),
  put: (id: string, blob: Blob) => transaction('readwrite', store => store.put(blob, id)),
  remove: (id: string) => transaction('readwrite', store => store.delete(id)),
  clear: () => transaction('readwrite', store => store.clear()),
};
export type CoverStorage=typeof localCoverStore;
export const coverStore=localCoverStore;
// O fallback evita depender de createImageBitmap em todos os navegadores.
async function decodeCover(file: Blob): Promise<{ width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file); } catch { /* Tenta o decodificador <img>. */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), image = new Image();
    const finish = () => { clearTimeout(timer); URL.revokeObjectURL(url); };
    const timer = setTimeout(() => { finish(); reject(new Error('Image decoding timed out.')); }, 8000);
    image.onload = () => { finish(); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { finish(); reject(new Error('Image decoding failed.')); };
    image.src = url;
  });
}
export async function validateCover(file: File, decode: (file: Blob) => Promise<{ width: number; height: number; close?: () => void }> = decodeCover) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image.');
  if (!file.size || file.size > 2 * 1024 * 1024) throw new Error('Cover images must be smaller than 2 MB.');
  let image;
  try { image = await decode(file); } catch { throw new Error('This file could not be decoded as an image.'); }
  const valid = image.width > 0 && image.height > 0 && image.width <= 6000 && image.height <= 6000 && image.width * image.height <= 16_000_000;
  image.close?.();
  if (!valid) throw new Error('Choose an image up to 6000 pixels per side and 16 megapixels.');
}
