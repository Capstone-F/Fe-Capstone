import { expect, test } from "@playwright/test";

/**
 * URL contract for /products. These run as a guest: catalog mode must work with no
 * session, and the "Dành cho bạn" rail is expected to be absent.
 * Requires the docker BE up and BE_API_URL=http://localhost:3001 (ADR-049).
 */

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

test.describe("catalog mode", () => {
  test("view=all shows the catalog", async ({ page }) => {
    await page.goto("/products?view=all");
    await expect(page.getByTestId("product-catalog")).toBeVisible();
    await expect(page.getByTestId("products-discovery")).toHaveCount(0);
  });

  test("legacy brandName link still filters", async ({ page }) => {
    await page.goto("/products?brandName=CeraVe");
    await expect(page.getByTestId("product-catalog")).toBeVisible();
  });

  test("section=recommended renders the empty state for a guest", async ({
    page,
  }) => {
    await page.goto("/products?section=recommended");
    await expect(page.getByTestId("product-catalog")).toBeVisible();
    // As a guest, useProductSuggestions(20, false) is disabled, so this always
    // renders the empty state regardless of the section's own pagination
    // logic — it is NOT proof that recommended results stay unpaginated. The
    // real "no pagination for a signed-in user with recs" behaviour is
    // uncovered by these guest-only specs.
    await expect(
      page.getByText("Không tìm thấy sản phẩm phù hợp"),
    ).toBeVisible();
    await expect(page.getByLabel("Trang sau")).toHaveCount(0);
  });

  test("section=newest renders catalog mode", async ({ page }) => {
    // Shop-home links here (shop-home-page.tsx) expecting catalog mode.
    await page.goto("/products?section=newest");
    await expect(page.getByTestId("product-catalog")).toBeVisible();
    await expect(page.getByTestId("products-discovery")).toHaveCount(0);
  });

  test("typing in the sidebar search does not spam history", async ({
    page,
  }) => {
    await page.goto("/products?view=all");
    const before = await page.evaluate(() => history.length);
    await page
      .getByPlaceholder("Tên, thương hiệu, hoạt chất...")
      .fill("retinol");
    await expect(page).toHaveURL(/query=retinol/);
    const after = await page.evaluate(() => history.length);
    expect(after).toBe(before);
  });

  test("browser back returns to the previous filter", async ({ page }) => {
    await page.goto("/products?view=all");
    await page.goto("/products?query=retinol");
    await page.goBack();
    await expect(page).toHaveURL(/view=all/);
  });

  test("browser back after a soft nav does not resurrect a stale search draft", async ({
    page,
  }) => {
    await page.goto("/products?view=all");
    const catalog = page.getByTestId("product-catalog");

    // Pick a real category tile, not "Tất cả": clicking "Tất cả" is a
    // clear-patch (categoryId: null) which, since view=all is already set,
    // no longer leaves catalog mode (see the view-retention fix) — but more
    // importantly this test needs a *soft push* that keeps the sidebar
    // mounted throughout, and a real category tile is guaranteed to do that.
    // CategoryItem is the only button in the sidebar with aria-pressed.
    const categoryTile = catalog
      .locator("button[aria-pressed]")
      .filter({ hasNotText: "Tất cả" })
      .first();
    await categoryTile.click();
    await expect(page).toHaveURL(/categoryId=/);
    await expect(catalog).toBeVisible();

    // Typing debounces into a router.replace, so this mutates the current
    // history entry rather than pushing a new one.
    await page
      .getByPlaceholder("Tên, thương hiệu, hoạt chất...")
      .fill("retinol");
    await expect(page).toHaveURL(/query=retinol/);

    // Back pops to the /products?view=all entry (categoryId and query gone).
    // The search draft is still "retinol" at this instant — it must resync
    // to the URL instead of writing itself back and undoing the Back press.
    await page.goBack();
    await expect(page).toHaveURL(/view=all/);
    await expect(page).not.toHaveURL(/categoryId=/);

    // Give the 350ms debounce window time to settle; the query param must
    // stay gone once the draft has resynced.
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/query=retinol/);
  });

  test("view=all + clicking the active 'Tất cả' category stays in catalog mode", async ({
    page,
  }) => {
    // Regression test: a clear-patch (categoryId: null) must not drop `view`,
    // or this would fall out of catalog mode into discovery (see the
    // view-retention fix in product-filters.ts).
    await page.goto("/products?view=all");
    await page.getByRole("button", { name: "Tất cả", exact: true }).click();
    await expect(page).toHaveURL(/view=all/);
    await expect(page.getByTestId("product-catalog")).toBeVisible();
    await expect(page.getByTestId("products-discovery")).toHaveCount(0);
  });

  test("setting a filter while paginated drops the page param", async ({
    page,
  }) => {
    await page.goto("/products?view=all&page=3");
    const catalog = page.getByTestId("product-catalog");
    const categoryTile = catalog
      .locator("button[aria-pressed]")
      .filter({ hasNotText: "Tất cả" })
      .first();
    await categoryTile.click();
    await expect(page).toHaveURL(/categoryId=/);
    await expect(page).not.toHaveURL(/page=/);
  });

  test("pagination preserves the active filter", async ({ page }) => {
    await page.goto("/products?view=all");
    const catalog = page.getByTestId("product-catalog");
    const categoryTile = catalog
      .locator("button[aria-pressed]")
      .filter({ hasNotText: "Tất cả" })
      .first();
    await categoryTile.click();
    await expect(page).toHaveURL(/categoryId=/);
    const categoryUrl = new URL(page.url());
    const categoryId = categoryUrl.searchParams.get("categoryId");

    const nextButton = page.getByLabel("Trang sau");
    if (await nextButton.isDisabled()) {
      test.skip(true, "Only one page of results for this category in the seed");
      return;
    }
    await nextButton.click();
    await expect(page).toHaveURL(new RegExp(`categoryId=${categoryId}`));
    await expect(page).toHaveURL(/page=2/);
  });

  test("removing the last chip returns to a clean URL", async ({ page }) => {
    await page.goto("/products?query=retinol");
    await page.getByTestId("filter-chip").getByRole("button").click();
    await expect(page).toHaveURL(/\/products$/);
  });
});

test.describe("discovery mode", () => {
  test("bare /products shows discovery, not the catalog", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("products-discovery")).toBeVisible();
    await expect(page.getByTestId("product-catalog")).toHaveCount(0);
  });

  test("a guest sees featured but no personalised rail", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("rail-featured")).toBeVisible();
    await expect(page.getByTestId("rail-recommended")).toHaveCount(0);
  });

  test("a category tile switches to catalog mode", async ({ page }) => {
    await page.goto("/products");
    await page
      .getByTestId("category-carousel")
      .getByRole("button")
      .first()
      .click();
    await expect(page).toHaveURL(/categoryId=/);
    await expect(page.getByTestId("product-catalog")).toBeVisible();
  });

  test("a suggestion chip filters by ingredient", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: "Niacinamide" }).click();
    await expect(page).toHaveURL(/ingredientName=Niacinamide/);
    await expect(page.getByTestId("product-catalog")).toBeVisible();
  });

  test("the search hero pushes a query and is reversible", async ({ page }) => {
    await page.goto("/products");
    await page.getByLabel("Tìm kiếm").fill("retinol");
    await page.getByRole("button", { name: "Tìm kiếm" }).click();
    await expect(page).toHaveURL(/query=retinol/);
    await page.goBack();
    await expect(page.getByTestId("products-discovery")).toBeVisible();
  });

  test("clearing the last filter returns to discovery", async ({ page }) => {
    await page.goto("/products?query=retinol");
    await page.getByTestId("filter-chip").getByRole("button").click();
    await expect(page.getByTestId("products-discovery")).toBeVisible();
  });

  test("a brand bento tile lands in catalog mode with a real brand name chip", async ({
    page,
  }) => {
    await page.goto("/products");
    const bento = page.getByTestId("brand-bento");
    if ((await bento.count()) === 0) {
      test.skip(true, "No brands in this seed — bento hides itself when empty");
      return;
    }
    await bento.getByRole("button").first().click();
    await expect(page).toHaveURL(/brandId=/);
    await expect(page.getByTestId("product-catalog")).toBeVisible();

    const chip = page.getByTestId("filter-chip").first();
    await expect(chip).toBeVisible();
    // The chip must show the resolved brand name, not fall back to the raw
    // brandId UUID (regression coverage for the useBrands(enabled) fix).
    await expect(chip).not.toContainText(UUID_PATTERN);
  });
});
