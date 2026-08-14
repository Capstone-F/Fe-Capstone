import { expect, test } from "@playwright/test";

const period = {
  range: "30d",
  from: "2026-07-15",
  to: "2026-08-13",
  timezone: "Asia/Ho_Chi_Minh",
};

test("admin dashboard renders authoritative KPI and drill-down links", async ({
  page,
}) => {
  await page.route("**/api/be/admin/dashboard?range=30d", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        period,
        metrics: {
          activeCustomers: 120,
          activeExperts: 8,
          activeClinics: 4,
          paidOrders: 35,
          grossProductSalesVnd: 12500000,
          discountsVnd: 500000,
          shippingCollectedVnd: 300000,
          productPaymentsCollectedVnd: 12300000,
          productRefundsVnd: 400000,
          averageOrderValueVnd: 351429,
          consultationFeesCollectedVnd: 2400000,
          consultationRefundsVnd: 200000,
          platformCommissionRevenueVnd: 240000,
        },
        attention: {
          submittedStockForms: 3,
          openCancellations: 2,
          failedWorkflows: 1,
          expertsMissingProfile: 1,
        },
        trend: [
          {
            date: "2026-08-13",
            newCustomers: 4,
            paidOrders: 2,
            grossProductSalesVnd: 500000,
            discountsVnd: 0,
            shippingCollectedVnd: 30000,
            productPaymentsCollectedVnd: 530000,
            productRefundsVnd: 0,
            consultationFeesCollectedVnd: 300000,
            consultationRefundsVnd: 0,
            platformCommissionRevenueVnd: 30000,
          },
        ],
        funnel: {
          availableFrom: "2026-08-01",
          isPartial: true,
          steps: [
            {
              eventType: "PRODUCT_VIEWED",
              label: "Xem sản phẩm",
              sessions: 100,
              conversionFromPreviousPct: 100,
              overallConversionPct: 100,
            },
            {
              eventType: "ADDED_TO_CART",
              label: "Thêm vào giỏ",
              sessions: 40,
              conversionFromPreviousPct: 40,
              overallConversionPct: 40,
            },
            {
              eventType: "CHECKOUT_STARTED",
              label: "Bắt đầu thanh toán",
              sessions: 20,
              conversionFromPreviousPct: 50,
              overallConversionPct: 20,
            },
            {
              eventType: "PURCHASE_COMPLETED",
              label: "Thanh toán thành công",
              sessions: 10,
              conversionFromPreviousPct: 50,
              overallConversionPct: 10,
            },
          ],
        },
        topProducts: [
          {
            productId: "p1",
            productVariantId: "v1",
            productName: "Sữa rửa mặt",
            sku: "CLEANSER-1",
            unitsSold: 12,
            grossSalesVnd: 2400000,
          },
        ],
        recentActivity: [],
      }),
    }),
  );

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Tổng quan quản trị" }),
  ).toBeVisible();
  await expect(page.getByText("12.300.000 ₫")).toBeVisible();
  await expect(page.getByText("Hoa hồng nền tảng đã ghi nhận")).toBeVisible();
  await expect(page.getByText("Tracking chỉ có từ 2026-08-01")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Khách hàng hoạt động/ }),
  ).toHaveAttribute("href", "/dashboard/users");
});

test("expert dashboard keeps fees labelled as collected, not income", async ({
  page,
}) => {
  await page.route("**/api/be/experts/me/dashboard?range=30d", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        period,
        metrics: {
          appointmentsToday: 2,
          paidPendingConfirmation: 1,
          completedConsultations: 9,
          followUpConsultations: 2,
          netConsultationFeesVnd: 1800000,
          averageRating: 4.8,
          ratingCount: 16,
        },
        trend: [],
        pendingConfirmation: [],
        upcomingBookings: [],
      }),
    }),
  );

  await page.goto("/expert");
  await expect(page.getByText("Phí tư vấn đã thu ròng")).toBeVisible();
  await expect(page.getByText("Không phải thu nhập quyết toán")).toBeVisible();
});

test("staff dashboard shows API errors instead of an empty-data state", async ({
  page,
}) => {
  await page.route("**/api/be/staff/dashboard?range=30d", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/staff");
  await expect(page.getByText("Không thể tải dữ liệu tổng quan")).toBeVisible();
  await expect(page.getByRole("button", { name: /Thử lại/ })).toBeVisible();
});

test("staff dashboard does not overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/be/staff/dashboard?range=30d", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        period,
        metrics: {
          unassignedOpenSupport: 4,
          myActiveSupport: 1,
          submittedStockForms: 2,
          returnsReadyForInspection: 1,
          failedWorkflows: 0,
        },
        trend: [],
        queues: {
          openSupportSessions: [],
          submittedStockForms: [],
          readyReturns: [],
          workflowFailures: [],
        },
      }),
    }),
  );

  await page.goto("/staff");
  await expect(page.getByText("Chat chưa được nhận")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
