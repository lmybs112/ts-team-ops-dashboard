/**
 * P1–P20 contract cases from docs/api/permissions-and-errors.md §4.
 * Intentionally RED against createOpsApi() stubs until real impl exists.
 *
 * Includes: S-H1 (P10,P14,P15), S-H2 (P16–P18), FU-H1b (P19), FU-H2a (P20).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createOpsApi, TEST_TOKENS, type Issue, type OpsApi } from "./index.js";

const auth = (token?: string | null, headers?: Record<string, string>) => ({
  authorization: token ? `Bearer ${token}` : token === null ? null : undefined,
  headers,
});

const seedFrontendIssue = (api: OpsApi, overrides: Partial<Issue> = {}): Issue => {
  const issue: Issue = {
    id: "iss_frontend_1",
    title: "商品卡 hover",
    projectSlug: "marketing",
    assigneeRole: "frontend",
    status: "todo",
    blockedReason: null,
    source: "manual",
    sourceRef: null,
    updatedAt: "2026-09-19T10:00:00+08:00",
    updatedBy: "mei",
    ...overrides,
  };
  api.seedIssue(issue);
  return issue;
};

const seedBackendIssue = (api: OpsApi): Issue => {
  const issue: Issue = {
    id: "iss_backend_1",
    title: "API rate limit",
    projectSlug: "marketing",
    assigneeRole: "backend",
    status: "doing",
    blockedReason: null,
    source: "manual",
    sourceRef: null,
    updatedAt: "2026-09-19T10:00:00+08:00",
    updatedBy: "mei",
  };
  api.seedIssue(issue);
  return issue;
};

const snapshot = (api: OpsApi) => JSON.stringify(api.listIssues());

describe("permissions-and-errors.md §4 P1–P20", () => {
  let api: OpsApi;

  beforeEach(() => {
    api = createOpsApi();
    api.reset();
  });

  it("P1 | mei POST /issues 合法 → 201", () => {
    const res = api.postIssues(auth(TEST_TOKENS.mei), {
      title: "新任務",
      projectSlug: "marketing",
      assigneeRole: "frontend",
      status: "todo",
    });
    expect(res.status).toBe(201);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.body.title).toBe("新任務");
      expect(res.body.assigneeRole).toBe("frontend");
    }
  });

  it("P2 | frontend bot POST /issues → 403 FORBIDDEN_OPERATION", () => {
    const before = snapshot(api);
    const res = api.postIssues(auth(TEST_TOKENS.frontend), {
      title: "bot 不該建立",
      projectSlug: "marketing",
      assigneeRole: "frontend",
      status: "todo",
    });
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_OPERATION");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P3 | frontend bot PATCH 自己的 Issue → blocked + reason → 200", () => {
    seedFrontendIssue(api);
    const res = api.patchIssue(auth(TEST_TOKENS.frontend), "iss_frontend_1", {
      status: "blocked",
      blockedReason: "等設計稿",
    });
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.body.status).toBe("blocked");
      expect(res.body.blockedReason).toBe("等設計稿");
    }
  });

  it("P4 | frontend bot PATCH 自己的 Issue → blocked 無 reason → 400；DB 不變", () => {
    seedFrontendIssue(api);
    const before = snapshot(api);
    const res = api.patchIssue(auth(TEST_TOKENS.frontend), "iss_frontend_1", {
      status: "blocked",
      blockedReason: "",
    });
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("BLOCKED_REASON_REQUIRED");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P5 | frontend bot PATCH backend 的 Issue → 403 FORBIDDEN_ASSIGNEE；DB 不變", () => {
    seedBackendIssue(api);
    const before = snapshot(api);
    const res = api.patchIssue(auth(TEST_TOKENS.frontend), "iss_backend_1", {
      status: "done",
    });
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_ASSIGNEE");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P6 | frontend bot PATCH 自己的 Issue 改 assigneeRole=backend → 403", () => {
    seedFrontendIssue(api);
    const before = snapshot(api);
    const res = api.patchIssue(auth(TEST_TOKENS.frontend), "iss_frontend_1", {
      assigneeRole: "backend",
    });
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_OPERATION");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P7 | ingest 首次（合法）→ 201；idempotentReplay=false", () => {
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "frontend",
      title: "完成商品卡 hover 狀態",
      status: "done",
      source: "bot_report",
      sourceRef: "agent:frontend:task-123",
    });
    expect(res.status).toBe(201);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.body.idempotentReplay).toBe(false);
      expect(res.body.issue.id).toBeTruthy();
    }
  });

  it("P8 | ingest 同 source+sourceRef 重送 → 200；同一 issue.id；idempotentReplay=true", () => {
    const first = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "frontend",
      title: "完成商品卡 hover 狀態",
      status: "done",
      source: "bot_report",
      sourceRef: "agent:frontend:task-idem",
    });
    expect(first.status).toBe(201);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "frontend",
      title: "完成商品卡 hover 狀態",
      status: "done",
      source: "bot_report",
      sourceRef: "agent:frontend:task-idem",
    });
    expect(second.status).toBe(200);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.body.idempotentReplay).toBe(true);
      expect(second.body.issue.id).toBe(first.body.issue.id);
    }
  });

  it("P9 | ingest blocked 無 reason → 400；無列寫入", () => {
    const before = snapshot(api);
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "frontend",
      title: "卡住",
      status: "blocked",
      source: "bot_report",
      sourceRef: "agent:frontend:blocked-no-reason",
      blockedReason: "",
    });
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("BLOCKED_REASON_REQUIRED");
    }
    expect(api.listIssues()).toHaveLength(0);
    expect(snapshot(api)).toBe(before);
  });

  it("P10 | S-H1 ingest assigneeRole ≠ token role → 403 FORBIDDEN_ASSIGNEE；DB 不變", () => {
    const before = snapshot(api);
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "backend",
      title: "偽造指派",
      status: "todo",
      source: "bot_report",
      sourceRef: "agent:frontend:forge-role",
    });
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_ASSIGNEE");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P11 | ingest 非法 projectSlug → 400 INVALID_ENUM", () => {
    const before = snapshot(api);
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      // cast to exercise illegal slug at runtime
      projectSlug: "not-a-project" as unknown as "marketing",
      assigneeRole: "frontend",
      title: "bad slug",
      status: "todo",
      source: "bot_report",
      sourceRef: "agent:frontend:bad-slug",
    });
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("INVALID_ENUM");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P12 | CTO DELETE Issue → 204", () => {
    seedFrontendIssue(api);
    const res = api.deleteIssue(auth(TEST_TOKENS.cto), "iss_frontend_1");
    expect(res.status).toBe(204);
    expect(res.ok).toBe(true);
    expect(api.listIssues().find((i) => i.id === "iss_frontend_1")).toBeUndefined();
  });

  it("P13 | bot DELETE → 403", () => {
    seedFrontendIssue(api);
    const before = snapshot(api);
    const res = api.deleteIssue(auth(TEST_TOKENS.frontend), "iss_frontend_1");
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_OPERATION");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P14 | S-H1 frontend bot token + body assigneeRole=backend ingest → 403；DB 不變", () => {
    const before = snapshot(api);
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      assigneeRole: "backend",
      title: "不可偽造",
      status: "doing",
      source: "bot_report",
      sourceRef: "agent:frontend:sh1-p14",
    });
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_ASSIGNEE");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P15 | S-H1 frontend bot ingest 合法 → 201/200；寫入 assigneeRole=frontend", () => {
    const res = api.postIngest(auth(TEST_TOKENS.frontend), {
      projectSlug: "marketing",
      // omit or match token role — server must write frontend
      title: "合法 ingest",
      status: "doing",
      source: "bot_report",
      sourceRef: "agent:frontend:sh1-p15",
    });
    expect([201, 200]).toContain(res.status);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.body.issue.assigneeRole).toBe("frontend");
    }
  });

  it("P16 | S-H2 無 Authorization 呼叫 POST /issues → 401 UNAUTHENTICATED", () => {
    const before = snapshot(api);
    const res = api.postIssues(auth(undefined), {
      title: "no auth",
      projectSlug: "marketing",
      assigneeRole: "frontend",
      status: "todo",
    });
    expect(res.status).toBe(401);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P17 | S-H2 無 Authorization 呼叫 POST /ingest／PATCH／DELETE → 401", () => {
    seedFrontendIssue(api);
    const before = snapshot(api);

    const ingest = api.postIngest(auth(null), {
      projectSlug: "marketing",
      assigneeRole: "frontend",
      title: "no auth ingest",
      status: "todo",
      source: "bot_report",
      sourceRef: "no-auth",
    });
    expect(ingest.status).toBe(401);

    const patch = api.patchIssue(auth(undefined), "iss_frontend_1", {
      status: "done",
    });
    expect(patch.status).toBe(401);

    const del = api.deleteIssue(auth(null), "iss_frontend_1");
    expect(del.status).toBe(401);

    expect(snapshot(api)).toBe(before);
  });

  it("P18 | S-H2 僅改 UI 假角色、仍用 frontend bot token 打他人任務 → 403", () => {
    seedBackendIssue(api);
    const before = snapshot(api);
    // Simulate UI "switched role to cto" but token still frontend
    const res = api.patchIssue(
      auth(TEST_TOKENS.frontend, { "X-Ui-Role": "cto" }),
      "iss_backend_1",
      { status: "done" },
    );
    expect(res.status).toBe(403);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.code).toBe("FORBIDDEN_ASSIGNEE");
    }
    expect(snapshot(api)).toBe(before);
  });

  it("P19 | FU-H1b 共用神鑰跨 role → 拒絕核發 或 跨 role 寫入 401/403；DB 不變", () => {
    const mint = api.issueSharedGodToken(["frontend", "backend"]);
    // Prefer reject-at-issue; if stub wrongly issues, writes must still fail
    if (mint.rejected) {
      expect(mint.token).toBeUndefined();
      return;
    }

    expect(mint.token).toBeTruthy();
    seedBackendIssue(api);
    const before = snapshot(api);
    const res = api.patchIssue(auth(mint.token), "iss_backend_1", {
      status: "done",
    });
    expect([401, 403]).toContain(res.status);
    expect(snapshot(api)).toBe(before);

    const ingest = api.postIngest(auth(mint.token), {
      projectSlug: "marketing",
      assigneeRole: "backend",
      title: "god key ingest",
      status: "todo",
      source: "bot_report",
      sourceRef: "god-key-cross-role",
    });
    expect([401, 403]).toContain(ingest.status);
    expect(snapshot(api)).toBe(before);
  });

  it("P20 | FU-H2a 無 Bearer（或 frontend token）+ X-Role: cto → 401 或仍 frontend 權限；不得升權；DB 不變", () => {
    const beforeEmpty = snapshot(api);

    // No Bearer + X-Role: cto → must be 401 (not elevated to cto)
    const noBearer = api.postIssues(
      auth(undefined, { "X-Role": "cto", "X-Actor": "mei" }),
      {
        title: "header escalate",
        projectSlug: "marketing",
        assigneeRole: "frontend",
        status: "todo",
      },
    );
    expect([401, 403]).toContain(noBearer.status);
    if (!noBearer.ok) {
      // Must NOT succeed as mei/cto create
      expect(noBearer.status).not.toBe(201);
    }
    expect(snapshot(api)).toBe(beforeEmpty);

    // frontend token + X-Role: cto must NOT become cto (cannot create issues)
    const forged = api.postIssues(
      auth(TEST_TOKENS.frontend, { "X-Role": "cto", "X-Actor-Id": "mei" }),
      {
        title: "still frontend",
        projectSlug: "marketing",
        assigneeRole: "frontend",
        status: "todo",
      },
    );
    // Still frontend permissions → 403 FORBIDDEN_OPERATION (or 401)
    expect([401, 403]).toContain(forged.status);
    expect(forged.status).not.toBe(201);
    expect(snapshot(api)).toBe(beforeEmpty);

    const ingest = api.postIngest(
      auth(TEST_TOKENS.frontend, { "X-Role": "cto" }),
      {
        projectSlug: "marketing",
        assigneeRole: "backend",
        title: "x-role escalate ingest",
        status: "todo",
        source: "bot_report",
        sourceRef: "fu-h2a-p20",
      },
    );
    expect([401, 403]).toContain(ingest.status);
    expect(snapshot(api)).toBe(beforeEmpty);
  });
});
