import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Issue, OpsApi } from "@team-hq/api-contract";
import { extractBearer, type Principal } from "./auth.js";

export type AppDeps = {
  api: OpsApi;
  tokens: Map<string, Principal>;
};

function authFromHeader(c: { req: { header: (n: string) => string | undefined } }) {
  const authorization = c.req.header("authorization") ?? null;
  const headers: Record<string, string> = {};
  for (const name of ["x-role", "x-actor", "x-actor-id", "x-user-id"]) {
    const v = c.req.header(name);
    if (v) headers[name] = v;
  }
  return { authorization, headers };
}

function requireKnownBearer(
  tokens: Map<string, Principal>,
  authorization: string | null | undefined,
): boolean {
  const token = extractBearer(authorization);
  return token != null && tokens.has(token);
}

function filterIssues(
  issues: readonly Issue[],
  q: {
    projectSlug?: string;
    assigneeRole?: string;
    status?: string;
    query?: string;
  },
): Issue[] {
  return issues.filter((issue) => {
    if (q.projectSlug && issue.projectSlug !== q.projectSlug) return false;
    if (q.assigneeRole && issue.assigneeRole !== q.assigneeRole) return false;
    if (q.status && issue.status !== q.status) return false;
    if (q.query) {
      const needle = q.query.toLowerCase();
      if (!issue.title.toLowerCase().includes(needle)) return false;
    }
    return true;
  });
}

export function createApp(deps: AppDeps): Hono {
  const app = new Hono();
  app.use("*", cors());

  const mount = (base: string) => {
    app.get(`${base}/health`, (c) => c.json({ status: "ok" }));

    app.get(`${base}/issues`, (c) => {
      const auth = authFromHeader(c);
      if (!requireKnownBearer(deps.tokens, auth.authorization)) {
        return c.json(
          { error: { code: "UNAUTHENTICATED", message: "Missing or invalid bearer" } },
          401,
        );
      }
      const items = filterIssues(deps.api.listIssues(), {
        projectSlug: c.req.query("projectSlug") ?? undefined,
        assigneeRole: c.req.query("assigneeRole") ?? undefined,
        status: c.req.query("status") ?? undefined,
        query: c.req.query("query") ?? undefined,
      });
      return c.json({ items, nextCursor: null });
    });

    app.post(`${base}/issues`, async (c) => {
      const auth = authFromHeader(c);
      const body = await c.req.json();
      const res = deps.api.postIssues(auth, body);
      return c.json(res.body, res.status as 201);
    });

    app.get(`${base}/issues/:issueId`, (c) => {
      const auth = authFromHeader(c);
      if (!requireKnownBearer(deps.tokens, auth.authorization)) {
        return c.json(
          { error: { code: "UNAUTHENTICATED", message: "Missing or invalid bearer" } },
          401,
        );
      }
      const found = deps.api.listIssues().find((i) => i.id === c.req.param("issueId"));
      if (!found) {
        return c.json(
          { error: { code: "ISSUE_NOT_FOUND", message: "Issue not found" } },
          404,
        );
      }
      return c.json(found);
    });

    app.patch(`${base}/issues/:issueId`, async (c) => {
      const auth = authFromHeader(c);
      const body = await c.req.json();
      const res = deps.api.patchIssue(auth, c.req.param("issueId"), body);
      return c.json(res.body, res.status as 200);
    });

    app.delete(`${base}/issues/:issueId`, (c) => {
      const auth = authFromHeader(c);
      const res = deps.api.deleteIssue(auth, c.req.param("issueId"));
      if (res.status === 204) return c.body(null, 204);
      return c.json(res.body, res.status as 401);
    });

    app.post(`${base}/ingest`, async (c) => {
      const auth = authFromHeader(c);
      const body = await c.req.json();
      const res = deps.api.postIngest(auth, body);
      return c.json(res.body, res.status as 201);
    });
  };

  mount("/v1");
  mount("");

  return app;
}
