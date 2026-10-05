import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so dist/ works from any sub-path, e.g. https://<user>.github.io/<repo>/
  base: './',
  build: {
    outDir: 'dist',
    // Phaser alone is ~1.2 MB minified; don't warn about it.
    chunkSizeWarningLimit: 2000,
  },
  server: {
    host: true,
  },
});
