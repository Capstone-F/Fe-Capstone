import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import type { AvailabilityBlock, ExpertResponse } from "../helpers/types";

/** TC-ADM-05 — Day-2 maintenance: edit the profile, edit and delete availability blocks. */
export async function runTcAdm05(ctx: AdminSuiteContext): Promise<void> {
  const expertId = need(ctx.expertId, "expertId from TC-ADM-04");
  const mondayBlockId = need(
    ctx.availabilityId,
    "availabilityId from TC-ADM-04",
  );

  await test.step("PATCH /experts/:id updates specialization, bio and session length", async () => {
    const updated = await ctx.admin.patch<ExpertResponse>(
      `/experts/${expertId}`,
      {
        specialization: "ACNE_TREATMENT",
        bio: "Updated by QA maintenance case.",
        sessionLengthHours: 2,
      },
    );
    expect(updated.specialization).toBe("ACNE_TREATMENT");
    expect(updated.bio).toBe("Updated by QA maintenance case.");
    // sessionLengthHours is accepted by UpdateExpertDto but absent from ExpertResponseDto,
    // so it cannot be read back through the API. Tracked as a BE finding in the report.
  });

  await test.step("GET availability lists the Monday block", async () => {
    const { items: blocks } = await ctx.admin.get<{
      readonly items: readonly AvailabilityBlock[];
    }>(`/experts/${expertId}/availability`);
    expect(blocks.map((block) => block.id)).toContain(mondayBlockId);
  });

  await test.step("PATCH availability extends the Monday block to 13:00", async () => {
    const updated = await ctx.admin.patch<AvailabilityBlock>(
      `/experts/${expertId}/availability/${mondayBlockId}`,
      { endHour: 13 },
    );
    expect(updated.endHour).toBe(13);
  });

  await test.step("POST then DELETE a Tuesday block leaves no trace", async () => {
    const tuesday = await ctx.admin.post<AvailabilityBlock>(
      `/experts/${expertId}/availability`,
      { dayOfWeek: 2, startHour: 9, endHour: 12 },
      201,
    );
    expect(tuesday.dayOfWeek).toBe(2);

    await ctx.admin.del(`/experts/${expertId}/availability/${tuesday.id}`, 204);

    const { items: blocks } = await ctx.admin.get<{
      readonly items: readonly AvailabilityBlock[];
    }>(`/experts/${expertId}/availability`);
    expect(blocks.map((block) => block.id)).not.toContain(tuesday.id);
    expect(blocks.some((block) => block.dayOfWeek === 2)).toBe(false);
  });
}
