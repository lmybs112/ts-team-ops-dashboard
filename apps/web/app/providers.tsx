"use client";

import type { ReactNode } from "react";
import { FilterProvider } from "../src/filters/FilterProvider";
import { AppShell } from "../src/components/AppShell";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FilterProvider>
      <AppShell>{children}</AppShell>
    </FilterProvider>
  );
}
