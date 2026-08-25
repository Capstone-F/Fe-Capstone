import { expect, test } from "@playwright/test";

const treatmentId = "11111111-1111-4111-8111-111111111111";
const phaseId = "22222222-2222-4222-8222-222222222222";
const variantId = "33333333-3333-4333-8333-333333333333";

test("customer replaces another cart source and adds paid phase products", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("glowscan_access_token", "customer-e2e-token");
  });
  await page.route("**/api/be/**", (route) => route.fulfill({ json: {} }));
  await page.route("**/api/be/users/me", (route) =>
    route.fulfill({
      json: {
        id: "user-id",
        email: "customer@glowscan.local",
        name: "Khách hàng",
        roles: ["customer"],
        isActive: true,
      },
    }),
  );
  await page.route("**/api/be/customers/me", (route) =>
    route.fulfill({
      json: {
        customer: {
          id: "customer-id",
          phone: "0900000000",
          avatarUrl: null,
          dateOfBirth: "2000-01-01",
          gender: "FEMALE",
          skinType: null,
          baumannScores: null,
        },
        allergies: [],
        surveyHistory: [],
      },
    }),
  );
  await page.route("**/api/be/routines/me/today**", (route) =>
    route.fulfill({
      json: {
        date: "2026-08-25",
        period: "MORNING",
        sessionState: "IN_PROGRESS",
        routines: [
          {
            id: "routine-id",
            type: "EXPERT_PRESCRIBED",
            status: "ACTIVE",
            title: "Routine điều trị",
            description: null,
            sessionState: "IN_PROGRESS",
            progress: {
              total: 0,
              completed: 0,
              skipped: 0,
              pending: 0,
              completionRate: 0,
            },
            steps: [],
          },
        ],
      },
    }),
  );
  await page.route("**/api/be/routines/routine-id/check-ins**", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/be/treatments/me**", (route) =>
    route.fulfill({
      json: [
        {
          id: treatmentId,
          customerId: "customer-id",
          customerName: "Khách hàng",
          expertId: "expert-id",
          clinicId: "clinic-id",
          title: "Phác đồ trị mụn",
          description: null,
          status: "ACTIVE",
          startDate: "2026-08-25",
          endDate: "2026-09-25",
          totalPriceVnd: 300000,
          submittedAt: "2026-08-24T00:00:00.000Z",
          paidAt: "2026-08-24T01:00:00.000Z",
          paidTransactionId: "transaction-id",
          sourceConsultationId: null,
          cancelledAt: null,
          cancelReason: null,
          cancelledBy: null,
          refundTransactionId: null,
          refundedAmountVnd: null,
          phases: [
            {
              id: phaseId,
              treatmentId,
              phaseType: "ACTIVE_TREATMENT",
              phaseOrder: 0,
              title: "Điều trị tích cực",
              goals: "Giảm mụn",
              notes: null,
              noteByExpert: "Dùng mỗi tối",
              priceVnd: 300000,
              status: "ACTIVE",
              startDate: "2026-08-25",
              endDate: "2026-09-25",
              ingredients: [],
              products: [
                {
                  id: "phase-product-id",
                  productVariantId: variantId,
                  matchScore: 1,
                  productName: "Retinol 0.3%",
                  sku: "RETINOL-03",
                  priceVnd: 450000,
                },
              ],
              routines: [],
            },
          ],
          createdAt: "2026-08-24T00:00:00.000Z",
          updatedAt: "2026-08-24T01:00:00.000Z",
        },
      ],
    }),
  );
  await page.route(`**/api/be/treatments/${treatmentId}/chart`, (route) =>
    route.fulfill({
      json: {
        treatmentId,
        title: "Phác đồ trị mụn",
        status: "ACTIVE",
        startDate: "2026-08-25",
        endDate: "2026-09-25",
        paidAt: "2026-08-24T01:00:00.000Z",
        phases: [],
        progressPhotos: [],
        productsUsed: [],
        inPersonSessions: [],
        consultationResults: {
          sourceConsultation: null,
          followUpSessions: [],
        },
      },
    }),
  );

  let cartSource: "CATALOG" | "TREATMENT" = "CATALOG";
  let cleared = false;
  let addPayload: unknown;
  await page.route("**/api/be/cart", async (route) => {
    if (route.request().method() === "DELETE") {
      cleared = true;
      cartSource = "TREATMENT";
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      json: {
        source: cartSource,
        surveyRecommendationId: null,
        treatmentPhaseId: null,
        items:
          cartSource === "CATALOG"
            ? [{ productVariantId: "old", quantity: 1 }]
            : [],
        conflicts: [],
      },
    });
  });
  await page.route("**/api/be/cart/items", async (route) => {
    addPayload = route.request().postDataJSON();
    await route.fulfill({
      json: {
        source: "TREATMENT",
        surveyRecommendationId: null,
        treatmentPhaseId: phaseId,
        items: [{ productVariantId: variantId, quantity: 1 }],
        conflicts: [],
      },
    });
  });
  await page.route("**/api/be/products**", (route) =>
    route.fulfill({ json: { items: [], total: 0, page: 1, limit: 100 } }),
  );

  await page.goto("/care");
  await page.getByRole("tab", { name: "Liệu Trình Điều Trị" }).click();
  await expect(page.getByText("Retinol 0.3%")).toBeVisible();
  await page
    .getByRole("button", { name: "Mua sản phẩm của giai đoạn này" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Thay giỏ hàng hiện tại?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa giỏ và tiếp tục" }).click();

  await expect.poll(() => cleared).toBe(true);
  await expect
    .poll(() => addPayload)
    .toEqual({
      productVariantId: variantId,
      quantity: 1,
      source: "TREATMENT",
      treatmentPhaseId: phaseId,
    });
});
