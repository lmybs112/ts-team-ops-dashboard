"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useFilter } from "../filters/FilterProvider";

export function ViewSwitcher() {
  const pathname = usePathname();
  const { view, switchView } = useFilter();

  const active: "office" | "linear" =
    pathname?.startsWith("/linear") ? "linear" : "office";

  useEffect(() => {
    if (active !== view && (active === "office" || active === "linear")) {
      switchView(active);
    }
  }, [active, view, switchView]);

  return (
    <nav className="view-switcher" aria-label="視圖切換">
      <Link
        href="/office"
        className={active === "office" ? "seg active" : "seg"}
        aria-current={active === "office" ? "page" : undefined}
        onClick={() => switchView("office")}
      >
        View Office
      </Link>
      <Link
        href="/linear"
        className={active === "linear" ? "seg active" : "seg"}
        aria-current={active === "linear" ? "page" : undefined}
        onClick={() => switchView("linear")}
      >
        View Linear
      </Link>
    </nav>
  );
}
