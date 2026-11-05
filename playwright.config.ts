import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the full application running in Docker
 * (`docker compose up -d` from PlataformaBancaria). Run with `npm run e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/support/global-setup.ts',
  // All tests share one backend and its data (balances, daily limits, event counts).
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['APP_URL'] ?? 'http://localhost:4200',
    channel: process.env['BROWSER_CHANNEL'] ?? 'chrome',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'escritorio',
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'movil',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
});
