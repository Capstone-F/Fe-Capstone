import { expect, test } from "@playwright/test";

const EXPERT_ID = "c94556bc-50ba-4b2e-835b-d1ddb5357db6";
const CLINIC_ID = "c83ed40b-3f17-4ffa-a926-6ff07e7e65d7";

test("legacy booking URL redirects to the canonical dynamic route", async ({
  request,
}) => {
  const response = await request.get(`/booking?expertId=${EXPERT_ID}`, {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe(`/booking/${EXPERT_ID}`);
});

test("booking URL without a valid expert redirects to expert discovery", async ({
  request,
}) => {
  const response = await request.get("/booking?expertId=invalid", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/experts");
});

test("clinic booking CTA uses the canonical expert route", async ({ page }) => {
  await page.route(`**/api/be/clinics/${CLINIC_ID}`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: CLINIC_ID,
        name: "GlowScan District 1 Clinic",
        address: "12 Nguyen Hue, District 1, Ho Chi Minh City",
        latitude: 10.774,
        longitude: 106.703,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });
  await page.route(`**/api/be/clinics/${CLINIC_ID}/experts`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        items: [
          {
            id: EXPERT_ID,
            name: "Dr. Nguyen Van An",
            email: "expert@example.com",
            clinicId: CLINIC_ID,
            clinicName: "GlowScan District 1 Clinic",
            specialization: "DERMATOLOGY",
            licenseNumber: "TEST-001",
            bio: null,
            rating: 4.8,
            consultationFee: 400000,
            distanceKm: null,
            isActive: true,
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
          },
        ],
        total: 1,
      },
    });
  });

  await page.goto(`/clinics/${CLINIC_ID}`);

  await expect(page.getByRole("link", { name: /Đặt lịch/i })).toHaveAttribute(
    "href",
    `/booking/${EXPERT_ID}`,
  );
});

test("expert consultation and treatment builder routes are registered", async ({
  request,
}) => {
  const consultation = await request.get(`/expert/consultations/${EXPERT_ID}`);
  const treatmentBuilder = await request.get("/expert/treatments/builder");

  expect(consultation.status()).toBe(200);
  expect(treatmentBuilder.status()).toBe(200);
});

test("missing Zego configuration is explicit and does not block treatment navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("glowscan_access_token", "e2e-expert-token");
  });
  await page.route("**/api/be/**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      json: { message: "Not required for this navigation test" },
    });
  });
  await page.route("**/api/be/users/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: "a0000000-0000-4000-8000-000000000001",
        email: "derma.d1@glowscan.example.com",
        name: "Dr. Nguyen Van An",
        provider: "keycloak",
        roles: ["expert"],
        clinicId: CLINIC_ID,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });
  await page.route(`**/api/be/bookings/me/${EXPERT_ID}`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: EXPERT_ID,
        customerId: "b0000000-0000-4000-8000-000000000001",
        expertId: "a0000000-0000-4000-8000-000000000001",
        expertName: "Dr. Nguyen Van An",
        customerName: "Demo Customer",
        reason: "Tư vấn da",
        status: "IN_PROGRESS",
        scheduledAt: "2026-08-15T03:00:00.000Z",
        startedAt: "2026-08-15T03:00:00.000Z",
        completedAt: null,
        feeChargedVnd: 400000,
        isPaid: true,
        isFollowUp: false,
        treatmentId: null,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T03:00:00.000Z",
      },
    });
  });
  await page.route("**/api/be/treatments/me**", async (route) => {
    await route.fulfill({ contentType: "application/json", json: [] });
  });
  await page.route(
    `**/api/be/consultations/${EXPERT_ID}/video-token`,
    async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        json: {
          message:
            "ZegoCloud chưa được cấu hình (ZEGO_APP_ID / ZEGO_SERVER_SECRET)",
        },
      });
    },
  );

  await page.goto(`/expert/consultations/${EXPERT_ID}`);
  await page.getByRole("button", { name: "Mở phòng video" }).click();

  await expect(
    page.getByText(/máy chủ local chưa cấu hình ZEGO_APP_ID/i),
  ).toBeVisible();

  await page.getByRole("button", { name: "Lập phác đồ" }).click();
  await expect(
    page.getByRole("complementary", { name: "Bảng lập phác đồ điều trị nổi" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Toàn màn hình" })).toHaveCount(
    0,
  );
});

test("staff session on the home page redirects to the staff dashboard", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("glowscan_access_token", "e2e-access-token");
  });
  await page.route("**/api/be/**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      json: { message: "Not required for this navigation test" },
    });
  });
  await page.route("**/api/be/users/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: "a0000000-0000-4000-8000-000000000010",
        email: "staff@glowscan.local",
        name: "GlowScan Staff",
        provider: "keycloak",
        roles: ["staff"],
        clinicId: null,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/staff$/);
});

test("expert consultation list stays compact and responsive", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem("glowscan_access_token", "e2e-expert-token");
  });
  await page.route("**/api/be/**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      json: { message: "Not required for this UI test" },
    });
  });
  await page.route("**/api/be/users/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: "a0000000-0000-4000-8000-000000000001",
        email: "derma.d1@glowscan.example.com",
        name: "Dr. Nguyen Van An",
        provider: "keycloak",
        roles: ["expert"],
        clinicId: CLINIC_ID,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });
  await page.route("**/api/be/bookings/me?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        items: [
          {
            id: EXPERT_ID,
            customerId: "b0000000-0000-4000-8000-000000000001",
            expertId: "a0000000-0000-4000-8000-000000000001",
            expertName: "Dr. Nguyen Van An",
            customerName: "Bao Truong Thien Le",
            reason: "Tư vấn tình trạng da",
            status: "CONFIRMED",
            scheduledAt: "2026-08-26T03:00:00.000Z",
            startedAt: null,
            completedAt: null,
            feeChargedVnd: 400000,
            isPaid: true,
            isFollowUp: false,
            treatmentId: null,
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    });
  });

  await page.goto("/expert/consultations");

  await expect(
    page.getByRole("heading", { name: "Ca tư vấn bệnh nhân" }),
  ).toBeVisible();
  await expect(page.getByText("Bao Truong Thien Le")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("expert schedule filters the selected week and exposes availability", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("glowscan_access_token", "e2e-expert-token");
  });
  await page.route("**/api/be/**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      json: { message: "Not required for this schedule test" },
    });
  });
  await page.route("**/api/be/users/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: "a0000000-0000-4000-8000-000000000001",
        email: "derma.d1@glowscan.example.com",
        name: "Dr. Nguyen Van An",
        provider: "keycloak",
        roles: ["expert"],
        clinicId: CLINIC_ID,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });
  await page.route("**/api/be/experts/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        id: "a0000000-0000-4000-8000-000000000001",
        name: "Dr. Nguyen Van An",
        email: "derma.d1@glowscan.example.com",
        clinicId: CLINIC_ID,
        clinicName: "GlowScan District 1 Clinic",
        specialization: "DERMATOLOGY",
        licenseNumber: "TEST-001",
        bio: null,
        rating: 4.9,
        consultationFee: 400000,
        distanceKm: null,
        isActive: true,
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
  });
  await page.route("**/api/be/bookings/me?**", async (route) => {
    const booking = (
      id: string,
      customerName: string,
      scheduledAt: string,
    ) => ({
      id,
      customerId: "b0000000-0000-4000-8000-000000000001",
      expertId: "a0000000-0000-4000-8000-000000000001",
      expertName: "Dr. Nguyen Van An",
      customerName,
      reason: "Tư vấn da",
      status: "CONFIRMED",
      scheduledAt,
      startedAt: null,
      completedAt: null,
      feeChargedVnd: 400000,
      isPaid: true,
      isFollowUp: false,
      treatmentId: null,
      createdAt: "2026-08-15T00:00:00.000Z",
      updatedAt: "2026-08-15T00:00:00.000Z",
    });
    await route.fulfill({
      contentType: "application/json",
      json: {
        items: [
          booking(
            EXPERT_ID,
            "Bệnh nhân trong tuần",
            "2026-08-15T03:00:00.000Z",
          ),
          booking(
            "d94556bc-50ba-4b2e-835b-d1ddb5357db6",
            "Bệnh nhân tuần sau",
            "2026-08-26T03:00:00.000Z",
          ),
        ],
        total: 2,
        page: 1,
        limit: 20,
      },
    });
  });
  await page.route(
    "**/api/be/experts/a0000000-0000-4000-8000-000000000001/availability",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          items: Array.from({ length: 12 }, (_, index) => ({
            id: `availability-${index}`,
            expertId: "a0000000-0000-4000-8000-000000000001",
            dayOfWeek: (index % 6) + 1,
            startHour: index % 2 === 0 ? 9 : 13,
            endHour: index % 2 === 0 ? 12 : 18,
          })),
        },
      });
    },
  );

  await page.goto("/expert/schedule");

  await expect(page.getByText("Bệnh nhân trong tuần")).toBeVisible();
  await expect(page.getByText("Bệnh nhân tuần sau")).toHaveCount(0);
  await page.getByRole("button", { name: "Thiết lập khung giờ" }).click();
  await expect(
    page.getByRole("heading", { name: "Khung giờ tư vấn hàng tuần" }),
  ).toBeVisible();
  await expect(page.getByText("12 khung giờ")).toBeVisible();
  await expect(page.getByText("Thêm khung giờ mới")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Thêm khung giờ" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đóng", exact: true }),
  ).toHaveCount(0);

  const listScrollsIndependently = await page
    .getByTestId("availability-list-scroll")
    .evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(listScrollsIndependently).toBe(true);
});
