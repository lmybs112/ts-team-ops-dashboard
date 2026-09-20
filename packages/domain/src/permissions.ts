/**
 * Permissions stubs (PRD §6.3).
 * mei / cto: full; bot: only own assigneeRole; unauthorized: reject.
 */

export type ActorKind = "human" | "bot" | "unauthenticated";

export type Actor = {
  actorId: string;
  kind: ActorKind;
  /** For bots: their roleId. mei/cto are full-access humans. */
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

/**
 * Decide whether actor may perform action on a target issue.
 * Stub: always throws.
 */
export function authorize(
  _actor: Actor | null,
  _action: PermissionAction,
  _target?: { assigneeRole?: string },
): PermissionDecision {
  throw new Error("not implemented: authorize (PRD §6.3)");
}
