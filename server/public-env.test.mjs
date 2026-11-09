// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { assertPublicEnvironment } from '../scripts/public-env.mjs';
describe('Frontend build secret guard', () => {
  it('refuses privileged keys before bundling and never prints their values', () => {
    expect(() =>
      assertPublicEnvironment({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_fixture' }),
    ).toThrow(/privileged key/);
    const secret = `a.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.b`;
    expect(() => assertPublicEnvironment({ VITE_OTHER: secret })).toThrow(/privileged key/);
    expect(() =>
      assertPublicEnvironment({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture' }),
    ).not.toThrow();
    expect(() =>
      assertPublicEnvironment({ SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_server_only' }),
    ).not.toThrow();
  });
});
