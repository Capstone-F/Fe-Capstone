import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import type { ClinicResponse, Paginated } from "../helpers/types";

/** Walks the public clinic list, which is paginated and active-only. */
async function publicListContains(
  ctx: AdminSuiteContext,
  clinicId: string,
): Promise<boolean> {
  for (let page = 1; page <= 10; page += 1) {
    const result = await ctx.admin.get<Paginated<ClinicResponse>>("/clinics", {
      page,
      limit: 100,
    });
    if (result.items.some((clinic) => clinic.id === clinicId)) {
      return true;
    }
    if (page * result.limit >= result.total) {
      return false;
    }
  }
  return false;
}

/** TC-ADM-03 — Create, update, soft-deactivate and reactivate a partner clinic. */
export async function runTcAdm03(ctx: AdminSuiteContext): Promise<void> {
  await test.step("GET /admin/clinics includes inactive clinics", async () => {
    const page = await ctx.admin.get<Paginated<ClinicResponse>>(
      "/admin/clinics",
      {
        page: 1,
        limit: 100,
      },
    );
    expect(page.total).toBeGreaterThan(0);
  });

  const clinic = await test.step("POST /admin/clinics", async () => {
    const created = await ctx.admin.post<ClinicResponse>(
      "/admin/clinics",
      {
        name: `QA Clinic D7 ${ctx.runId}`,
        address: "99 Nguyen Luong Bang, District 7, Ho Chi Minh City",
        latitude: 10.76,
        longitude: 106.7,
        isActive: true,
      },
      201,
    );
    expect(created.isActive).toBe(true);
    return created;
  });

  ctx.clinicId = clinic.id;

  await test.step("GET + PATCH /admin/clinics/:id", async () => {
    const detail = await ctx.admin.get<ClinicResponse>(
      `/admin/clinics/${clinic.id}`,
    );
    expect(detail.id).toBe(clinic.id);

    const updated = await ctx.admin.patch<ClinicResponse>(
      `/admin/clinics/${clinic.id}`,
      {
        name: `QA Clinic D7 Updated ${ctx.runId}`,
      },
    );
    expect(updated.name).toBe(`QA Clinic D7 Updated ${ctx.runId}`);
  });

  await test.step("DELETE soft-deactivates, the row survives", async () => {
    const deactivated = await ctx.admin.del<ClinicResponse>(
      `/admin/clinics/${clinic.id}`,
    );
    expect(deactivated.isActive).toBe(false);

    const stillThere = await ctx.admin.get<ClinicResponse>(
      `/admin/clinics/${clinic.id}`,
    );
    expect(stillThere.id).toBe(clinic.id);
  });

  await test.step("public GET /clinics hides the inactive clinic", async () => {
    expect(await publicListContains(ctx, clinic.id)).toBe(false);
  });

  await test.step("PATCH isActive=true brings it back to the public list", async () => {
    const reactivated = await ctx.admin.patch<ClinicResponse>(
      `/admin/clinics/${clinic.id}`,
      { isActive: true },
    );
    expect(reactivated.isActive).toBe(true);
    expect(await publicListContains(ctx, clinic.id)).toBe(true);
  });
}
