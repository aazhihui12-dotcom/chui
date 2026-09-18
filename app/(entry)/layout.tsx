import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { siteOrigin } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "LBH Appliances",
  description: "LBH Appliances product catalogue.",
  applicationName: "LBH Appliances",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
