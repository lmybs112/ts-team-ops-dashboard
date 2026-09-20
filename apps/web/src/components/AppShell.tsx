"use client";

import type { ReactNode } from "react";
import { ActorSelector } from "./ActorSelector";
import { FilterBar } from "./FilterBar";
import { ViewSwitcher } from "./ViewSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳到主要內容
      </a>
      <header className="app-header">
        <div className="brand">
          <strong>Team HQ</strong>
          <span className="muted">Office ∥ Linear</span>
        </div>
        <ViewSwitcher />
        <div className="header-tools">
          <ActorSelector />
          <FilterBar />
        </div>
      </header>
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
