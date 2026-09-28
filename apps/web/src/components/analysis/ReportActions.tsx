import React from "react";
import {
  getExecutiveReportUrl,
  getTechnicalReportUrl,
  getJsonReportUrl,
} from "@/lib/api/analyses";
import { FileText, FileCode2, Download, Printer, ExternalLink } from "lucide-react";

interface ReportActionsProps {
  analysisId: string;
  className?: string;
  variant?: "compact" | "full";
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  analysisId,
  className = "",
  variant = "full",
}) => {
  const execUrl = getExecutiveReportUrl(analysisId);
  const techUrl = getTechnicalReportUrl(analysisId);
  const jsonUrl = getJsonReportUrl(analysisId);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <a
          href={execUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-mono font-black"
        >
          <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Executive</span>
          <ExternalLink className="w-3 h-3 stroke-[2.5]" />
        </a>

        <a
          href={techUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-mono font-black"
        >
          <FileCode2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Technical</span>
          <ExternalLink className="w-3 h-3 stroke-[2.5]" />
        </a>

        <a
          href={jsonUrl}
          download={`abhedyax_analysis_${analysisId}.json`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF8F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-mono font-black"
          title="Download Canonical JSON"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">JSON</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-5 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-black gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black">
            Automated Security Reports
          </h3>
          <p className="text-xs text-zinc-700 font-medium mt-0.5">
            Self-contained HTML reports with embedded print CSS for browser-native PDF export
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-black font-mono font-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Print / PDF Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Executive Report Card */}
        <a
          href={execUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-[#FFE600] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] text-black">
                <FileText className="w-4 h-4 stroke-[2.5]" />
              </span>
              <ExternalLink className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
            <div className="font-black text-sm text-black group-hover:underline">
              Executive Assessment
            </div>
            <p className="text-xs text-zinc-700 mt-1 leading-relaxed font-medium">
              High-level posture scorecard, key findings summary, AI traffic classification, and strategic remediation roadmap for leadership.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t-2 border-black text-xs font-mono text-black font-black">
            Open Interactive Report →
          </div>
        </a>

        {/* Technical Report Card */}
        <a
          href={techUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-[#38BDF8] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] text-black">
                <FileCode2 className="w-4 h-4 stroke-[2.5]" />
              </span>
              <ExternalLink className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
            <div className="font-black text-sm text-black group-hover:underline">
              Technical Audit Log
            </div>
            <p className="text-xs text-zinc-700 mt-1 leading-relaxed font-medium">
              Deep cryptographic proposals, 28 flow metadata features, mathematical score deduction table, and ground-truth validation matrix.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t-2 border-black text-xs font-mono text-black font-black">
            Open Interactive Report →
          </div>
        </a>

        {/* JSON Export Card */}
        <a
          href={jsonUrl}
          download={`abhedyax_analysis_${analysisId}.json`}
          className="group flex flex-col justify-between p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-[#4ADE80] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] text-black">
                <Download className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="text-[10px] font-mono font-black text-black uppercase bg-[#FFE600] px-1 border border-black">JSON</span>
            </div>
            <div className="font-black text-sm text-black group-hover:underline">
              Canonical JSON Export
            </div>
            <p className="text-xs text-zinc-700 mt-1 leading-relaxed font-medium">
              Complete machine-readable AnalysisResult object for SIEM/SOAR ingestion, programmatic pipelines, and offline archiving.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t-2 border-black text-xs font-mono text-black font-black">
            Download JSON File ↓
          </div>
        </a>
      </div>
    </div>
  );
};
