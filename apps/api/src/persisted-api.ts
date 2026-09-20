import { createOpsApi, type OpsApi } from "@team-hq/api-contract";
import type { TaskDb } from "./db/sqlite.js";

/** OpsApi + SQLite: hydrate on boot, flush after successful mutations. */
export function createPersistedOpsApi(taskDb: TaskDb): OpsApi {
  const api = createOpsApi({ initialIssues: taskDb.loadAll() });

  const persist = () => {
    taskDb.replaceAll([...api.listIssues()]);
  };

  return {
    seedIssue(issue) {
      api.seedIssue(issue);
      persist();
    },
    listIssues: () => api.listIssues(),
    reset() {
      api.reset();
      persist();
    },
    postIssues(auth, body) {
      const res = api.postIssues(auth, body);
      if (res.ok) persist();
      return res;
    },
    patchIssue(auth, id, body) {
      const res = api.patchIssue(auth, id, body);
      if (res.ok) persist();
      return res;
    },
    deleteIssue(auth, id) {
      const res = api.deleteIssue(auth, id);
      if (res.ok) persist();
      return res;
    },
    postIngest(auth, body) {
      const res = api.postIngest(auth, body);
      if (res.ok) persist();
      return res;
    },
    issueSharedGodToken: (roles) => api.issueSharedGodToken(roles),
  };
}
