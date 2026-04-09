import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    env: {
      // Point to source templates when running tests (not dist bundle)
      ALPHASPEC_TEMPLATES_DIR: join(__dirname, 'src', 'templates'),
    },
  },
});
