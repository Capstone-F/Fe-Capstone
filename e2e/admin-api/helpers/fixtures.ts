import { ApiClient, register } from "./api";
import type { Actor, AdminSuiteContext, OrderFixture } from "./ctx";
import { need } from "./ctx";
import type {
  CheckoutResponse,
  DeliveryAdminResponse,
  GhnDistrict,
  GhnProvince,
  GhnWard,
  OrderResponse,
  Paginated,
  ProductDetailResponse,
  StockBatchResponse,
} from "./types";
import { buildSuccessIpnQuery } from "./vnpay";

const BASE_URL = process.env.ADMIN_API_BASE_URL ?? "http://localhost:3001";
const CUSTOMER_PASSWORD = "QaCustomer123!";

export function newClient(): ApiClient {
  return new ApiClient(BASE_URL);
}

/**
 * Registers a throwaway customer. A fresh account per run keeps the suite from mutating
 * the seeded demo customer (wallet balance, survey answers, support history).
 */
export async function createCustomer(
  runId: string,
  label: string,
): Promise<{
  readonly actor: Actor;
  readonly client: ApiClient;
}> {
  const client = newClient();
  const email = `qa.${label}.${runId}@glowscan.local`;
  const result = await register(
    client,
    email,
    CUSTOMER_PASSWORD,
    `QA ${label} ${runId}`,
  );
  client.setToken(result.accessToken);
  return {
    client,
    actor: { token: result.accessToken, userId: result.user.id, email },
  };
}

/** Picks the first sellable catalog variant and guarantees it has stock on the rack. */
export async function ensureSellableVariant(
  ctx: AdminSuiteContext,
  quantity: number,
): Promise<{ readonly variantId: string; readonly priceVnd: number }> {
  const page = await ctx.admin.get<Paginated<ProductDetailResponse>>(
    "/products",
    {
      page: 1,
      limit: 20,
    },
  );
  const variant = page.items
    .flatMap((entry) => entry.product.variants)
    .find((candidate) => candidate.isActive);
  if (!variant) {
    throw new Error(
      "No active product variant in the catalog — run `npm run seed` on the BE.",
    );
  }

  await ctx.admin.post<StockBatchResponse>(
    "/stock/batches",
    {
      productVariantId: variant.id,
      quantity,
      manufacturingDate: new Date().toISOString().slice(0, 10),
      batchCode: `QA-FIXTURE-${ctx.runId}`,
    },
    [200, 201],
  );

  return { variantId: variant.id, priceVnd: variant.priceVnd };
}

interface ShippingAddress {
  readonly recipientName: string;
  readonly recipientPhone: string;
  readonly provinceId: number;
  readonly districtId: number;
  readonly wardCode: string;
  readonly streetAddress: string;
}

const PREFERRED_PROVINCE = /h(ồ|o) ch(í|i) minh/i;

/**
 * Resolves a real GHN province/district/ward triple. Hardcoding ids is brittle because GHN
 * reshuffles them, and the order endpoint quotes a live fee against these values anyway.
 *
 * GHN's sandbox carries decoy provinces ("Hà Nội 02") whose district list comes back null,
 * so the search skips any province that does not yield both a district and a ward.
 */
async function resolveShippingAddress(
  client: ApiClient,
): Promise<ShippingAddress> {
  const provinces = await client.get<readonly GhnProvince[]>(
    "/delivery/provinces",
  );
  const ordered = [...provinces].sort((left, right) => {
    const leftScore = PREFERRED_PROVINCE.test(
      left.ProvinceName ?? left.provinceName ?? "",
    )
      ? 0
      : 1;
    const rightScore = PREFERRED_PROVINCE.test(
      right.ProvinceName ?? right.provinceName ?? "",
    )
      ? 0
      : 1;
    return leftScore - rightScore;
  });

  for (const province of ordered.slice(0, 10)) {
    const provinceId = province.ProvinceID ?? province.provinceId;
    if (provinceId === undefined) {
      continue;
    }

    const districts =
      (await client.get<readonly GhnDistrict[] | null>("/delivery/districts", {
        provinceId,
      })) ?? [];
    for (const district of districts.slice(0, 5)) {
      const districtId = district.DistrictID ?? district.districtId;
      if (districtId === undefined) {
        continue;
      }

      const wards =
        (await client.get<readonly GhnWard[] | null>("/delivery/wards", {
          districtId,
        })) ?? [];
      const wardCode = wards
        .map((ward) => ward.WardCode ?? ward.wardCode)
        .find((code) => code !== undefined);
      if (wardCode !== undefined) {
        return {
          recipientName: "QA Automation",
          recipientPhone: "0901234567",
          provinceId,
          districtId,
          wardCode,
          streetAddress: "12 QA Street",
        };
      }
    }
  }

  throw new Error(
    "No GHN province/district/ward triple with a deliverable ward was found.",
  );
}

/**
 * Drives a customer order all the way to PROCESSING without a human in the VNPay sandbox.
 *
 * Checkout returns a VNPay redirect URL; the suite re-signs its parameters as a successful
 * IPN callback and calls `GET /payments/vnpay/ipn`, which is the only path that actually
 * settles the payment (the return URL just redirects). Settlement deducts stock and asks
 * GHN for an order code.
 */
export async function createPaidOrder(
  ctx: AdminSuiteContext,
  customerClient: ApiClient,
  quantity = 1,
): Promise<OrderFixture> {
  const { variantId } = await ensureSellableVariant(ctx, 50);

  // A leftover cart from an interrupted run would change the order total.
  await customerClient.raw("DELETE", "/cart");
  await customerClient.post(
    "/cart/items",
    {
      productVariantId: variantId,
      quantity,
      source: "CATALOG",
    },
    [200, 201],
  );

  const shippingAddress = await resolveShippingAddress(customerClient);
  const order = await customerClient.post<OrderResponse>(
    "/orders",
    { shippingAddress },
    [200, 201],
  );

  const checkout = await customerClient.post<CheckoutResponse>(
    "/payments/checkout",
    { orderId: order.id, client: "web" },
    [200, 201],
  );

  const ipn = await ctx.anon.raw<{
    readonly RspCode?: string;
    readonly Message?: string;
  }>(
    "GET",
    `/payments/vnpay/ipn?${buildSuccessIpnQuery(checkout.paymentUrl, new Date())}`,
  );
  if (ipn.body?.RspCode !== "00") {
    throw new Error(
      `VNPay IPN simulation was rejected: ${JSON.stringify(ipn.body)}. ` +
        "Check VNP_HASH_SECRET in Be-Capstone/.env.",
    );
  }

  const settled = await customerClient.get<OrderResponse>(
    `/orders/${order.id}`,
  );
  if (settled.status !== "PAID" && settled.status !== "PROCESSING") {
    throw new Error(
      `Order ${order.id} did not settle: status=${settled.status}`,
    );
  }

  const deliveries = await ctx.admin.get<Paginated<DeliveryAdminResponse>>(
    "/admin/deliveries",
    { orderId: order.id, limit: 10 },
  );
  const delivery = need(
    deliveries.items[0],
    `a delivery for order ${order.id}`,
  );

  return {
    orderId: settled.id,
    deliveryId: delivery.id,
    totalVnd: settled.totalVnd,
    subtotalVnd: settled.subtotalVnd,
    discountVnd: settled.discountVnd,
    shippingFeeVnd: settled.shippingFeeVnd,
    items: settled.items.map((item) => ({
      orderItemId: item.id,
      quantity: item.quantity,
    })),
  };
}

/** Makes sure a delivery has a GHN order code, retrying creation when the first attempt failed. */
export async function ensureProviderOrderCode(
  ctx: AdminSuiteContext,
  deliveryId: string,
): Promise<DeliveryAdminResponse> {
  const current = await ctx.admin.get<DeliveryAdminResponse>(
    `/admin/deliveries/${deliveryId}`,
  );
  if (current.providerOrderCode) {
    return current;
  }
  const retried = await ctx.admin.post<{
    readonly delivery: DeliveryAdminResponse;
  }>(`/admin/deliveries/${deliveryId}/create-ghn-order`);
  return retried.delivery;
}
