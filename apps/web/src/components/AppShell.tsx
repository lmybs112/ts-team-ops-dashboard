"use client";

import type { ReactNode } from "react";
import { FilterBar } from "./FilterBar";
import { ViewSwitcher } from "./ViewSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <strong>Team HQ</strong>
          <span className="muted">Office ∥ Linear</span>
        </div>
        <ViewSwitcher />
        <FilterBar />
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
