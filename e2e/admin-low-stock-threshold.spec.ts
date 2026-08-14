import { expect, test, type Page } from "@playwright/test";

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "admin-e2e-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: "admin-id",
        email: "admin@glowscan.local",
        name: "GlowScan Admin",
        provider: "local",
        roles: ["app_admin"],
        clinicId: null,
        isActive: true,
        createdAt: "2026-08-14T00:00:00.000Z",
        updatedAt: "2026-08-14T00:00:00.000Z",
      }),
    }),
  );
}

test("admin updates the low-stock threshold with an integer value", async ({
  page,
}) => {
  await authenticateAdmin(page);
  let threshold = 10;
  let patchBody: unknown;

  await page.route("**/api/be/stock/low-stock-threshold", async (route) => {
    if (route.request().method() === "PATCH") {
      patchBody = route.request().postDataJSON();
      threshold = (patchBody as { threshold: number }).threshold;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ threshold }),
    });
  });
  await page.route(
    "**/api/be/admin/commerce-settings/survey-combo-discount",
    (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ percent: 10, minSubtotalVnd: 0 }),
      }),
  );
  await page.route(
    "**/api/be/admin/commerce-settings/platform-commission",
    (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ percent: 10 }),
      }),
  );

  await page.goto("/dashboard/commerce");
  await expect(page.getByText("Ngưỡng Cảnh Báo Tồn Kho")).toBeVisible();

  const input = page.getByLabel("Số lượng cảnh báo");
  await expect(input).toHaveValue("10");
  await input.fill("25");
  await page.getByRole("button", { name: "Lưu Ngưỡng Cảnh Báo" }).click();

  await expect.poll(() => patchBody).toEqual({ threshold: 25 });
  await expect(page.getByText("Giá trị hiện tại: 25 sản phẩm.")).toBeVisible();
});

test("admin threshold card shows API errors instead of an empty state", async ({
  page,
}) => {
  await authenticateAdmin(page);
  await page.route("**/api/be/stock/low-stock-threshold", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Không thể đọc cấu hình" }),
    }),
  );

  await page.goto("/dashboard/commerce");
  await expect(
    page.getByText("Không thể tải ngưỡng cảnh báo tồn kho."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
});
