import { expect, test, type Page } from "@playwright/test";

const clinicId = "c83ed40b-3f17-4ffa-a926-6ff07e7e65d7";
const expertId = "c94556bc-50ba-4b2e-835b-d1ddb5357db6";

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "admin-e2e-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      json: {
        id: "admin-id",
        email: "admin@glowscan.local",
        name: "GlowScan Admin",
        roles: ["app_admin"],
        clinicId: null,
        isActive: true,
      },
    }),
  );
}

test("admin filters cancellation stats and drills down to the flagged expert", async ({
  page,
}) => {
  await page.route("**/api/be/**", (route) => route.fulfill({ json: {} }));
  await authenticateAdmin(page);

  const reportRequests: URL[] = [];
  await page.route(
    "**/api/be/admin/experts/cancellation-stats**",
    async (route) => {
      reportRequests.push(new URL(route.request().url()));
      await route.fulfill({
        json: {
          windowDays: 30,
          cancelLimit: 3,
          noShowWeight: 2,
          from: "2026-07-26T00:00:00.000Z",
          totalExperts: 2,
          flaggedCount: 1,
          items: [
            {
              expertId,
              expertName: "BS. Nguyễn Văn An",
              clinicId,
              clinicName: "GlowScan District 1 Clinic",
              isActive: true,
              assignedCount: 4,
              expertCancelCount: 5,
              lateCancelCount: 1,
              noShowCount: 1,
              violationScore: 7,
              cancelRate: 1.25,
              exceedsLimit: true,
            },
            {
              expertId: "d94556bc-50ba-4b2e-835b-d1ddb5357db6",
              expertName: "BS. Không có lịch",
              clinicId: null,
              clinicName: null,
              isActive: false,
              assignedCount: 0,
              expertCancelCount: 0,
              lateCancelCount: 0,
              noShowCount: 0,
              violationScore: 0,
              cancelRate: null,
              exceedsLimit: false,
            },
          ],
        },
      });
    },
  );
  await page.route("**/api/be/admin/clinics**", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: clinicId,
            name: "GlowScan District 1 Clinic",
            latitude: 10.77,
            longitude: 106.7,
            isActive: true,
            commissionPercent: 10,
            createdAt: "2026-08-01T00:00:00.000Z",
            updatedAt: "2026-08-01T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
      },
    }),
  );

  await page.goto("/dashboard/experts/cancellations");
  await expect(
    page.getByRole("heading", { name: "Cảnh báo Expert hủy lịch" }),
  ).toBeVisible();
  await expect(page.getByText("1/2")).toBeVisible();
  await expect(page.getByText("125%").first()).toBeVisible();
  await expect(page.getByText("—").first()).toBeVisible();

  await page.getByLabel("Khoảng thời gian báo cáo").click();
  await page.getByRole("option", { name: "30 ngày gần nhất" }).click();
  await expect
    .poll(() => reportRequests.at(-1)?.searchParams.get("days"))
    .toBe("30");

  await page.getByLabel("Lọc theo phòng khám").click();
  await page
    .getByRole("option", { name: "GlowScan District 1 Clinic" })
    .click();
  await expect
    .poll(() => reportRequests.at(-1)?.searchParams.get("clinicId"))
    .toBe(clinicId);

  await page.getByText("BS. Nguyễn Văn An").first().click();
  await page.waitForURL(
    `/dashboard/experts?expertId=${encodeURIComponent(expertId)}`,
  );
  await expect(
    page.getByText("Đang focus Expert từ báo cáo hủy lịch"),
  ).toBeVisible();
});
