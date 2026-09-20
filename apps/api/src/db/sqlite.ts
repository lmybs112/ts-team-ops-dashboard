import Database from "better-sqlite3";
import type { Issue } from "@team-hq/api-contract";
import fs from "node:fs";
import path from "node:path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  assignee_role TEXT NOT NULL,
  status TEXT NOT NULL,
  blocked_reason TEXT,
  source TEXT NOT NULL,
  source_ref TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_issues_idempotency
  ON issues(source, source_ref)
  WHERE source_ref IS NOT NULL;
`;

function rowToIssue(row: Record<string, unknown>): Issue {
  return {
    id: String(row.id),
    title: String(row.title),
    projectSlug: row.project_slug as Issue["projectSlug"],
    assigneeRole: row.assignee_role as Issue["assigneeRole"],
    status: row.status as Issue["status"],
    blockedReason: (row.blocked_reason as string | null) ?? null,
    source: row.source as Issue["source"],
    sourceRef: (row.source_ref as string | null) ?? null,
    updatedAt: String(row.updated_at),
    updatedBy: String(row.updated_by),
  };
}

export type TaskDb = {
  path: string;
  loadAll: () => Issue[];
  replaceAll: (issues: Issue[]) => void;
  close: () => void;
};

export function openTaskDb(dbPath: string): TaskDb {
  const resolved = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new Database(resolved);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  return {
    path: resolved,
    loadAll() {
      const rows = db.prepare("SELECT * FROM issues ORDER BY updated_at ASC").all() as Record<
        string,
        unknown
      >[];
      return rows.map(rowToIssue);
    },
    replaceAll(issues) {
      const tx = db.transaction((items: Issue[]) => {
        db.prepare("DELETE FROM issues").run();
        const insert = db.prepare(`
          INSERT INTO issues (
            id, title, project_slug, assignee_role, status, blocked_reason,
            source, source_ref, updated_at, updated_by
          ) VALUES (
            @id, @title, @projectSlug, @assigneeRole, @status, @blockedReason,
            @source, @sourceRef, @updatedAt, @updatedBy
          )
        `);
        for (const issue of items) {
          insert.run({
            id: issue.id,
            title: issue.title,
            projectSlug: issue.projectSlug,
            assigneeRole: issue.assigneeRole,
            status: issue.status,
            blockedReason: issue.blockedReason,
            source: issue.source,
            sourceRef: issue.sourceRef,
            updatedAt: issue.updatedAt,
            updatedBy: issue.updatedBy,
          });
        }
      });
      tx(issues);
    },
    close() {
      db.close();
    },
  };
}
