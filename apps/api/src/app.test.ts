import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { TEST_TOKENS } from "@team-hq/api-contract";
import { buildTokenMap } from "./auth.js";
import { openTaskDb } from "./db/sqlite.js";
import { createPersistedOpsApi } from "./persisted-api.js";
import { createApp } from "./app.js";

describe("Ops HTTP API (SQLite)", () => {
  let dbPath: string;
  let close: (() => void) | undefined;

  beforeEach(() => {
    dbPath = path.join(os.tmpdir(), `ops-api-${Date.now()}-${Math.random()}.sqlite`);
  });

  afterEach(() => {
    close?.();
    for (const p of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
      try {
        fs.unlinkSync(p);
      } catch {
        /* ignore */
      }
    }
  });

  it("health + CRUD + ingest persist across reopen", async () => {
    const db1 = openTaskDb(dbPath);
    const tokens = buildTokenMap({ OPS_ALLOW_TEST_TOKENS: "1" });
    const api1 = createPersistedOpsApi(db1);
    const app1 = createApp({ api: api1, tokens });
    close = () => db1.close();

    const health = await app1.request("/v1/health");
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    const created = await app1.request("/v1/issues", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_TOKENS.mei}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "persist-me",
        projectSlug: "marketing",
        assigneeRole: "frontend",
        status: "todo",
      }),
    });
    expect(created.status).toBe(201);
    const createdBody = (await created.json()) as { id: string };
    expect(createdBody.id).toBeTruthy();

    const ingest = await app1.request("/v1/ingest", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_TOKENS.frontend}`,
        "content-type": "application/json",
        "x-role": "backend",
      },
      body: JSON.stringify({
        title: "bot report",
        projectSlug: "marketing",
        assigneeRole: "frontend",
        status: "done",
        source: "bot_report",
        sourceRef: "agent:frontend:http-1",
      }),
    });
    expect(ingest.status).toBe(201);
    const ingestBody = (await ingest.json()) as {
      issue: { assigneeRole: string };
      idempotentReplay: boolean;
    };
    expect(ingestBody.idempotentReplay).toBe(false);
    expect(ingestBody.issue.assigneeRole).toBe("frontend");

    db1.close();

    const db2 = openTaskDb(dbPath);
    close = () => db2.close();
    const api2 = createPersistedOpsApi(db2);
    const app2 = createApp({ api: api2, tokens });
    const list = await app2.request("/v1/issues", {
      headers: { authorization: `Bearer ${TEST_TOKENS.mei}` },
    });
    expect(list.status).toBe(200);
    const listBody = (await list.json()) as { items: { id: string; title: string }[] };
    expect(listBody.items.some((i) => i.id === createdBody.id)).toBe(true);
    expect(listBody.items.some((i) => i.title === "bot report")).toBe(true);
  });

  it("rejects shared god token mint (FU-H1b)", () => {
    const db = openTaskDb(dbPath);
    close = () => db.close();
    const api = createPersistedOpsApi(db);
    const minted = api.issueSharedGodToken(["frontend", "backend"]);
    expect(minted.rejected).toBe(true);
  });
});
