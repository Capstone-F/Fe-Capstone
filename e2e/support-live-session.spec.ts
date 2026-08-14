import { expect, test } from "@playwright/test";

const customer = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "customer@glowscan.local",
  name: "Khách hàng GlowScan",
  provider: "keycloak",
  roles: ["customer"],
  clinicId: null,
  isActive: true,
  createdAt: "2026-08-14T00:00:00.000Z",
  updatedAt: "2026-08-14T00:00:00.000Z",
};

test("a missing live support session is an empty state and stops polling", async ({
  page,
}) => {
  let liveSessionRequests = 0;

  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "e2e-customer-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(customer),
    }),
  );
  await page.route("**/api/be/customers/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        customer: {
          id: "customer-profile-id",
          gender: "FEMALE",
          dateOfBirth: "2000-01-01",
        },
        allergies: [],
      }),
    }),
  );
  await page.route("**/api/be/support/sessions/me", (route) => {
    liveSessionRequests += 1;
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 404,
        message: "No live support session",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Mở hỗ trợ khách hàng" }).click();

  await expect(
    page.getByRole("heading", { name: "Tư Vấn Hỗ Trợ 1-1" }),
  ).toBeVisible();
  await expect(page.getByText("No live support session")).toHaveCount(0);
  await expect.poll(() => liveSessionRequests).toBe(1);

  await page.waitForTimeout(5_500);
  expect(liveSessionRequests).toBe(1);
});
