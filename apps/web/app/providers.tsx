"use client";

import type { ReactNode } from "react";
import { AuthActorProvider } from "../src/auth/AuthActorProvider";
import { FilterProvider } from "../src/filters/FilterProvider";
import { AppShell } from "../src/components/AppShell";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthActorProvider>
      <FilterProvider>
        <AppShell>{children}</AppShell>
      </FilterProvider>
    </AuthActorProvider>
  );
}
