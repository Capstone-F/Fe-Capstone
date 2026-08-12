import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";

/**
 * The cheat endpoint answers with the raw Customer entity graph, so the display name lives
 * on the related user and the age is stored as a derived dateOfBirth.
 */
interface AdminCustomerProfileResponse {
  readonly id: string;
  readonly dateOfBirth: string | null;
  readonly user: { readonly name: string | null } | null;
  readonly allergies: readonly {
    readonly label: { readonly code: string } | null;
  }[];
}

/** SurveyResponseDto identifies answers by questionId and carries resolved label codes. */
interface SurveyAnswer {
  readonly id: string;
  readonly questionId: string;
  readonly labels: readonly { readonly code: string }[];
}

interface SurveyResponse {
  readonly id: string;
  readonly answers: readonly SurveyAnswer[];
}

/** TC-ADM-09 — Overwrite a customer profile and survey answers, forcing a skin-type re-derive. */
export async function runTcAdm09(ctx: AdminSuiteContext): Promise<void> {
  const customerId = need(
    ctx.customerProfileId,
    "the QA customer profile id from suite setup",
  );

  await test.step("PATCH profile replaces name, age and allergies", async () => {
    const updated = await ctx.admin.patch<AdminCustomerProfileResponse>(
      `/admin/customers/${customerId}/profile`,
      { fullName: "Demo QA", age: 28, allergyCodes: ["FRAGRANCE"] },
    );
    expect(updated.user?.name).toBe("Demo QA");

    const birthYear = new Date(
      need(updated.dateOfBirth, "a derived dateOfBirth"),
    ).getFullYear();
    expect(new Date().getFullYear() - birthYear).toBe(28);

    const allergyCodes = updated.allergies.map((entry) => entry.label?.code);
    expect(allergyCodes).toEqual(["FRAGRANCE"]);
  });

  await test.step("PATCH survey replaces the answers", async () => {
    const updated = await ctx.admin.patch<SurveyResponse>(
      `/admin/customers/${customerId}/survey`,
      {
        answers: [
          { questionCode: "PRIMARY_CONCERN", labelCodes: ["ACNE"] },
          { questionCode: "SKIN_GOALS", labelCodes: ["ACNE_TREATMENT"] },
        ],
      },
    );
    expect(updated.id).toBeTruthy();
    expect(updated.answers).toHaveLength(2);

    // The DTO exposes questionId, not the question code, so the answers are identified by
    // the labels the cheat attached to them.
    const labelCodes = updated.answers.flatMap((answer) =>
      answer.labels.map((label) => label.code),
    );
    expect(labelCodes).toContain("ACNE");
    expect(labelCodes).toContain("ACNE_TREATMENT");
  });
}
