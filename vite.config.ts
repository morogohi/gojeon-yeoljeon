import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { buildMeta } from './build-meta';
export default defineConfig({
  plugins: [viteSingleFile(), buildMeta()],
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 100000000 },
  test: { globals: true, include: ['tests/**/*.test.ts'], reporters: process.env.CI ? ['default', ['json', { outputFile: 'qa-output/unit.json' }]] : ['default'] },
});
