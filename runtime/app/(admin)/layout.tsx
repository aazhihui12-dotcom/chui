import type { ReactNode } from "react";
export const metadata = {
  title: "APOWER TECH 管理后台",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
