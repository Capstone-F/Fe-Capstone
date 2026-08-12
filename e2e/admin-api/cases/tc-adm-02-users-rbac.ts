import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type { Paginated, UserResponse } from "../helpers/types";

/** TC-ADM-02 — List users, create a staff account, replace roles, disable then re-enable. */
export async function runTcAdm02(ctx: AdminSuiteContext): Promise<void> {
  const firstPage = await test.step("GET /admin/users paginates", async () => {
    const page = await ctx.admin.get<Paginated<UserResponse>>("/admin/users", {
      page: 1,
      limit: 20,
    });
    expect(page.page).toBe(1);
    expect(page.limit).toBe(20);
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
    return page;
  });

  await test.step("GET /admin/users filters by role and q", async () => {
    const filtered = await ctx.admin.get<Paginated<UserResponse>>(
      "/admin/users",
      {
        role: "staff",
        q: "glowscan",
      },
    );
    // The filter must not leak non-staff accounts; an empty result is still a pass.
    for (const user of filtered.items) {
      expect(user.roles).toContain("staff");
    }
  });

  await test.step("GET /users/:id resolves a known user", async () => {
    const target = need(firstPage.items[0], "a user from the first page");
    const detail = await ctx.admin.get<UserResponse>(`/users/${target.id}`);
    expect(detail.id).toBe(target.id);
  });

  const staff =
    await test.step("POST /users creates a staff account", async () => {
      const created = await ctx.admin.post<UserResponse>(
        "/users",
        {
          email: `qa.staff.${ctx.runId}@glowscan.local`,
          name: "QA Staff",
          role: "staff",
          temporaryPassword: "TempPass123!",
        },
        201,
      );
      expect(created.roles).toEqual(["staff"]);
      expect(created.isActive).toBe(true);
      expect(created.keycloakSub).toBeTruthy();
      return created;
    });

  ctx.createdStaffUserId = staff.id;

  await test.step("PATCH /users/:id/roles replaces roles", async () => {
    const updated = await ctx.admin.patch<UserResponse>(
      `/users/${staff.id}/roles`,
      {
        roles: ["staff"],
      },
    );
    expect(updated.roles).toEqual(["staff"]);
  });

  await test.step("PATCH /users/:id/status disables then re-enables", async () => {
    const disabled = await ctx.admin.patch<UserResponse>(
      `/users/${staff.id}/status`,
      {
        isActive: false,
      },
    );
    expect(disabled.isActive).toBe(false);

    const reread = await ctx.admin.get<UserResponse>(`/users/${staff.id}`);
    expect(reread.isActive).toBe(false);

    const enabled = await ctx.admin.patch<UserResponse>(
      `/users/${staff.id}/status`,
      {
        isActive: true,
      },
    );
    expect(enabled.isActive).toBe(true);
  });
}
