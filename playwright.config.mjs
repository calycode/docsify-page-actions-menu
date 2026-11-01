import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 4173);

export default defineConfig({
   testDir: './tests',
   timeout: 30_000,
   expect: { timeout: 5_000 },
   fullyParallel: true,
   forbidOnly: !!process.env.CI,
   retries: process.env.CI ? 2 : 0,
   workers: process.env.CI ? 2 : undefined,
   reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
   outputDir: 'test-results',
   use: {
      baseURL: `http://127.0.0.1:${PORT}`,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      colorScheme: 'light',
      locale: 'en-US',
   },
   projects: [
      {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 720 } },
      },
   ],
   webServer: {
      command: 'node tests/server.mjs',
      url: `http://127.0.0.1:${PORT}/harness.html?docsify=v5&entry=dist&config=none`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { PORT: String(PORT) },
   },
});
