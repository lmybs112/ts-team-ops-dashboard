import { TEST_TOKENS, type AuthContext } from "@team-hq/api-contract";

/** Demo / 驗收角色 — TEST_TOKENS are opaque test fixtures, not secrets. */
export type DemoActorId = keyof typeof TEST_TOKENS;

export type DemoActor = {
  id: DemoActorId;
  label: string;
  kind: "human" | "bot";
  hint: string;
};

export const DEMO_ACTORS: readonly DemoActor[] = [
  {
    id: "mei",
    label: "mei",
    kind: "human",
    hint: "全權（人類）",
  },
  {
    id: "cto",
    label: "CTO",
    kind: "human",
    hint: "全權（人類 token）",
  },
  {
    id: "frontend",
    label: "Frontend bot",
    kind: "bot",
    hint: "僅 assignee=frontend",
  },
  {
    id: "backend",
    label: "Backend bot",
    kind: "bot",
    hint: "僅 assignee=backend",
  },
  {
    id: "qa",
    label: "QA bot",
    kind: "bot",
    hint: "僅 assignee=qa",
  },
] as const;

export const DEFAULT_DEMO_ACTOR: DemoActorId = "mei";

export function authForActor(actorId: DemoActorId): AuthContext {
  return { authorization: `Bearer ${TEST_TOKENS[actorId]}` };
}

export function isDemoActorId(value: string): value is DemoActorId {
  return Object.prototype.hasOwnProperty.call(TEST_TOKENS, value);
}
