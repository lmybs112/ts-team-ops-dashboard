import type { ReactNode } from "react";

export const metadata = {
  title: "Team HQ",
  description: "Office ∥ Linear dual-view ops dashboard (placeholder)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
