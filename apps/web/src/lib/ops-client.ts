import { createOpsApi, type Issue, type OpsApi } from "@team-hq/api-contract";
import { seedDemoIssues } from "./seed.js";

let singleton: OpsApi | null = null;

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
