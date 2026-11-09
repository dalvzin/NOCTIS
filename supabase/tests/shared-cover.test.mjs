// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { sharedCoverHandler } from '../functions/shared-cover/handler.ts';
describe('Unlisted media capability boundary (local handler)', () => {
  it('does not sign a client-provided owner/path and requires a currently valid token', async () => {
    const sign = vi.fn(async (path) => `https://storage.example/${path}`),
      read = vi.fn(async () => ({
        visibility: 'unlisted',
        media_owner: 'owner-a',
        cover: { kind: 'upload', imageId: 'image-a' },
      }));
    const handler = sharedCoverHandler(read, sign);
    const result = await handler(
      new Request('https://local.test', {
        method: 'POST',
        body: JSON.stringify({ token: 'a'.repeat(64), path: 'owner-b/private' }),
      }),
    );
    expect(result.status).toBe(200);
    expect(sign).toHaveBeenCalledWith('owner-a/image-a');
    read.mockResolvedValueOnce(null);
    expect(
      (
        await handler(
          new Request('https://local.test', {
            method: 'POST',
            body: JSON.stringify({ token: 'b'.repeat(64) }),
          }),
        )
      ).status,
    ).toBe(404);
    expect(sign).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid tokens, private records and non-POST requests', async () => {
    const sign = vi.fn(),
      handler = sharedCoverHandler(
        async () => ({
          visibility: 'private',
          media_owner: 'owner',
          cover: { kind: 'upload', imageId: 'secret' },
        }),
        sign,
      );
    expect((await handler(new Request('https://local.test', { method: 'GET' }))).status).toBe(405);
    expect(
      (
        await handler(
          new Request('https://local.test', { method: 'POST', body: '{"token":"guess"}' }),
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await handler(
          new Request('https://local.test', {
            method: 'POST',
            body: JSON.stringify({ token: 'a'.repeat(64) }),
          }),
        )
      ).status,
    ).toBe(404);
    expect(sign).not.toHaveBeenCalled();
  });
});
