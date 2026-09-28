import React from "react";
import { FileText, Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Technical Audit Reports"
        subtitle="Automated generation of executive summaries and deep-dive technical reports compliant with NIST SP 800-77, RFC 8221, and ANSSI IPsec guidelines."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports" },
        ]}
        actions={
          <PrimaryButton variant="primary" size="sm" icon={FileText}>
            Generate New Report
          </PrimaryButton>
        }
      />

      {/* Available Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Executive Security Summary",
            description: "High-level risk posture, cryptographic grade, and executive action items formatted for CISO and senior leadership review.",
            format: "PDF / HTML",
            badge: "Executive",
          },
          {
            title: "Technical Protocol Audit",
            description: "Complete trace of IKE Phase 1 / Phase 2 proposals, transform attributes, SPI uniqueness, anti-replay state, and CVE mappings.",
            format: "PDF / JSON",
            badge: "Technical",
          },
        ].map((rep) => (
          <div
            key={rep.title}
            className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {rep.badge}
                </span>
                <span className="text-xs text-[#687384] font-mono">{rep.format}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F4F7FA]">{rep.title}</h3>
              <p className="mt-1 text-xs text-[#9AA4B2] leading-relaxed">
                {rep.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#252B35] flex items-center justify-end gap-2">
              <PrimaryButton variant="secondary" size="sm" icon={Download}>
                Export Sample
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>

      <EmptyState
        title="Automated PDF Engine (Phase 5)"
        description="Jinja2 templates paired with headless Chromium rendering produce pixel-perfect, tamper-evident security audit reports."
        icon={Printer}
        actionText="Back to Dashboard"
        actionHref="/"
      />
    </div>
  );
}
