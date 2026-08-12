import { expect, test } from "@playwright/test";
import type { AdminSuiteContext } from "../helpers/ctx";
import { need } from "../helpers/ctx";
import { createCustomer } from "../helpers/fixtures";
import type {
  Paginated,
  SupportMessageResponse,
  SupportSessionResponse,
} from "../helpers/types";

/** TC-ADM-11 — Admin picks an unassigned ticket off the shared queue, replies and closes it. */
export async function runTcAdm11(ctx: AdminSuiteContext): Promise<void> {
  const adminUserId = need(ctx.adminUserId, "adminUserId from TC-ADM-01");

  // A dedicated customer keeps this case independent of the wallet/survey customer, which
  // may already have an open session from an earlier run.
  const { client: supportCustomer } = await createCustomer(
    ctx.runId,
    "support",
  );

  const session =
    await test.step("customer opens a session and sends a message", async () => {
      const created = await supportCustomer.post<SupportSessionResponse>(
        "/support/sessions",
        { subject: "QA admin support case" },
        [200, 201],
      );
      expect(created.status).toBe("OPEN");

      await supportCustomer.post<SupportMessageResponse>(
        `/support/sessions/${created.id}/messages`,
        { content: "Chao shop, don hang cua minh bi loi." },
        [200, 201],
      );
      return created;
    });

  ctx.supportSessionId = session.id;

  await test.step("the session shows up in the unassigned OPEN queue", async () => {
    const queue = await ctx.admin.get<Paginated<SupportSessionResponse>>(
      "/support/sessions",
      { status: "OPEN", assigned: "unassigned", limit: 100 },
    );
    expect(queue.items.map((item) => item.id)).toContain(session.id);
  });

  await test.step("POST claim assigns it to the admin", async () => {
    const claimed = await ctx.admin.post<SupportSessionResponse>(
      `/support/sessions/${session.id}/claim`,
    );
    expect(claimed.status).toBe("ACTIVE");
    expect(claimed.assignedStaffUserId).toBe(adminUserId);
  });

  const lastSeq = await test.step("admin replies on the session", async () => {
    const reply = await ctx.admin.post<SupportMessageResponse>(
      `/support/sessions/${session.id}/messages`,
      { content: "Chao ban, minh dang kiem tra don hang giup ban nhe." },
      [200, 201],
    );
    expect(reply.senderRole).toBe("STAFF");
    return reply.seq;
  });

  await test.step("POST read marks the thread as read", async () => {
    await ctx.admin.post(`/support/sessions/${session.id}/read`, {
      lastReadSeq: lastSeq,
    });
  });

  await test.step("POST close ends the session", async () => {
    const closed = await ctx.admin.post<SupportSessionResponse>(
      `/support/sessions/${session.id}/close`,
      { reason: "Issue resolved" },
    );
    expect(closed.status).toBe("CLOSED");
  });
}
