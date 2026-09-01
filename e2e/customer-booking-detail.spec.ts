import { expect, test, type Page } from "@playwright/test";

const bookingId = "booking-customer-detail";

const customer = {
  id: "customer-user-id",
  email: "customer.detail@glowscan.local",
  name: "Khách hàng GlowScan",
  provider: "keycloak",
  roles: ["customer"],
  clinicId: null,
  isActive: true,
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
};

function booking(status: "PENDING" | "IN_PROGRESS") {
  return {
    id: bookingId,
    customerId: customer.id,
    expertId: "expert-id",
    expertName: "Dr. Nguyễn Văn An",
    customerName: customer.name,
    reason: "Da kích ứng và mụn viêm vùng má.",
    status,
    scheduledAt: "2026-09-20T03:00:00.000Z",
    startedAt: status === "IN_PROGRESS" ? "2026-09-20T03:00:00.000Z" : null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    cancelledBy: null,
    feeChargedVnd: "400000",
    isPaid: status === "IN_PROGRESS",
    isFollowUp: false,
    treatmentId: null,
    feedback: null,
    createdAt: "2026-09-01T03:00:00.000Z",
    updatedAt: "2026-09-01T03:00:00.000Z",
  };
}

async function prepareCustomerPage(
  page: Page,
  status: "PENDING" | "IN_PROGRESS",
) {
  page.on("response", (response) => {
    if (response.status() === 401) {
      console.log(
        `[401 ERROR] ${response.request().method()} ${response.url()}`,
      );
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "customer-detail-token");
  });
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({ json: customer }),
  );
  await page.route("**/api/be/customers/me", (route) =>
    route.fulfill({
      json: {
        customer: {
          id: customer.id,
          name: customer.name,
          gender: "FEMALE",
          dateOfBirth: "2000-01-01",
          baumannCode: "OSNW",
        },
        allergies: [],
      },
    }),
  );
  await page.route(`**/api/be/bookings/me/${bookingId}`, (route) =>
    route.fulfill({ json: booking(status) }),
  );
  await page.route("**/api/be/cart", (route) =>
    route.fulfill({ json: { items: [] } }),
  );
  await page.route("**/api/be/support/sessions/me", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      json: { message: "No live support session" },
    }),
  );
  await page.route("**/api/be/wallet/me", (route) =>
    route.fulfill({
      json: { balance: 5000000 },
    }),
  );
  await page.route("**/api/be/products**", (route) =>
    route.fulfill({
      json: { products: [], total: 0 },
    }),
  );
}

test("pending customer booking renders a detailed payment state without opening consultation", async ({
  page,
}) => {
  await prepareCustomerPage(page, "PENDING");

  await page.goto(`/appointments/${bookingId}`);

  await expect(page.getByText("Tư vấn cùng Dr. Nguyễn Văn An")).toBeVisible();
  await expect(
    page.getByText("Da kích ứng và mụn viêm vùng má."),
  ).toBeVisible();
  await expect(
    page.getByText("Chưa thanh toán. Lịch chưa thể được chuyên gia xác nhận."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Thanh toán qua ví/ }),
  ).toHaveAttribute(
    "href",
    `/booking/expert-id/checkout?bookingId=${bookingId}`,
  );
  await expect(
    page.getByRole("link", { name: /Vào phòng tư vấn/ }),
  ).toHaveCount(0);
});

test("only an in-progress booking exposes the customer consultation room", async ({
  page,
}) => {
  await prepareCustomerPage(page, "IN_PROGRESS");

  await page.goto(`/appointments/${bookingId}`);

  await expect(
    page.getByRole("link", { name: /Vào phòng tư vấn/ }),
  ).toHaveAttribute("href", `/appointments/${bookingId}/consultation`);
});
