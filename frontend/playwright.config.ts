import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:4000/api/designs',
      cwd: path.join(rootDir, 'backend'),
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      cwd: path.join(rootDir, 'frontend'),
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stderr: 'pipe',
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

