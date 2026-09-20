"use client";

import { isDemoActorId } from "../lib/demo-actors";
import { useAuthActor } from "../auth/AuthActorProvider";

/** 驗收角色 selector — Bearer from TEST_TOKENS (demo fixtures, not secrets). */
export function ActorSelector() {
  const { actorId, actor, setActorId, actors } = useAuthActor();

  return (
    <label className="actor-selector" data-testid="actor-selector">
      <span className="actor-selector-label">驗收角色</span>
      <select
        value={actorId}
        aria-label="驗收角色"
        onChange={(e) => {
          const v = e.target.value;
          if (isDemoActorId(v)) setActorId(v);
        }}
        data-testid="actor-select"
      >
        {actors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}（{a.hint}）
          </option>
        ))}
      </select>
      <span className="muted actor-hint" data-testid="actor-hint">
        {actor.kind === "human" ? "人類全權" : "Bot 僅自己的 Issues"}
      </span>
    </label>
  );
}
