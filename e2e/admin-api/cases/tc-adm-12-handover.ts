import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import { ensureProviderOrderCode } from "../helpers/fixtures";
import type {
  AdvanceDeliveryResponse,
  DeliveryAdminResponse,
  OrderResponse,
  Paginated,
} from "../helpers/types";

/** TC-ADM-12 — Confirm the parcel handover to GHN, then simulate the happy path to DELIVERED. */
export async function runTcAdm12(ctx: AdminSuiteContext): Promise<void> {
  const fixture = need(
    ctx.handoverOrder,
    "the paid order fixture for TC-ADM-12",
  );

  await test.step("the delivery has a GHN order code", async () => {
    const delivery = await ensureProviderOrderCode(ctx, fixture.deliveryId);
    expect(delivery.providerOrderCode).toBeTruthy();
  });

  await test.step("GET /admin/deliveries?awaitingHandover=true lists it", async () => {
    const queue = await ctx.admin.get<Paginated<DeliveryAdminResponse>>(
      "/admin/deliveries",
      { awaitingHandover: true, limit: 100 },
    );
    expect(queue.items.map((item) => item.id)).toContain(fixture.deliveryId);
  });

  await test.step("POST handover stamps handedOverAt and ships the order", async () => {
    const delivery = await ctx.admin.post<DeliveryAdminResponse>(
      `/admin/orders/${fixture.orderId}/handover`,
      { note: "Dock A" },
    );
    expect(delivery.handedOverAt).toBeTruthy();
    expect(delivery.handedOverByUserId).toBe(
      need(ctx.adminUserId, "adminUserId"),
    );
    expect(delivery.status).toBe("SHIPPED");
    expect(delivery.providerStatus).toBe("picked");
  });

  await test.step("POST advance walks the simulator to DELIVERED", async () => {
    const advanced = await ctx.admin.post<AdvanceDeliveryResponse>(
      `/admin/deliveries/${fixture.deliveryId}/advance`,
      { steps: 10 },
    );
    expect(advanced.delivery.status).toBe("DELIVERED");
    expect(advanced.transitions.length).toBeGreaterThan(0);
  });

  await test.step("the order itself is DELIVERED", async () => {
    const customerClient = need(ctx.customerClient, "the QA customer client");
    const order = await customerClient.get<OrderResponse>(
      `/orders/${fixture.orderId}`,
    );
    expect(order.status).toBe("DELIVERED");
  });
}
