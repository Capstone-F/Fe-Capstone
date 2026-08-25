import { expect, test, type Page } from "@playwright/test";

const expertId = "c94556bc-50ba-4b2e-835b-d1ddb5357db6";
const clinicId = "c83ed40b-3f17-4ffa-a926-6ff07e7e65d7";

async function authenticateClinicManager(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "clinic-manager-e2e-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      json: {
        id: "manager-id",
        email: "manager@glowscan.local",
        name: "Clinic Manager",
        roles: ["clinic_manager"],
        clinicId,
        isActive: true,
      },
    }),
  );
}

test("clinic report stays scoped by BE and drills down into booking oversight", async ({
  page,
}) => {
  await page.route("**/api/be/**", (route) => route.fulfill({ json: {} }));
  await authenticateClinicManager(page);

  let reportUrl: URL | null = null;
  let bookingExpertId: string | null = null;
  await page.route(
    "**/api/be/clinic/experts/cancellation-stats**",
    async (route) => {
      reportUrl = new URL(route.request().url());
      await route.fulfill({
        json: {
          windowDays: 30,
          cancelLimit: 3,
          noShowWeight: 2,
          from: "2026-07-26T00:00:00.000Z",
          totalExperts: 1,
          flaggedCount: 1,
          items: [
            {
              expertId,
              expertName: "BS. Phạm Thu Hà",
              clinicId,
              clinicName: "GlowScan District 3 Clinic",
              isActive: true,
              assignedCount: 5,
              expertCancelCount: 3,
              lateCancelCount: 1,
              noShowCount: 0,
              violationScore: 4,
              cancelRate: 0.6,
              exceedsLimit: true,
            },
          ],
        },
      });
    },
  );
  await page.route("**/api/be/clinic/experts?**", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: expertId,
            name: "BS. Phạm Thu Hà",
            user: { name: "BS. Phạm Thu Hà" },
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
      },
    }),
  );
  await page.route("**/api/be/clinic/bookings**", (route) => {
    bookingExpertId = new URL(route.request().url()).searchParams.get(
      "expertId",
    );
    return route.fulfill({
      json: { items: [], total: 0, page: 1, limit: 20 },
    });
  });

  await page.goto("/clinic/expert-cancellations");
  await expect(page.getByText("BS. Phạm Thu Hà").first()).toBeVisible();
  expect(reportUrl?.searchParams.has("clinicId")).toBe(false);

  await page.getByText("BS. Phạm Thu Hà").first().click();
  await page.waitForURL(
    `/clinic/bookings?expertId=${encodeURIComponent(expertId)}`,
  );
  await expect.poll(() => bookingExpertId).toBe(expertId);
  await expect(page.getByLabel("Chuyên gia phụ trách")).toHaveText(
    /BS\. Phạm Thu Hà/,
  );

  await page.getByLabel("Chuyên gia phụ trách").click();
  await page.getByRole("option", { name: "Tất cả chuyên gia" }).click();
  await expect(page).toHaveURL("/clinic/bookings");
});

test("clinic report explains the unbound manager 403", async ({ page }) => {
  await page.route("**/api/be/**", (route) => route.fulfill({ json: {} }));
  await authenticateClinicManager(page);
  await page.route("**/api/be/clinic/experts/cancellation-stats**", (route) =>
    route.fulfill({
      status: 403,
      json: {
        message: "Người quản lý phòng khám chưa được gắn với phòng khám",
      },
    }),
  );

  await page.goto("/clinic/expert-cancellations");
  await expect(
    page.getByText("Tài khoản chưa được gắn với phòng khám"),
  ).toBeVisible();
  await expect(page.getByText(/liên hệ Admin/)).toBeVisible();
});
