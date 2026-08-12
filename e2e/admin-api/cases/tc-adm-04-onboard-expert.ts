import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type {
  AvailabilityBlock,
  ExpertResponse,
  Paginated,
  UserResponse,
} from "../helpers/types";

const PLACEHOLDER_AVATAR = "https://placehold.co/400";

/** TC-ADM-04 — Onboard an expert end to end: account, profile, fee, availability, avatar. */
export async function runTcAdm04(ctx: AdminSuiteContext): Promise<void> {
  const clinicId = need(ctx.clinicId, "clinicId from TC-ADM-03");

  const expertUser =
    await test.step("POST /users creates the expert account", async () => {
      const created = await ctx.admin.post<UserResponse>(
        "/users",
        {
          email: `qa.expert.${ctx.runId}@glowscan.local`,
          name: "QA Expert",
          role: "expert",
          clinicId,
          temporaryPassword: "TempPass123!",
        },
        201,
      );
      expect(created.roles).toEqual(["expert"]);
      expect(created.clinicId).toBe(clinicId);
      return created;
    });

  ctx.expertUserId = expertUser.id;

  const expert =
    await test.step("POST /experts creates the clinic-bound profile", async () => {
      const created = await ctx.admin.post<ExpertResponse>(
        "/experts",
        {
          userId: expertUser.id,
          clinicId,
          specialization: "DERMATOLOGY",
          licenseNumber: `LIC-QA-${ctx.runId}`,
          bio: "QA seeded dermatology expert.",
          consultationFee: 400000,
          sessionLengthHours: 1,
          isActive: true,
        },
        201,
      );
      expect(created.clinicId).toBe(clinicId);
      expect(Number(created.consultationFee)).toBe(400000);
      return created;
    });

  ctx.expertId = expert.id;

  await test.step("PUT /experts/:id/consultation-fee updates the fee", async () => {
    const updated = await ctx.admin.put<ExpertResponse>(
      `/experts/${expert.id}/consultation-fee`,
      { consultationFee: 450000 },
    );
    expect(Number(updated.consultationFee)).toBe(450000);
  });

  await test.step("POST availability creates a Monday 09-12 block", async () => {
    const block = await ctx.admin.post<AvailabilityBlock>(
      `/experts/${expert.id}/availability`,
      { dayOfWeek: 1, startHour: 9, endHour: 12 },
      201,
    );
    expect(block.dayOfWeek).toBe(1);
    expect(block.startHour).toBe(9);
    expect(block.endHour).toBe(12);
    ctx.availabilityId = block.id;
  });

  await test.step("PATCH /experts/:id sets the avatar", async () => {
    const updated = await ctx.admin.patch<ExpertResponse>(
      `/experts/${expert.id}`,
      {
        avatarUrl: PLACEHOLDER_AVATAR,
      },
    );
    expect(updated.avatarUrl).toBe(PLACEHOLDER_AVATAR);
  });

  await test.step("the expert is discoverable by id and by clinic", async () => {
    const detail = await ctx.admin.get<ExpertResponse>(`/experts/${expert.id}`);
    expect(detail.id).toBe(expert.id);

    const byClinic = await ctx.admin.get<Paginated<ExpertResponse>>(
      "/experts",
      {
        clinicId,
        limit: 100,
      },
    );
    expect(byClinic.items.map((item) => item.id)).toContain(expert.id);
  });

  await test.step("POST /users creates a clinic_manager for the same clinic", async () => {
    const manager = await ctx.admin.post<UserResponse>(
      "/users",
      {
        email: `qa.manager.${ctx.runId}@glowscan.local`,
        name: "QA Clinic Manager",
        role: "clinic_manager",
        clinicId,
        temporaryPassword: "TempPass123!",
      },
      201,
    );
    expect(manager.roles).toEqual(["clinic_manager"]);
    expect(manager.clinicId).toBe(clinicId);
  });
}
