import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { DataProviderProvider } from "@/lib/providers";
import { DemoJourneyProvider } from "@/store/demoJourney";


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
    <html lang="en">
      <body className="bg-[#FAF8F5] text-black antialiased selection:bg-[#FFE600] selection:text-black">
        <QueryProvider>
          <DataProviderProvider>
            <DemoJourneyProvider>
              <AppShell>{children}</AppShell>
            </DemoJourneyProvider>
          </DataProviderProvider>
        </QueryProvider>

      </body>
    </html>
  );
}
