import { expect, test, type Page } from "@playwright/test";

const CLINIC_ID = "c83ed40b-3f17-4ffa-a926-6ff07e7e65d7";

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "admin-e2e-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      json: {
        id: "admin-id",
        email: "admin@glowscan.local",
        name: "GlowScan Admin",
        provider: "local",
        roles: ["app_admin"],
        clinicId: null,
        isActive: true,
        createdAt: "2026-08-20T00:00:00.000Z",
        updatedAt: "2026-08-20T00:00:00.000Z",
      },
    }),
  );
}

test("admin updates commission for one clinic with decimal precision", async ({
  page,
}) => {
  await page.route("**/api/be/**", (route) => route.fulfill({ json: {} }));
  await authenticateAdmin(page);
  let commissionPercent = 10;
  let patchBody: unknown;

  await page.route("**/api/be/stock/low-stock-threshold", (route) =>
    route.fulfill({ json: { threshold: 10 } }),
  );
  await page.route(
    "**/api/be/admin/commerce-settings/survey-combo-discount",
    (route) => route.fulfill({ json: { percent: 10, minSubtotalVnd: 0 } }),
  );
  await page.route("**/api/be/admin/clinics**", async (route) => {
    if (route.request().method() === "PATCH") {
      patchBody = route.request().postDataJSON();
      commissionPercent = (patchBody as { percent: number }).percent;
      await route.fulfill({
        json: {
          id: CLINIC_ID,
          name: "GlowScan District 1 Clinic",
          address: "12 Nguyễn Huệ, Quận 1",
          latitude: 10.77,
          longitude: 106.7,
          isActive: true,
          commissionPercent,
          createdAt: "2026-08-20T00:00:00.000Z",
          updatedAt: "2026-08-20T00:00:00.000Z",
        },
      });
      return;
    }

    await route.fulfill({
      json: {
        items: [
          {
            id: CLINIC_ID,
            name: "GlowScan District 1 Clinic",
            address: "12 Nguyễn Huệ, Quận 1",
            latitude: 10.77,
            longitude: 106.7,
            isActive: true,
            commissionPercent,
            createdAt: "2026-08-20T00:00:00.000Z",
            updatedAt: "2026-08-20T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 8,
      },
    });
  });

  await page.goto("/dashboard/commerce");
  await expect(page.getByText("Hoa hồng theo phòng khám")).toBeVisible();

  const input = page
    .getByLabel("Tỷ lệ hoa hồng của GlowScan District 1 Clinic")
    .first();
  await input.fill("12.5");
  await page.getByRole("button", { name: "Lưu", exact: true }).first().click();

  await expect(
    page.getByRole("heading", { name: "Xác nhận thay đổi hoa hồng" }),
  ).toBeVisible();
  await expect(
    page.getByText("GlowScan District 1 Clinic").last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận lưu" }).click();

  await expect.poll(() => patchBody).toEqual({ percent: 12.5 });
  await expect(input).toHaveValue("12.5");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("Hoa hồng theo phòng khám")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test("guest expert routes redirect to login before requesting expert data", async ({
  page,
}) => {
  let expertRequests = 0;
  await page.route("**/api/be/experts**", (route) => {
    expertRequests += 1;
    return route.fulfill({ json: { items: [], total: 0 } });
  });

  await page.goto("/experts");
  await page.waitForURL(/\/login\?redirectTo=%2Fexperts$/);
  expect(expertRequests).toBe(0);

  await page.goto(`/experts/${CLINIC_ID}`);
  await page.waitForURL(
    new RegExp(`/login\\?redirectTo=%2Fexperts%2F${CLINIC_ID}$`),
  );
  expect(expertRequests).toBe(0);
});

test("landing explains the protected journey without loading experts", async ({
  page,
}) => {
  let expertRequests = 0;
  await page.route("**/api/be/experts**", (route) => {
    expertRequests += 1;
    return route.fulfill({ json: { items: [], total: 0 } });
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Kết nối đúng chuyên gia trong 3 bước" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Đăng nhập để chọn chuyên gia/ }),
  ).toHaveAttribute("href", "/login?redirectTo=%2Fexperts");
  expect(expertRequests).toBe(0);
});
