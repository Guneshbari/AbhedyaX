import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "AbhedyaX — IPsec Security Intelligence",
  description:
    "AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework (SIH 2026 / NTRO)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090B10] text-[#F4F7FA] antialiased selection:bg-blue-500/30 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
