import { test } from "@playwright/test";
import { runTcAdm01 } from "./cases/tc-adm-01-profile";
import { runTcAdm02 } from "./cases/tc-adm-02-users-rbac";
import { runTcAdm03 } from "./cases/tc-adm-03-clinics";
import { runTcAdm04 } from "./cases/tc-adm-04-onboard-expert";
import { runTcAdm05 } from "./cases/tc-adm-05-maintain-expert";
import { runTcAdm06 } from "./cases/tc-adm-06-survey-bank";
import {
  restoreComboDiscount,
  runTcAdm07,
} from "./cases/tc-adm-07-combo-discount";
import { runTcAdm08 } from "./cases/tc-adm-08-wallet";
import { runTcAdm09 } from "./cases/tc-adm-09-qa-cheats";
import { runTcAdm10 } from "./cases/tc-adm-10-catalog-stock";
import { runTcAdm11 } from "./cases/tc-adm-11-support";
import { runTcAdm12 } from "./cases/tc-adm-12-handover";
import { runTcAdm13 } from "./cases/tc-adm-13-cancellation";
import { login } from "./helpers/api";
import type { AdminSuiteContext } from "./helpers/ctx";
import { need } from "./helpers/ctx";
import { createCustomer, createPaidOrder, newClient } from "./helpers/fixtures";
import type { CustomerMeResponse, UserResponse } from "./helpers/types";

const ADMIN_USERNAME = process.env.ADMIN_QA_USERNAME ?? "glowscan-admin";
const ADMIN_PASSWORD = process.env.ADMIN_QA_PASSWORD ?? "admin";

/**
 * Admin test plan TC-ADM-01..13, run against the BE contract.
 *
 * The cases run in declaration order on a single worker because the plan is one scenario:
 * TC-04 needs TC-03's clinic and TC-05 needs TC-04's expert.
 *
 * Deliberately NOT `mode: "serial"`: serial skips every later test once one fails, which
 * would hide the status of the remaining cases — and a QA report needs a verdict per case.
 * A case whose prerequisite is missing fails on its own `need(...)` with a readable message.
 */

const ctx: AdminSuiteContext = {
  admin: newClient(),
  anon: newClient(),
  runId: `${Date.now().toString(36)}`,
};

test.describe("Admin API — TC-ADM", () => {
  test.beforeAll(async () => {
    const session = await login(ctx.admin, ADMIN_USERNAME, ADMIN_PASSWORD);
    ctx.admin.setToken(session.accessToken);

    // Playwright restarts the worker after a failed test, which wipes this module's state.
    // Ids that other cases depend on are therefore resolved here, in the hook that re-runs,
    // rather than being left behind by whichever case happened to fetch them first.
    ctx.adminUserId = (await ctx.admin.get<UserResponse>("/users/me")).id;

    const { actor, client } = await createCustomer(ctx.runId, "customer");
    ctx.customer = actor;
    ctx.customerClient = client;

    // TC-ADM-09 cheats an existing survey; a customer with no survey row would 404 there.
    const survey = await client.post<{ readonly id: string }>(
      "/surveys",
      {},
      [200, 201],
    );
    if (!survey.id) {
      throw new Error("Could not start a survey for the QA customer");
    }

    const profile = await client.get<CustomerMeResponse>("/customers/me");
    ctx.customerProfileId = profile.customer.id;
  });

  test.afterAll(async () => {
    // Never leave the demo pricing changed by a QA run.
    await restoreComboDiscount(ctx);
  });

  test("TC-ADM-01 — login and admin profile", async () => {
    await runTcAdm01(ctx);
  });

  test("TC-ADM-02 — users and RBAC", async () => {
    await runTcAdm02(ctx);
  });

  test("TC-ADM-03 — clinic lifecycle", async () => {
    await runTcAdm03(ctx);
  });

  test("TC-ADM-04 — onboard an expert", async () => {
    await runTcAdm04(ctx);
  });

  test("TC-ADM-05 — maintain an expert", async () => {
    await runTcAdm05(ctx);
  });

  test("TC-ADM-06 — survey question bank", async () => {
    await runTcAdm06(ctx);
  });

  test("TC-ADM-07 — survey combo discount", async () => {
    await runTcAdm07(ctx);
  });

  test("TC-ADM-08 — wallet balance and top-up", async () => {
    await runTcAdm08(ctx);
  });

  test("TC-ADM-09 — QA cheats for profile and survey", async () => {
    await runTcAdm09(ctx);
  });

  test("TC-ADM-10 — catalog onboarding and stock import", async () => {
    await runTcAdm10(ctx);
  });

  test("TC-ADM-11 — support chat claim and close", async () => {
    await runTcAdm11(ctx);
  });

  // The order fixtures live inside their own case rather than in beforeAll: a failure while
  // building them must not mark the nine admin-only cases as "did not run".
  test("TC-ADM-12 — handover and delivery simulation", async () => {
    const client = need(ctx.customerClient, "the QA customer client");
    ctx.handoverOrder = await createPaidOrder(ctx, client, 1);
    await runTcAdm12(ctx);
  });

  test("TC-ADM-13 — cancellation, refund and restock", async () => {
    const client = need(ctx.customerClient, "the QA customer client");
    ctx.cancellationOrder = await createPaidOrder(ctx, client, 2);
    await runTcAdm13(ctx);
  });
});
