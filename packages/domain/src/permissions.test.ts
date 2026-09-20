import { describe, expect, it } from "vitest";
import { authorize, type Actor } from "./permissions.js";

const mei: Actor = { actorId: "mei", kind: "human" };
const cto: Actor = { actorId: "cto", kind: "human", roleId: "cto" };
const frontendBot: Actor = {
  actorId: "frontend",
  kind: "bot",
  roleId: "frontend",
};
const backendBot: Actor = {
  actorId: "backend",
  kind: "bot",
  roleId: "backend",
};

describe("PRD §6.3 Permissions (mei/cto full; bot own assigneeRole only)", () => {
  it("allows mei full CRUD / reassign / ingest", () => {
    for (const action of ["create", "update", "delete", "reassign", "ingest"] as const) {
      expect(authorize(mei, action, { assigneeRole: "frontend" }).allowed).toBe(true);
    }
  });

  it("allows cto full CRUD / reassign / ingest", () => {
    for (const action of ["create", "update", "delete", "reassign", "ingest"] as const) {
      expect(authorize(cto, action, { assigneeRole: "backend" }).allowed).toBe(true);
    }
  });

  it("allows bot to update own assigneeRole issues", () => {
    const decision = authorize(frontendBot, "update", { assigneeRole: "frontend" });
    expect(decision.allowed).toBe(true);
  });

  it("rejects bot updating another role's issue", () => {
    const decision = authorize(frontendBot, "update", { assigneeRole: "backend" });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.code).toBe("FORBIDDEN_ASSIGNEE");
    }
  });

  it("rejects bot create / delete / reassign", () => {
    expect(authorize(frontendBot, "create").allowed).toBe(false);
    expect(authorize(frontendBot, "delete").allowed).toBe(false);
    const reassign = authorize(frontendBot, "reassign", { assigneeRole: "frontend" });
    expect(reassign.allowed).toBe(false);
    if (!reassign.allowed) {
      expect(reassign.code).toBe("FORBIDDEN_OPERATION");
    }
  });

  it("rejects unauthenticated writes", () => {
    const decision = authorize(null, "update", { assigneeRole: "frontend" });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.code).toBe("UNAUTHENTICATED");
    }
  });

  it("backend bot cannot update frontend issues", () => {
    const decision = authorize(backendBot, "update", { assigneeRole: "frontend" });
    expect(decision.allowed).toBe(false);
  });
});
