import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Roda em paralelo só se cada teste usa storage isolado (o nosso usa).
  // Sequencial pra evitar race com dev server único do Vite (HMR fica
  // turbulento com múltiplos browsers carregando simultâneo). Suíte
  // pequena, ~10s sequencial é aceitável.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',           // grava trace só quando falha + retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Sobe o dev server automaticamente se não estiver rodando.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});
