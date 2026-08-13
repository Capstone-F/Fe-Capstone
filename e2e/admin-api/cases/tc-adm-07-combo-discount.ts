import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import type { ComboDiscountSetting } from "../helpers/types";

/**
 * TC-ADM-07 — Read and update the survey combo discount.
 *
 * The original values are captured into the context and restored by the suite teardown so
 * a QA run never leaves the demo pricing changed.
 */
export async function runTcAdm07(ctx: AdminSuiteContext): Promise<void> {
  const original = await test.step("GET current combo discount", async () => {
    const setting = await ctx.admin.get<ComboDiscountSetting>(
      "/admin/commerce-settings/survey-combo-discount",
    );
    expect(typeof setting.percent).toBe("number");
    expect(typeof setting.minSubtotalVnd).toBe("number");
    return setting;
  });

  ctx.originalComboDiscount = {
    percent: original.percent,
    minSubtotalVnd: original.minSubtotalVnd,
  };

  await test.step("PATCH persists percent and minSubtotalVnd", async () => {
    const updated = await ctx.admin.patch<ComboDiscountSetting>(
      "/admin/commerce-settings/survey-combo-discount",
      { percent: 15, minSubtotalVnd: 300000 },
    );
    expect(updated.percent).toBe(15);
    expect(updated.minSubtotalVnd).toBe(300000);

    const reread = await ctx.admin.get<ComboDiscountSetting>(
      "/admin/commerce-settings/survey-combo-discount",
    );
    expect(reread.percent).toBe(15);
    expect(reread.minSubtotalVnd).toBe(300000);
  });
}

/** Puts the pricing back where it was; called from the suite teardown. */
export async function restoreComboDiscount(
  ctx: AdminSuiteContext,
): Promise<void> {
  if (!ctx.originalComboDiscount) {
    return;
  }
  await ctx.admin.patch<ComboDiscountSetting>(
    "/admin/commerce-settings/survey-combo-discount",
    ctx.originalComboDiscount,
  );
}
