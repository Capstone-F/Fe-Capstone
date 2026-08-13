import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import type { UserResponse } from "../helpers/types";

/** TC-ADM-01 — Login as app_admin, read and update the own profile. */
export async function runTcAdm01(ctx: AdminSuiteContext): Promise<void> {
  const me = await test.step("GET /users/me", async () => {
    const profile = await ctx.admin.get<UserResponse>("/users/me");
    expect(profile.roles).toContain("app_admin");
    expect(profile.clinicId).toBeNull();
    return profile;
  });

  ctx.adminUserId = me.id;

  await test.step("PATCH /users/me renames the admin", async () => {
    const newName = `GlowScan Admin QA ${ctx.runId}`;
    const updated = await ctx.admin.patch<UserResponse>("/users/me", {
      name: newName,
    });
    expect(updated.name).toBe(newName);

    const reread = await ctx.admin.get<UserResponse>("/users/me");
    expect(reread.name).toBe(newName);
  });
}
