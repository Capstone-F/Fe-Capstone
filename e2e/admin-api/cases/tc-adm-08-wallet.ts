import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type { Paginated, UserResponse, WalletBalance } from "../helpers/types";

const TOP_UP_VND = 500000;

/** TC-ADM-08 — Inspect a customer wallet and credit it directly (no payment gateway). */
export async function runTcAdm08(ctx: AdminSuiteContext): Promise<void> {
  const customer = need(ctx.customer, "the QA customer created in suite setup");

  await test.step("GET /admin/users?role=customer finds customer accounts", async () => {
    const page = await ctx.admin.get<Paginated<UserResponse>>("/admin/users", {
      role: "customer",
      limit: 100,
    });
    expect(page.total).toBeGreaterThan(0);
  });

  const before =
    await test.step("GET /admin/wallets/:userId creates a zero wallet", async () => {
      const wallet = await ctx.admin.get<WalletBalance>(
        `/admin/wallets/${customer.userId}`,
      );
      return Number(wallet.balanceVnd);
    });

  await test.step("POST top-up credits the ledger", async () => {
    await ctx.admin.post(`/admin/wallets/${customer.userId}/top-up`, {
      amountVnd: TOP_UP_VND,
      note: "QA credit",
    });

    const after = await ctx.admin.get<WalletBalance>(
      `/admin/wallets/${customer.userId}`,
    );
    expect(Number(after.balanceVnd)).toBe(before + TOP_UP_VND);
  });

  await test.step("top-up below the 1000 VND minimum is rejected", async () => {
    const rejected = await ctx.admin.raw(
      "POST",
      `/admin/wallets/${customer.userId}/top-up`,
      {
        body: { amountVnd: 500 },
      },
    );
    expect(rejected.status).toBe(400);
  });
}
