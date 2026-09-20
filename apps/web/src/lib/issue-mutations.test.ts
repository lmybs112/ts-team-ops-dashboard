/**
 * Finding-002 — Issue patch via OpsApi + visible ApiResult errors (TDD).
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyIssuePatch,
  clientBlockedReasonError,
  formatMutationError,
} from "./issue-mutations.js";
import {
  getIssuesSnapshot,
  resetOpsClientForTests,
  subscribeIssues,
} from "./ops-client.js";

describe("issue-mutations (Finding-002 / S4)", () => {
  beforeEach(() => {
    resetOpsClientForTests();
  });

  it("mei patch success updates the shared issue list", () => {
    const before = getIssuesSnapshot().find((i) => i.id === "demo_2");
    expect(before?.status).toBe("doing");

    const result = applyIssuePatch("mei", "demo_2", { status: "done" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.issue.status).toBe("done");
      expect(result.issue.blockedReason).toBeNull();
    }
    const after = getIssuesSnapshot().find((i) => i.id === "demo_2");
    expect(after?.status).toBe("done");
  });

  it("blocked without reason returns 400 and does not save", () => {
    const before = getIssuesSnapshot().find((i) => i.id === "demo_2");
    expect(before?.status).toBe("doing");

    const result = applyIssuePatch("mei", "demo_2", {
      status: "blocked",
      blockedReason: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.code).toBe("BLOCKED_REASON_REQUIRED");
      expect(result.display).toMatch(/400/);
      expect(result.display).toMatch(/BLOCKED_REASON_REQUIRED/);
    }
    const after = getIssuesSnapshot().find((i) => i.id === "demo_2");
    expect(after?.status).toBe("doing");
    expect(after?.blockedReason).toBeNull();
  });

  it("frontend bot cannot patch another assignee’s issue — 403 visible", () => {
    // demo_3 is assigneeRole: backend
    const before = JSON.stringify(
      getIssuesSnapshot().find((i) => i.id === "demo_3"),
    );

    const result = applyIssuePatch("frontend", "demo_3", { status: "done" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.code).toBe("FORBIDDEN_ASSIGNEE");
      expect(result.display).toContain("403");
      expect(result.display).toContain("FORBIDDEN_ASSIGNEE");
      expect(
        formatMutationError({
          ok: false,
          status: result.status,
          body: {
            error: { code: result.code, message: result.message },
          },
        }),
      ).toBe(result.display);
    }
    expect(
      JSON.stringify(getIssuesSnapshot().find((i) => i.id === "demo_3")),
    ).toBe(before);
  });

  it("mei can patch any assignee’s issue", () => {
    const result = applyIssuePatch("mei", "demo_3", {
      status: "blocked",
      blockedReason: "契約驗收：mei 全權",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.issue.status).toBe("blocked");
      expect(result.issue.blockedReason).toBe("契約驗收：mei 全權");
      expect(result.issue.updatedBy).toBe("mei");
    }
    const after = getIssuesSnapshot().find((i) => i.id === "demo_3");
    expect(after?.status).toBe("blocked");
  });

  it("frontend bot can patch own assignee issue", () => {
    const result = applyIssuePatch("frontend", "demo_2", {
      status: "blocked",
      blockedReason: "等 API",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.issue.assigneeRole).toBe("frontend");
      expect(result.issue.status).toBe("blocked");
    }
  });

  it("notifies issue subscribers on successful patch only", () => {
    let ticks = 0;
    const unsub = subscribeIssues(() => {
      ticks += 1;
    });

    applyIssuePatch("frontend", "demo_3", { status: "done" });
    expect(ticks).toBe(0);

    applyIssuePatch("mei", "demo_3", { status: "done" });
    expect(ticks).toBe(1);

    unsub();
  });
});

describe("clientBlockedReasonError (UI gate aligned with contract)", () => {
  it("rejects empty blockedReason before save", () => {
    const err = clientBlockedReasonError({
      status: "blocked",
      blockedReason: "   ",
    });
    expect(err).not.toBeNull();
    expect(err?.status).toBe(400);
    expect(err?.code).toBe("BLOCKED_REASON_REQUIRED");
  });

  it("allows non-blocked without reason", () => {
    expect(
      clientBlockedReasonError({ status: "doing", blockedReason: "" }),
    ).toBeNull();
  });
});
