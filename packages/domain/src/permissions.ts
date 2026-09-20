export type ActorKind = "human" | "bot" | "unauthenticated";

export type Actor = {
  actorId: string;
  kind: ActorKind;
  roleId?: string;
};

export type PermissionAction =
  | "create"
  | "update"
  | "delete"
  | "reassign"
  | "ingest";

export type PermissionDecision =
  | { allowed: true }
  | { allowed: false; code: "UNAUTHENTICATED" | "FORBIDDEN_ASSIGNEE" | "FORBIDDEN_OPERATION" };

function isFullAccess(actor: Actor): boolean {
  return (
    actor.kind === "human" &&
    (actor.actorId === "mei" || actor.actorId === "cto" || actor.roleId === "cto")
  );
}

export function authorize(
  actor: Actor | null,
  action: PermissionAction,
  target?: { assigneeRole?: string },
): PermissionDecision {
  if (actor == null || actor.kind === "unauthenticated") {
    return { allowed: false, code: "UNAUTHENTICATED" };
  }
  if (isFullAccess(actor)) return { allowed: true };
  if (actor.kind !== "bot") {
    return { allowed: false, code: "FORBIDDEN_OPERATION" };
  }
  if (action === "create" || action === "delete" || action === "reassign") {
    return { allowed: false, code: "FORBIDDEN_OPERATION" };
  }
  if (target?.assigneeRole != null && target.assigneeRole !== actor.roleId) {
    return { allowed: false, code: "FORBIDDEN_ASSIGNEE" };
  }
  return { allowed: true };
}
