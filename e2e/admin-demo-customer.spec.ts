import { expect, test, type Page } from "@playwright/test";

const admin = {
  id: "admin-id",
  email: "admin@glowscan.local",
  name: "GlowScan Admin",
  provider: "keycloak",
  roles: ["app_admin"],
  clinicId: null,
  isActive: true,
  createdAt: "2026-08-14T00:00:00.000Z",
  updatedAt: "2026-08-14T00:00:00.000Z",
};

const seededCustomer = {
  credentials: {
    email: "demo.customer.abc@glowscan.local",
    password: "P@ssw0rd",
    userId: "demo-user-id",
    customerId: "demo-customer-id",
    keycloakSub: "demo-keycloak-sub",
  },
  routine: {
    routineId: "demo-routine-id",
    title: "Quy trình chăm sóc da hằng ngày (demo)",
    activeFromDate: "2026-07-31",
    morningSteps: 4,
    eveningSteps: 4,
    sourceOrderId: "demo-order-id",
  },
  history: {
    completedDays: 12,
    missedDays: 2,
    currentStreak: 8,
    checkInCount: 12,
    from: "2026-07-31",
    to: "2026-08-13",
  },
  lowStock: {
    productVariantId: "variant-id",
    sku: "TO-NIACINAMIDE-10-ZINC-30ML",
    productName: "Tinh chất The Ordinary Niacinamide 10% + Zinc 1%",
    bottleMl: 30,
    dailyMl: 2.14,
    remainingMl: 4.32,
    daysLeft: 2,
    warning: "LOW",
    stepIds: ["step-id"],
  },
  nextSteps: [
    "Đăng nhập bằng tài khoản vừa tạo",
    "Mở màn hình Today để xem cảnh báo LOW",
  ],
};

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "e2e-admin-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(admin),
    }),
  );
  await page.route("**/api/be/customers/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ customer: null, allergies: [] }),
    }),
  );
  await page.route("**/api/be/support/sessions/me", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ statusCode: 404, message: "Not found" }),
    }),
  );
}

test("admin seeds default live-demo data once and receives a readable result", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await authenticateAdmin(page);
  const payloads: unknown[] = [];
  let releaseResponse: () => void = () => undefined;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  await page.route("**/api/be/admin/demo/customers", async (route) => {
    payloads.push(route.request().postDataJSON());
    await responseGate;
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(seededCustomer),
    });
  });

  await page.goto("/dashboard/qa-cheats");
  const seedButton = page.getByRole("button", {
    name: "Tạo khách hàng demo ngay",
  });
  await seedButton.click();

  await expect(
    page.getByRole("button", { name: "Đang chuẩn bị dữ liệu demo..." }),
  ).toBeDisabled();
  expect(payloads).toHaveLength(1);
  releaseResponse();
  await expect(
    page.getByRole("heading", { name: "Khách hàng demo đã sẵn sàng" }),
  ).toBeVisible();
  expect(payloads).toEqual([{}]);
  await expect(page.getByText(seededCustomer.credentials.email)).toBeVisible();
  await expect(page.getByText("Mật khẩu chỉ hiển thị một lần")).toBeVisible();
  await expect(page.getByText("LOW", { exact: true })).toBeVisible();
  await expect(page.getByText("4.32 ml", { exact: true })).toBeVisible();
  await expect(page.getByText("2 ngày", { exact: true })).toBeVisible();
  await expect(
    page.getByText(seededCustomer.nextSteps[1], { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Sao chép Email" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(seededCustomer.credentials.email);

  const walletLink = page.getByRole("link", {
    name: "Mở công cụ nạp ví cho tài khoản này",
  });
  await expect(walletLink).toHaveAttribute(
    "href",
    /\/dashboard\/commerce\?.*userId=demo-user-id/,
  );
});

test("client validation blocks invalid custom demo values", async ({
  page,
}) => {
  await authenticateAdmin(page);
  let requestCount = 0;
  await page.route("**/api/be/admin/demo/customers", (route) => {
    requestCount += 1;
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(seededCustomer),
    });
  });

  await page.goto("/dashboard/qa-cheats");
  await page.getByLabel("Mật khẩu tùy chọn").fill("12345");
  await page.getByLabel("Số ngày lịch sử").fill("6");
  await page.getByRole("button", { name: "Tạo khách hàng demo ngay" }).click();

  await expect(
    page.getByText("Mật khẩu phải có từ 6 đến 72 ký tự."),
  ).toBeVisible();
  await expect(
    page.getByText("Số ngày lịch sử phải là số nguyên từ 7 đến 60."),
  ).toBeVisible();
  expect(requestCount).toBe(0);
});

test("custom values are sent and a duplicate email stays inline", async ({
  page,
}) => {
  await authenticateAdmin(page);
  const payloads: unknown[] = [];
  await page.route("**/api/be/admin/demo/customers", (route) => {
    const payload = route.request().postDataJSON();
    payloads.push(payload);
    if (payload.email === "duplicate@glowscan.local") {
      return route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 409,
          message: "Email đã có tài khoản trong hệ thống",
          error: "Conflict",
        }),
      });
    }
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(seededCustomer),
    });
  });

  await page.goto("/dashboard/qa-cheats");
  await page.getByLabel("Email tùy chọn").fill("duplicate@glowscan.local");
  await page.getByLabel("Mật khẩu tùy chọn").fill("Custom123!");
  await page.getByLabel("Họ tên tùy chọn").fill("Khách Demo Hội Đồng");
  await page.getByLabel("Số ngày lịch sử").fill("21");
  await page.getByRole("button", { name: "Tạo khách hàng demo ngay" }).click();

  await expect(
    page.getByText("Email đã có tài khoản trong hệ thống"),
  ).toBeVisible();
  expect(payloads).toEqual([
    {
      email: "duplicate@glowscan.local",
      password: "Custom123!",
      fullName: "Khách Demo Hội Đồng",
      historyDays: 21,
    },
  ]);
});

test("a catalog precondition error is shown without clearing the form", async ({
  page,
}) => {
  await authenticateAdmin(page);
  await page.route("**/api/be/admin/demo/customers", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 400,
        message:
          "Danh mục chưa có sản phẩm theo ml. Vui lòng chạy seed catalog.",
        error: "Bad Request",
      }),
    }),
  );

  await page.goto("/dashboard/qa-cheats");
  await page.getByLabel("Họ tên tùy chọn").fill("Khách Demo Giữ Lại");
  await page.getByRole("button", { name: "Tạo khách hàng demo ngay" }).click();

  await expect(
    page.getByText(
      "Danh mục chưa có sản phẩm theo ml. Vui lòng chạy seed catalog.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Họ tên tùy chọn")).toHaveValue(
    "Khách Demo Giữ Lại",
  );
});
