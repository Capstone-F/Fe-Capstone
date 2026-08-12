import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import type { AdminSurveyQuestion } from "../helpers/types";

/** The admin DTO exposes options either flattened or with a nested label. */
function optionCodes(question: AdminSurveyQuestion): readonly string[] {
  return question.options.map(
    (option) => option.labelCode ?? option.label?.code ?? "",
  );
}

/** TC-ADM-06 — Question bank CRUD: create, patch metadata, replace options, soft-delete. */
export async function runTcAdm06(ctx: AdminSuiteContext): Promise<void> {
  const code = `QA_ADMIN_CONCERN_${ctx.runId}`;

  await test.step("GET /admin/survey-questions?activeOnly=true", async () => {
    const active = await ctx.admin.get<readonly AdminSurveyQuestion[]>(
      "/admin/survey-questions",
      { activeOnly: true },
    );
    expect(active.length).toBeGreaterThan(0);
    expect(active.every((question) => question.isActive)).toBe(true);
  });

  const created =
    await test.step("POST creates a MULTI_SELECT concern question", async () => {
      const question = await ctx.admin.post<AdminSurveyQuestion>(
        "/admin/survey-questions",
        {
          code,
          text: "QA concern?",
          questionType: "MULTI_SELECT",
          displayOrder: 99,
          priority: "OPTIONAL",
          category: "CONCERN",
          intent: "QA",
          isActive: true,
          options: [
            { labelCode: "ACNE", displayOrder: 0 },
            { labelCode: "BLACKHEADS", displayOrder: 1 },
          ],
        },
        [200, 201],
      );
      expect(question.code).toBe(code);
      expect(optionCodes(question)).toEqual(["ACNE", "BLACKHEADS"]);
      return question;
    });

  ctx.surveyQuestionId = created.id;

  await test.step("GET /admin/survey-questions/:id", async () => {
    const detail = await ctx.admin.get<AdminSurveyQuestion>(
      `/admin/survey-questions/${created.id}`,
    );
    expect(detail.code).toBe(code);
  });

  await test.step("PATCH updates text and displayOrder", async () => {
    const updated = await ctx.admin.patch<AdminSurveyQuestion>(
      `/admin/survey-questions/${created.id}`,
      { text: "QA concern updated", displayOrder: 100 },
    );
    expect(updated.text).toBe("QA concern updated");
    expect(updated.displayOrder).toBe(100);
  });

  await test.step("PUT /options replaces the option set", async () => {
    const updated = await ctx.admin.put<AdminSurveyQuestion>(
      `/admin/survey-questions/${created.id}/options`,
      { options: [{ labelCode: "ACNE", displayOrder: 0 }] },
    );
    expect(optionCodes(updated)).toEqual(["ACNE"]);
  });

  await test.step("DELETE soft-deactivates and drops it from the active list", async () => {
    const deactivated = await ctx.admin.del<AdminSurveyQuestion>(
      `/admin/survey-questions/${created.id}`,
    );
    expect(deactivated.isActive).toBe(false);

    const stillReadable = await ctx.admin.get<AdminSurveyQuestion>(
      `/admin/survey-questions/${created.id}`,
    );
    expect(stillReadable.id).toBe(created.id);

    const active = await ctx.admin.get<readonly AdminSurveyQuestion[]>(
      "/admin/survey-questions",
      { activeOnly: true },
    );
    expect(active.map((question) => question.id)).not.toContain(created.id);
  });
}
