import { defineConfig } from "@playwright/test";

/**
 * API-only suite covering the admin test plan (TC-ADM-01..13).
 *
 * It talks straight to the docker BE on :3001 — no Next dev server, no browser — so it
 * verifies the contract the admin dashboard is built against, independently of the FE.
 * That is deliberate: several TCs (delivery handover, GHN simulation) have no FE screen
 * yet, and the suite still has to prove whether the BE side works.
 *
 * Serial with a single worker by design: the cases share fixtures across tests
 * (clinic -> expert -> availability, order -> handover -> cancellation).
 *
 * Default export is Playwright's required config shape, not a project style choice.
 */
export default defineConfig({
  testDir: "./e2e/admin-api",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list", { printSteps: true }]],
  timeout: 180_000,
  use: {
    baseURL: process.env.ADMIN_API_BASE_URL ?? "http://localhost:3001",
  },
});
