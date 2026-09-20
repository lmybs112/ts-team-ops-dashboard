import { TEST_TOKENS } from "@team-hq/api-contract";

export type Principal =
  | { kind: "human"; actorId: "mei" | "cto" }
  | { kind: "bot"; actorId: string; roleId: string };

/** Opaque token → principal. Never log token values. */
export function buildTokenMap(env: NodeJS.ProcessEnv): Map<string, Principal> {
  const map = new Map<string, Principal>();

  if (env.OPS_ALLOW_TEST_TOKENS === "1" || env.OPS_ALLOW_TEST_TOKENS === "true") {
    map.set(TEST_TOKENS.mei, { kind: "human", actorId: "mei" });
    map.set(TEST_TOKENS.cto, { kind: "human", actorId: "cto" });
    map.set(TEST_TOKENS.frontend, {
      kind: "bot",
      actorId: "frontend",
      roleId: "frontend",
    });
    map.set(TEST_TOKENS.backend, {
      kind: "bot",
      actorId: "backend",
      roleId: "backend",
    });
    map.set(TEST_TOKENS.qa, { kind: "bot", actorId: "qa", roleId: "qa" });
  }

  const raw = env.OPS_TOKENS_JSON?.trim();
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, Principal>;
    for (const [token, principal] of Object.entries(parsed)) {
      if (!token || !principal?.kind) continue;
      map.set(token, principal);
    }
  }

  return map;
}

export function extractBearer(authorization: string | undefined | null): string | null {
  if (authorization == null || authorization === "") return null;
  const m = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  if (!m) return null;
  const token = m[1]!.trim();
  return token.length > 0 ? token : null;
}
