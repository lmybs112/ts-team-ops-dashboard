"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Issue } from "@team-hq/api-contract";
import {
  getIssuesSnapshot,
  getIssuesVersion,
  subscribeIssues,
} from "../lib/ops-client";

/** Reactive issue list — refreshes after successful OpsApi writes. */
export function useIssues(): Issue[] {
  const version = useSyncExternalStore(
    subscribeIssues,
    getIssuesVersion,
    getIssuesVersion,
  );
  return useMemo(() => getIssuesSnapshot(), [version]);
}
