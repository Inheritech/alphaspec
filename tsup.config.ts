import { defineConfig } from 'tsup';
import { cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  bundle: true,
  target: 'node20',
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  env: {
    ALPHASPEC_VERSION: pkg.version,
  },
  async onSuccess() {
    await cp('src/templates', 'dist/templates', { recursive: true });
  },
});
