import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      SECRET_KEY: 'test-secret-key',
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
