import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3000";
const e2eBaseUrl = process.env.E2E_BASE_URL ?? `http://localhost:${e2ePort}`;

/**
 * E2E config. `reuseExistingServer` is on because the local workflow keeps `pnpm dev`
 * running in its own terminal; Playwright only starts one when port 3000 is free.
 *
 * These specs talk to the real backend through the Next BFF proxy, so the docker BE
 * must be up and `BE_API_URL` in `.env.local` must point at it (`http://localhost:3001`
 * for the full-docker workflow). A dead tunnel there makes every spec fail on HTML
 * responses rather than on anything the test actually asserts — see ADR-049.
 *
 * Default export is Playwright's required config shape, not a project style choice.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next dev --turbopack --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
