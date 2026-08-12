import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type {
  ProductDetailResponse,
  ProductResponse,
  StockBatchResponse,
  StockImportFormResponse,
} from "../helpers/types";

const PLACEHOLDER_IMAGE = "https://placehold.co/400";

/** The onboard endpoint returns either the product or the detail wrapper depending on version. */
function asProduct(
  payload: ProductResponse | ProductDetailResponse,
): ProductResponse {
  return "product" in payload ? payload.product : payload;
}

/** TC-ADM-10 — Onboard a SKU, attach an image, import stock directly and via an import form. */
export async function runTcAdm10(ctx: AdminSuiteContext): Promise<void> {
  const variantId =
    await test.step("POST /products onboards a SKU", async () => {
      const payload = await ctx.admin.post<
        ProductResponse | ProductDetailResponse
      >(
        "/products",
        {
          name: `QA Serum ${ctx.runId}`,
          brand: "QA Labs",
          categoryCode: "SERUM",
          categoryName: "Serum",
          description: "Product onboarded by the admin QA suite.",
          sku: `QA-SERUM-${ctx.runId}`,
          volume: "30ml",
          packaging: "Chai",
          priceVnd: 250000,
          shelfLifeValue: 24,
          shelfLifeUnit: "MONTH",
          ingredients: [
            {
              name: "Niacinamide",
              concentrationPct: 10,
              isKeyIngredient: true,
            },
            { name: "Zinc PCA", concentrationPct: 1 },
          ],
        },
        [200, 201],
      );
      const product = asProduct(payload);
      const variant = need(
        product.variants[0],
        "the variant created with the product",
      );
      expect(variant.sku).toBe(`QA-SERUM-${ctx.runId}`);
      return variant.id;
    });

  ctx.productVariantId = variantId;

  await test.step("PATCH variant image", async () => {
    const updated = await ctx.admin.patch<{ readonly imageUrl: string | null }>(
      `/products/variants/${variantId}`,
      { imageUrl: PLACEHOLDER_IMAGE },
    );
    expect(updated.imageUrl).toBe(PLACEHOLDER_IMAGE);
  });

  const batch =
    await test.step("POST /stock/batches imports 20 units", async () => {
      const created = await ctx.admin.post<StockBatchResponse>(
        "/stock/batches",
        {
          productVariantId: variantId,
          quantity: 20,
          manufacturingDate: new Date().toISOString().slice(0, 10),
          batchCode: `LOT-QA-${ctx.runId}`,
        },
        [200, 201],
      );
      expect(created.remainingQuantity).toBe(20);
      return created;
    });

  ctx.stockBatchId = batch.id;

  await test.step("POST adjust corrects the batch to 18", async () => {
    // The adjust endpoint answers with the batch plus the ADJUSTMENT movement it wrote.
    const adjusted = await ctx.admin.post<{
      readonly batch: StockBatchResponse;
      readonly movement: { readonly type: string; readonly quantity: number };
    }>(`/stock/batches/${batch.id}/adjust`, { quantity: 18, note: "Kiem ke" });
    expect(adjusted.batch.remainingQuantity).toBe(18);
    expect(adjusted.movement.type).toBe("ADJUSTMENT");
  });

  await test.step("import form: create -> edit -> submit -> confirm", async () => {
    const form = await ctx.admin.post<StockImportFormResponse>(
      "/stock/import-forms",
      {
        productVariantId: variantId,
        quantity: 10,
        manufacturingDate: new Date().toISOString().slice(0, 10),
        batchCode: `FORM-QA-${ctx.runId}`,
      },
      [200, 201],
    );
    ctx.importFormId = form.id;

    const edited = await ctx.admin.patch<StockImportFormResponse>(
      `/stock/import-forms/${form.id}`,
      { quantity: 12 },
    );
    expect(edited.quantity).toBe(12);

    const submitted = await ctx.admin.post<StockImportFormResponse>(
      `/stock/import-forms/${form.id}/submit`,
    );
    expect(submitted.status).not.toBe("DRAFT");

    const confirmed = await ctx.admin.patch<StockImportFormResponse>(
      `/stock/import-forms/${form.id}/confirm`,
    );
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.stockBatchId).toBeTruthy();
  });
}
