import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Jeden plik dist/index.html działa z dwukliku (file://), z serwera i z telefonu.
export default defineConfig({
  base: './',
  assetsInclude: ['**/*.glb'],
  plugins: [viteSingleFile()],
  server: { port: 5180, host: true },
  preview: { port: 5180, host: true },
  build: { chunkSizeWarningLimit: 1500 },
});
