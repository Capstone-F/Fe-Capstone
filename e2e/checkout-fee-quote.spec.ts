import {
  expect,
  test,
  type APIRequestContext,
  type Page,
  type Request,
} from "@playwright/test";

/**
 * Regression cover for ADR-048: the shipping fee quote is keyed on district + ward
 * only, so editing the recipient name, phone or street must not refetch it. The whole
 * point is a request *count*, which no unit test can observe — this drives the real
 * checkout against the real backend and counts what leaves the browser.
 *
 * Needs the docker BE up and the `feequote.test@glowscan.local` fixture account with a
 * non-empty cart.
 */

const TEST_USER = {
  username: "feequote.test@glowscan.local",
  password: "FeeQuote123!",
};

/** GHN prices this address successfully; a district it rejects would mask the count. */
const ADDRESS = {
  province: "Hồ Chí Minh",
  district: "Quận Bình Thạnh",
  otherDistrict: "Quận Gò Vấp",
  recipientName: "Nguyen Van A",
  recipientPhone: "0901234567",
  streetAddress: "123 Le Loi",
};

/**
 * Placeholders are the only stable handle on these inputs — the labels are plain text,
 * not bound to the controls with htmlFor.
 */
const PLACEHOLDER = {
  recipientName: "Nguyễn Văn A",
  recipientPhone: "0901234567",
  streetAddress: "123 Lê Lợi, toà nhà ABC",
};

/** The three GHN selects in DOM order. */
const SELECT = { province: 0, district: 1, ward: 2 };

/**
 * The absence of a request cannot be awaited, so proving it needs a window in which a
 * regression would have fired one. React Query starts a refetch as soon as the key
 * changes, so a second is generous.
 */
const NO_REFETCH_WINDOW_MS = 1000;

interface MobileTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface CartResponse {
  items: { productVariantId: string; quantity: number }[];
}

interface CustomerProfileResponse {
  customer: { gender: string | null; dateOfBirth: string | null };
}

function isFeeQuote(request: Request): boolean {
  return (
    request.method() === "POST" &&
    new URL(request.url()).pathname === "/api/be/delivery/fee-quote"
  );
}

/**
 * Seeds the tokens the way the app itself stores them (ADR-038) instead of driving the
 * login form, which would put Keycloak's redirect dance in the middle of this test.
 */
async function signIn(
  page: Page,
  request: APIRequestContext,
): Promise<MobileTokenResponse> {
  const response = await request.post("/api/be/auth/mobile/login", {
    data: TEST_USER,
  });
  expect(response.ok(), "fixture account failed to log in").toBeTruthy();

  const tokens = (await response.json()) as MobileTokenResponse;
  await page.addInitScript(
    ([accessToken, refreshToken]: [string, string]) => {
      localStorage.setItem("glowscan_access_token", accessToken);
      localStorage.setItem("glowscan_refresh_token", refreshToken);
    },
    [tokens.accessToken, tokens.refreshToken] as [string, string],
  );
  return tokens;
}

/** Checkout renders an empty-cart placeholder instead of the address form otherwise. */
async function assertCartHasItem(
  request: APIRequestContext,
  accessToken: string,
): Promise<void> {
  const response = await request.get("/api/be/cart", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const cart = (await response.json()) as CartResponse;
  expect(
    cart.items.length,
    "fixture account cart is empty — re-seed it before running this spec",
  ).toBeGreaterThan(0);
}

/**
 * ProfileOnboardingGuard redirects a customer with no gender or date of birth to
 * /profile from anywhere, checkout included. Filling it in keeps the fixture usable
 * after a database reset; it is a no-op once set.
 */
async function ensureProfileComplete(
  request: APIRequestContext,
  accessToken: string,
): Promise<void> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const response = await request.get("/api/be/customers/me", { headers });
  const { customer } = (await response.json()) as CustomerProfileResponse;
  if (customer.gender && customer.dateOfBirth) return;

  const patched = await request.patch("/api/be/customers/me", {
    headers,
    data: { gender: "FEMALE", dateOfBirth: "1998-05-20" },
  });
  expect(patched.ok(), "could not complete the fixture profile").toBeTruthy();
}

/**
 * A closing Base UI select leaves an inert backdrop in its portal that swallows clicks
 * on the next trigger, so each selection waits for the popup to actually unmount.
 */
async function awaitPopupClosed(page: Page): Promise<void> {
  await expect(page.locator("[data-base-ui-inert]")).toHaveCount(0);
}

async function selectOption(
  page: Page,
  index: number,
  optionName: string,
): Promise<void> {
  await awaitPopupClosed(page);
  await page.getByRole("combobox").nth(index).click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
  await awaitPopupClosed(page);
}

/**
 * Ward names differ per district, so the ward is picked positionally — by keyboard,
 * because Base UI aligns the popup to the trigger and clips the topmost options out of
 * view, where they cannot be clicked.
 */
async function selectAnyOption(page: Page, index: number): Promise<void> {
  await awaitPopupClosed(page);
  await page.getByRole("combobox").nth(index).click();
  await expect(page.getByRole("option").first()).toBeAttached();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await awaitPopupClosed(page);
}

test("editing recipient fields does not refetch the shipping fee", async ({
  page,
  request,
}) => {
  const tokens = await signIn(page, request);
  await assertCartHasItem(request, tokens.accessToken);
  await ensureProfileComplete(request, tokens.accessToken);

  let feeQuoteCount = 0;
  page.on("request", (outgoing) => {
    if (isFeeQuote(outgoing)) feeQuoteCount += 1;
  });

  await page.goto("/checkout");
  // Until the cart query resolves, checkout shows its empty-cart placeholder — whose
  // "Tiếp tục mua sắm" button a loose name match would happily click.
  await expect(page.getByText("Xem lại giỏ")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();

  // The address is incomplete — and the query disabled — until the last field lands,
  // so filling the form can only ever produce one quote.
  const firstQuote = page.waitForResponse((response) =>
    isFeeQuote(response.request()),
  );
  await selectOption(page, SELECT.province, ADDRESS.province);
  await selectOption(page, SELECT.district, ADDRESS.district);
  await selectAnyOption(page, SELECT.ward);
  await page
    .getByPlaceholder(PLACEHOLDER.recipientName)
    .fill(ADDRESS.recipientName);
  await page
    .getByPlaceholder(PLACEHOLDER.recipientPhone)
    .fill(ADDRESS.recipientPhone);
  await page
    .getByPlaceholder(PLACEHOLDER.streetAddress)
    .fill(ADDRESS.streetAddress);
  await firstQuote;

  expect(feeQuoteCount).toBe(1);

  // Everything below changes the request body but not the district/ward the fee is
  // keyed on. Before ADR-048 each of these keystrokes refetched.
  await page
    .getByPlaceholder(PLACEHOLDER.streetAddress)
    .pressSequentially(", toà nhà ABC");
  await page
    .getByPlaceholder(PLACEHOLDER.recipientName)
    .pressSequentially(" Nguyen");
  await page.getByPlaceholder(PLACEHOLDER.recipientPhone).fill("0912345678");
  await page.waitForTimeout(NO_REFETCH_WINDOW_MS);

  expect(feeQuoteCount).toBe(1);

  // The other half of the guarantee: the key must still be narrow enough to react to
  // an input GHN actually prices differently.
  const secondQuote = page.waitForResponse((response) =>
    isFeeQuote(response.request()),
  );
  await selectOption(page, SELECT.district, ADDRESS.otherDistrict);
  await selectAnyOption(page, SELECT.ward);
  await secondQuote;

  expect(feeQuoteCount).toBe(2);
});
