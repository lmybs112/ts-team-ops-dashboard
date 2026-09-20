import { serve } from "@hono/node-server";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokenMap } from "./auth.js";
import { openTaskDb } from "./db/sqlite.js";
import { createPersistedOpsApi } from "./persisted-api.js";
import { createApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.PORT ?? 8787);
const dbPath = path.resolve(
  process.cwd(),
  process.env.OPS_DB_PATH ?? path.join(__dirname, "..", "data", "ops.sqlite"),
);

const tokens = buildTokenMap(process.env);
if (tokens.size === 0) {
  console.error(
    "[ops-api] No tokens configured. Set OPS_ALLOW_TEST_TOKENS=1 (dev) or OPS_TOKENS_JSON.",
  );
  process.exit(1);
}

const taskDb = openTaskDb(dbPath);
const api = createPersistedOpsApi(taskDb);
const app = createApp({ api, tokens });

console.log(`[ops-api] listening on http://127.0.0.1:${port}`);
console.log(`[ops-api] db=${dbPath} tokens=${tokens.size}`);

serve({ fetch: app.fetch, port });
