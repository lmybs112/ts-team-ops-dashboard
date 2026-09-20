"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_DEMO_ACTOR,
  DEMO_ACTORS,
  type DemoActor,
  type DemoActorId,
} from "../lib/demo-actors";

type AuthActorContextValue = {
  actorId: DemoActorId;
  actor: DemoActor;
  setActorId: (id: DemoActorId) => void;
  actors: readonly DemoActor[];
};

const AuthActorContext = createContext<AuthActorContextValue | null>(null);

export function AuthActorProvider({ children }: { children: ReactNode }) {
  const [actorId, setActorIdState] = useState<DemoActorId>(DEFAULT_DEMO_ACTOR);

  const setActorId = useCallback((id: DemoActorId) => {
    setActorIdState(id);
  }, []);

  const actor = useMemo(
    () => DEMO_ACTORS.find((a) => a.id === actorId) ?? DEMO_ACTORS[0]!,
    [actorId],
  );

  const value = useMemo(
    () => ({
      actorId,
      actor,
      setActorId,
      actors: DEMO_ACTORS,
    }),
    [actorId, actor, setActorId],
  );

  return (
    <AuthActorContext.Provider value={value}>
      {children}
    </AuthActorContext.Provider>
  );
}

export function useAuthActor(): AuthActorContextValue {
  const ctx = useContext(AuthActorContext);
  if (!ctx) {
    throw new Error("useAuthActor must be used within AuthActorProvider");
  }
  return ctx;
}
