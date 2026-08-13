import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type {
  AdvanceCancellationResponse,
  OrderCancellationResponse,
  WalletBalance,
} from "../helpers/types";

/** Pushes the cancellation forward until it reaches one of the wanted statuses. */
async function advanceUntil(
  ctx: AdminSuiteContext,
  cancellationId: string,
  wanted: readonly string[],
  maxRounds = 4,
): Promise<OrderCancellationResponse> {
  let current = await ctx.admin.get<OrderCancellationResponse>(
    `/admin/order-cancellations/${cancellationId}`,
  );
  for (
    let round = 0;
    round < maxRounds && !wanted.includes(current.status);
    round += 1
  ) {
    const advanced = await ctx.admin.post<AdvanceCancellationResponse>(
      `/admin/order-cancellations/${cancellationId}/advance`,
      { steps: 10 },
    );
    current = advanced.cancellation;
  }
  return current;
}

/** TC-ADM-13 — Cancel a paid order, refund the wallet, confirm the physical return, restock. */
export async function runTcAdm13(ctx: AdminSuiteContext): Promise<void> {
  const fixture = need(
    ctx.cancellationOrder,
    "the paid order fixture for TC-ADM-13",
  );
  const customer = need(ctx.customer, "the QA customer");

  const balanceBefore = Number(
    (await ctx.admin.get<WalletBalance>(`/admin/wallets/${customer.userId}`))
      .balanceVnd,
  );

  const cancellation =
    await test.step("POST /admin/order-cancellations requests it", async () => {
      const created = await ctx.admin.post<OrderCancellationResponse>(
        "/admin/order-cancellations",
        { orderId: fixture.orderId, reason: "QA cancel" },
        201,
      );
      expect(created.status).toBe("REQUESTED");
      expect(created.requestedByActor).toBe("STAFF");
      return created;
    });

  const awaiting =
    await test.step("advance parks it at AWAITING_RETURN", async () => {
      const current = await advanceUntil(ctx, cancellation.id, [
        "AWAITING_RETURN",
      ]);
      expect(current.status).toBe("AWAITING_RETURN");
      expect(current.refundedAt).toBeTruthy();
      return current;
    });

  await test.step("the wallet was refunded with subtotal minus discount (shipping excluded)", async () => {
    const expectedRefund = fixture.subtotalVnd - fixture.discountVnd;
    expect(Number(awaiting.refundAmountVnd)).toBe(expectedRefund);

    const after = Number(
      (await ctx.admin.get<WalletBalance>(`/admin/wallets/${customer.userId}`))
        .balanceVnd,
    );
    expect(after).toBe(balanceBefore + expectedRefund);
  });

  await test.step("POST confirm-return puts good units back on the rack", async () => {
    const confirmed = await ctx.admin.post<OrderCancellationResponse>(
      `/admin/order-cancellations/${cancellation.id}/confirm-return`,
      {
        items: awaiting.items.map((item) => ({
          orderItemId: item.orderItemId,
          goodQuantity: item.expectedQuantity,
          damagedQuantity: 0,
        })),
        note: "QA restock",
      },
    );
    expect(["RESTOCKED", "COMPLETED"]).toContain(confirmed.status);
    for (const item of confirmed.items) {
      expect(item.goodQuantity).toBe(item.expectedQuantity);
      expect(item.damagedQuantity).toBe(0);
    }
  });

  await test.step("a final advance completes the cancellation", async () => {
    const current = await advanceUntil(ctx, cancellation.id, ["COMPLETED"], 3);
    expect(current.status).toBe("COMPLETED");
  });
}
