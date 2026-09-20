import {
  createOpsApi,
  type Issue,
  type OpsApi,
  type PatchIssueBody,
  type ApiResult,
} from "@team-hq/api-contract";
import { authForActor, type DemoActorId } from "./demo-actors.js";
import { seedDemoIssues } from "./seed.js";

let singleton: OpsApi | null = null;
let version = 0;
const listeners = new Set<() => void>();

function bump(): void {
  version += 1;
  for (const listener of listeners) listener();
}

/** In-memory Ops API for the web shell (mock; no direct DB). */
export function getOpsApi(): OpsApi {
  if (!singleton) {
    singleton = createOpsApi();
    seedDemoIssues(singleton);
  }
  return singleton;
}

export function listAllIssues(): Issue[] {
  return [...getOpsApi().listIssues()];
}

/** Alias used by reactive subscribers / tests. */
export function getIssuesSnapshot(): Issue[] {
  return listAllIssues();
}

export function getIssuesVersion(): number {
  return version;
}

export function subscribeIssues(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Patch via real createOpsApi + Bearer from 驗收角色.
 * On success, notifies issue subscribers so Linear/Office refresh.
 */
export function patchIssueForActor(
  actorId: DemoActorId,
  id: string,
  body: PatchIssueBody,
): ApiResult<Issue> {
  const result = getOpsApi().patchIssue(authForActor(actorId), id, body);
  if (result.ok) bump();
  return result;
}

/** Test helper — fresh seeded store between cases. */
export function resetOpsClientForTests(): void {
  singleton = createOpsApi();
  seedDemoIssues(singleton);
  bump();
}
