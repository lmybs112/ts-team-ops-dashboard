import type { AssigneeRole, IssueStatus, ProjectSlug } from "@team-hq/api-contract";

export const PROJECTS: ReadonlyArray<{ slug: ProjectSlug | "all"; label: string }> = [
  { slug: "all", label: "全部專案" },
  { slug: "marketing", label: "行銷／智慧選物" },
  { slug: "iframe", label: "iframe 容器" },
  { slug: "carousel", label: "商品輪播" },
  { slug: "try-on", label: "試穿 demo" },
  { slug: "llm-chat", label: "LLM 聊天" },
  { slug: "team-ops", label: "Team Ops" },
];

export const AGENTS: ReadonlyArray<{ id: AssigneeRole | "all"; label: string }> = [
  { id: "all", label: "全部 Agent" },
  { id: "cto", label: "CTO" },
  { id: "pm", label: "PM" },
  { id: "uiux", label: "UI/UX" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "qa", label: "QA" },
  { id: "devops", label: "DevOps" },
];

export const STATUSES: ReadonlyArray<{ id: IssueStatus | "all"; label: string }> = [
  { id: "all", label: "全部狀態" },
  { id: "todo", label: "待處理" },
  { id: "doing", label: "進行中" },
  { id: "blocked", label: "阻塞" },
  { id: "done", label: "完成" },
];

export const STATUS_COLOR: Record<IssueStatus, string> = {
  todo: "#6b7280",
  doing: "#2563eb",
  blocked: "#dc2626",
  done: "#15803d",
};

export const AGENT_ROLES: readonly AssigneeRole[] = [
  "cto",
  "pm",
  "uiux",
  "frontend",
  "backend",
  "qa",
  "devops",
];
