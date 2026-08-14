import { expect, test } from "@playwright/test";

const treatmentId = "11111111-1111-4111-8111-111111111111";
const phaseId = "22222222-2222-4222-8222-222222222222";
const retinolId = "33333333-3333-4333-8333-333333333333";
const glycolicId = "44444444-4444-4444-8444-444444444444";

const phase = {
  id: phaseId,
  treatmentId,
  phaseType: "ACTIVE_TREATMENT",
  phaseOrder: 0,
  title: "Điều trị tích cực",
  goals: null,
  notes: null,
  noteByExpert: "Theo dõi kích ứng",
  priceVnd: "300000",
  status: "PENDING",
  startDate: "2026-08-14",
  endDate: "2026-09-14",
  ingredients: [
    {
      id: "ingredient-link",
      ingredientId: "retinol",
      ingredientName: "Retinol",
    },
  ],
  products: [
    {
      id: "phase-product-retinol",
      productVariantId: retinolId,
      matchScore: 1,
      productName: "Retinol 0.3%",
      sku: "RETINOL-03",
      priceVnd: 250000,
    },
  ],
  routines: [],
};

const plan = {
  id: treatmentId,
  customerId: "customer-id",
  customerName: "Nguyễn An",
  expertId: "expert-id",
  clinicId: "clinic-id",
  title: "Phác đồ điều trị mụn",
  description: null,
  status: "ACTIVE",
  startDate: "2026-08-14",
  endDate: "2026-09-14",
  totalPriceVnd: "300000",
  submittedAt: "2026-08-13T00:00:00.000Z",
  paidAt: "2026-08-13T01:00:00.000Z",
  paidTransactionId: "transaction-id",
  sourceConsultationId: null,
  cancelledAt: null,
  cancelReason: null,
  cancelledBy: null,
  refundTransactionId: null,
  refundedAmountVnd: null,
  phases: [phase],
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T01:00:00.000Z",
};

const candidates = [
  {
    productVariantId: retinolId,
    productId: "product-retinol",
    productName: "Retinol 0.3%",
    sku: "RETINOL-03",
    priceVnd: 250000,
    matchScore: 1,
    matchedIngredientIds: ["retinol"],
    stockQuantity: 12,
    conflictWarnings: [],
  },
  {
    productVariantId: glycolicId,
    productId: "product-glycolic",
    productName: "Some By Mi AHA",
    sku: "SOME-AHA",
    priceVnd: 230000,
    matchScore: 1,
    matchedIngredientIds: ["retinol"],
    stockQuantity: 8,
    conflictWarnings: [
      {
        selectedProductVariantId: retinolId,
        protocolCode: "glycolic_exfoliation",
        conflictingProtocolCode: "retinol_0.3_anti_aging",
        severity: "HIGH",
        description: "Retinol kết hợp AHA có thể gây kích ứng mạnh",
      },
    ],
  },
];

test("expert sees candidate warnings and a non-blocking conflict banner after save", async ({
  page,
}) => {
  await page.route(`**/api/be/treatments/${treatmentId}`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(plan),
    }),
  );
  await page.route(`**/api/be/treatments/${treatmentId}/chart`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        treatmentId,
        title: plan.title,
        status: "ACTIVE",
        startDate: plan.startDate,
        endDate: plan.endDate,
        paidAt: plan.paidAt,
        phases: [],
        progressPhotos: [],
        productsUsed: [],
        inPersonSessions: [],
        consultationResults: { sourceConsultation: null, followUpSessions: [] },
      }),
    }),
  );
  await page.route("**/api/be/ingredients", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{ id: "retinol", name: "Retinol" }]),
    }),
  );
  await page.route(
    `**/api/be/treatments/phases/${phaseId}/product-candidates`,
    (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(candidates),
      }),
  );
  await page.route(`**/api/be/treatments/phases/${phaseId}/products`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...phase,
        products: [
          ...phase.products,
          {
            id: "phase-product-glycolic",
            productVariantId: glycolicId,
            matchScore: 1,
            productName: "Some By Mi AHA",
            sku: "SOME-AHA",
            priceVnd: 230000,
          },
        ],
        conflicts: [
          {
            protocolCode: "retinol_0.3_anti_aging",
            conflictingProtocolCode: "glycolic_exfoliation",
            severity: "HIGH",
            description: "Retinol kết hợp AHA có thể gây kích ứng mạnh",
            reason: null,
            productVariantIds: [retinolId],
            conflictingProductVariantIds: [glycolicId],
          },
        ],
      }),
    }),
  );

  await page.goto(
    `/expert/treatments/builder?treatmentId=${treatmentId}&customerId=customer-id&customerName=Nguyen%20An`,
  );

  await expect(
    page.getByRole("button", { name: "1 cảnh báo xung đột sản phẩm" }),
  ).toBeVisible();
  await page.getByText("Some By Mi AHA", { exact: true }).click();
  await page.getByRole("button", { name: "Lưu sản phẩm" }).click();

  await expect(
    page.getByText("Đã lưu sản phẩm, nhưng có 1 cảnh báo kết hợp"),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Cảnh báo chỉ hỗ trợ quyết định chuyên môn và không ngăn lưu phác đồ.",
    ),
  ).toBeVisible();
});
