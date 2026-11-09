import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { catalogMiddleware } from './server/catalog.mjs';
import { loadEnv } from 'vite';
import { checkViteEnvironment } from './scripts/public-env.mjs';
export default defineConfig(({ mode }) => {
  checkViteEnvironment(mode, loadEnv);
  return {
    plugins: [
      react(),
      {
        name: 'noctis-catalog',
        configureServer(server) {
          server.middlewares.use(catalogMiddleware());
        },
        configurePreviewServer(server) {
          server.middlewares.use(catalogMiddleware());
        },
      },
    ],
    test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
  };
});
