import { expect, test } from "@playwright/test";

const inventory = [
  {
    productVariantId: "variant-out",
    productId: "product-out",
    productName: "Sữa rửa mặt hết hàng",
    sku: "OUT-001",
    priceVnd: 120000,
    imageUrl: null,
    stockQuantity: 0,
    activeIngredients: ["Niacinamide"],
    stockWarning: "OUT_OF_STOCK",
    warningMessage: "Hết hàng — cần nhập kho ngay",
  },
  {
    productVariantId: "variant-low",
    productId: "product-low",
    productName: "Serum sắp hết",
    sku: "LOW-008",
    priceVnd: 220000,
    imageUrl: null,
    stockQuantity: 8,
    activeIngredients: ["Retinol"],
    stockWarning: "LOW",
    warningMessage: "Sắp hết hàng — chỉ còn 8 sản phẩm (ngưỡng cảnh báo 10)",
  },
  {
    productVariantId: "variant-ok",
    productId: "product-ok",
    productName: "Kem dưỡng đủ hàng",
    sku: "OK-040",
    priceVnd: 320000,
    imageUrl: null,
    stockQuantity: 40,
    activeIngredients: [],
    stockWarning: null,
    warningMessage: null,
  },
];

test("staff sees low-stock warnings first and can filter restock items", async ({
  page,
}) => {
  await page.route("**/api/be/stock/inventory", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(inventory),
    }),
  );

  await page.goto("/staff/catalog");

  await expect(
    page.getByText("Tồn kho hiện tại", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Hết hàng", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Sắp hết", exact: true }),
  ).toBeVisible();
  const inventoryTable = page.getByRole("table");
  await expect(inventoryTable.getByText("Kem dưỡng đủ hàng")).toBeVisible();

  const productRows = page.locator("tbody tr");
  await expect(productRows.nth(0)).toContainText("OUT-001");
  await expect(productRows.nth(1)).toContainText("LOW-008");

  await page.getByRole("button", { name: /Cần nhập kho/ }).click();
  await expect(inventoryTable.getByText("Kem dưỡng đủ hàng")).toBeHidden();
  await expect(productRows).toHaveCount(2);
});

test("staff inventory warning layout does not overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/be/stock/inventory", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(inventory),
    }),
  );

  await page.goto("/staff/catalog");
  await expect(
    page
      .locator("article")
      .filter({ hasText: "OUT-001" })
      .getByText("Hết hàng", {
        exact: true,
      }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
