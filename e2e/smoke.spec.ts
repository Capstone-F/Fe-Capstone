import { expect, test } from "@playwright/test";

test("app shell renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

/**
 * Guards the failure mode from ADR-049: when `BE_API_URL` points at a dead tunnel the
 * proxy answers with HTML, every backend call breaks, and it reads like an auth bug.
 * Asserting the content-type catches that in one second instead of one debugging pass.
 */
test("BFF proxy reaches the backend and returns JSON", async ({ request }) => {
  const response = await request.get("/api/be/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toMatchObject({ status: "ok" });
});
