import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { artworkMetadata, artworkRatio, artworkUrls } from '../services/artwork';
import {
  normalizeAic,
  normalizeOpenLibrary,
  normalizeMusicBrainz,
  musicArtwork,
} from '../services/providers';
import { searchCatalog, withKnownArtwork } from '../services/catalog';
import { compactWork } from '../features/personal/schema';
import { curatedWorks } from '../data/curated';
import { ItemImage } from '../features/discovery/ItemImage';
import { WorkCard } from '../features/experiences/WorkCard';

const book = curatedWorks.find((work) => work.title === 'Frankenstein')!;
const image = { ...book.image!, thumbnailUrl: 'https://example.org/edition-small.jpg' };
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe('Stage 06.3 artwork resolution', () => {
  it('keeps provider variants attached to the exact Open Library edition', () => {
    const work = normalizeOpenLibrary({
      key: '/works/OL120W',
      title: 'Edition',
      cover_i: 44,
      cover_edition_key: 'OL30M',
    })!;
    expect(artworkUrls(work.image, 'card')[0]).toBe(
      'https://covers.openlibrary.org/b/id/44-M.jpg?default=false',
    );
    expect(artworkUrls(work.image, 'detail')[0]).toBe(
      'https://covers.openlibrary.org/b/id/44-L.jpg?default=false',
    );
    expect(work.image?.sourceUrl).toBe('https://openlibrary.org/books/OL30M');
  });
  it('uses smaller authorized IIIF images and preserves museum composition metadata', () => {
    const work = normalizeAic({
      id: 10,
      title: 'Landscape',
      image_id: 'abcd-1234',
      is_public_domain: true,
      thumbnail: { width: 900, height: 600 },
    })!;
    expect(work.image?.thumbnailUrl).toContain('/full/400,/');
    expect(work.image?.url).toContain('/full/843,/');
    expect(artworkRatio(work)).toBe(1.5);
    expect(
      normalizeAic({ id: 10, title: 'Private', image_id: 'abcd-1234', is_public_domain: false })
        ?.image,
    ).toBeUndefined();
  });
  it('accepts only returned CAA thumbnails from the corresponding release', () => {
    const id = '11111111-2222-3333-4444-555555555555';
    const release = `https://musicbrainz.org/release/${id}`;
    const row = {
      release,
      images: [
        {
          front: true,
          approved: true,
          image: `https://coverartarchive.org/release/${id}/1.jpg`,
          thumbnails: { '250': `https://coverartarchive.org/release/${id}/1-250.jpg` },
        },
      ],
    };
    expect(musicArtwork(row)?.thumbnailUrl).toContain('/1-250.jpg');
    expect(
      musicArtwork({
        ...row,
        images: [{ ...row.images[0], thumbnails: { '250': 'javascript:alert(1)' } }],
      })?.thumbnailUrl,
    ).toBeUndefined();
  });
  it('filters unsafe variants and deduplicates equivalent URLs', () => {
    expect(artworkUrls({ ...image, thumbnailUrl: 'javascript:alert(1)' }, 'card')).toEqual([
      image.url,
    ]);
    expect(artworkUrls({ ...image, thumbnailUrl: image.url }, 'card')).toEqual([image.url]);
    expect(artworkUrls(undefined, 'detail')).toEqual([]);
  });
  it('persists optional artwork metadata without changing the archive version or legacy image contract', () => {
    const work = {
      ...book,
      image: { ...image, kind: 'cover' as const, provider: 'Fixture', width: 600, height: 900 },
    };
    expect(compactWork(work).image).toEqual(work.image);
    expect(compactWork(book).image?.sourceUrl).toBe(book.image?.sourceUrl);
  });
  it('drops invalid dimensions and unsafe metadata before persistence', () => {
    expect(
      artworkMetadata({
        ...image,
        width: -1,
        height: Infinity,
        thumbnailUrl: 'data:text/html,invalid',
      }),
    ).toMatchObject({ width: undefined, height: undefined, thumbnailUrl: undefined });
  });
  it('respects category defaults and uses valid dimensions for photographic composition', () => {
    expect(artworkRatio(book)).toBeCloseTo(2 / 3);
    expect(artworkRatio({ ...book, category: 'music' })).toBe(1);
    expect(
      artworkRatio({
        ...book,
        category: 'photography',
        image: { ...image, width: 1600, height: 900 },
      }),
    ).toBeCloseTo(16 / 9);
  });
  it('does not restore a museum image when a fresh response withdraws public-domain permission', async () => {
    const input = {
      id: 987654,
      title: 'Museum rights fixture',
      image_id: 'abcd-1234',
      is_public_domain: true,
    };
    const publicWork = normalizeAic(input)!;
    const restrictedWork = normalizeAic({ ...input, is_public_domain: false })!;
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [publicWork], statuses: [] })),
    );
    await searchCatalog('museum-rights-first', 'art');
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [restrictedWork], statuses: [] })),
    );
    const result = await searchCatalog('museum-rights-second', 'art');
    expect(result.items.find((work) => work.id === publicWork.id)?.image).toBeUndefined();
  });
  it('keeps an enriched music image when a subsequent search omits it', async () => {
    const work = normalizeMusicBrainz({
      id: '99999999-2222-3333-4444-555555555555',
      title: 'Artwork cache fixture',
    })!;
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [{ ...work, image }], statuses: [] })),
    );
    await searchCatalog('artwork-preservation-first', 'music');
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [work], statuses: [] })),
    );
    const next = await searchCatalog('artwork-preservation-second', 'music');
    expect(next.items.find((item) => item.id === work.id)?.image).toEqual(image);
    expect(withKnownArtwork(work).image).toEqual(image);
  });
});
describe('Stage 06.3 rendering and interaction', () => {
  it('tries each supplied image once then renders an explicit fallback without retrying', () => {
    const work = { ...book, image };
    const { rerender } = render(
      <ItemImage
        work={work}
        context="card"
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', image.thumbnailUrl);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', image.url);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Source image unavailable/).length).toBeGreaterThan(0);
    rerender(
      <ItemImage
        work={work}
        context="card"
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('can show a different record after an earlier URL failed', () => {
    const { rerender } = render(<ItemImage work={book} />);
    fireEvent.error(screen.getByRole('img'));
    rerender(
      <ItemImage
        work={{
          ...book,
          id: 'different',
          image: { ...image, url: 'https://example.org/different.jpg' },
        }}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', image.thumbnailUrl);
  });
  it('reserves the same frame during loading and loads detail artwork eagerly', () => {
    const { container } = render(
      <ItemImage
        work={book}
        hero
      />,
    );
    const frame = container.querySelector('[data-artwork-frame]');
    expect(container.querySelector('figure')).toHaveAttribute('data-image-state', 'loading');
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
    expect(screen.getByRole('img')).toHaveAttribute('decoding', 'async');
    fireEvent.load(screen.getByRole('img'));
    expect(container.querySelector('figure')).toHaveAttribute('data-image-state', 'ready');
    expect(container.querySelector('[data-artwork-frame]')).toBe(frame);
  });
  it('uses a decorative full-composition search thumbnail with a visible fallback', () => {
    const { container } = render(
      <ItemImage
        work={book}
        context="thumbnail"
        decorative
      />,
    );
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('N')).toBeVisible();
  });
  it('does not invent imagery when a real work has no image', () => {
    render(
      <ItemImage
        work={{ ...book, image: undefined }}
        context="card"
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Artwork unavailable')).toBeVisible();
  });
  it('keeps preview activation keyboard accessible and full detail navigation separate', async () => {
    const preview = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <WorkCard
          work={book}
          onPreview={preview}
          returnTo="/search?q=test"
        />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole('button', { name: 'Quick preview: Frankenstein' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(preview).toHaveBeenCalledWith(expect.objectContaining({ id: book.id }));
    expect(screen.getByRole('link', { name: 'Frankenstein' })).toHaveAttribute(
      'href',
      '/books/gutenberg:books:84',
    );
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });
});
