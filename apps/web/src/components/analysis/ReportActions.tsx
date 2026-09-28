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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Executive</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <a
          href={techUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Technical</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <a
          href={jsonUrl}
          download={`abhedyax_analysis_${analysisId}.json`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/80 hover:text-white hover:bg-slate-800 transition-colors"
          title="Download Canonical JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">JSON</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`bg-[#0b1329] border border-slate-800 rounded-lg p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Automated Security Reports</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Self-contained HTML reports with embedded print CSS for browser-native PDF export
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Printer className="w-3.5 h-3.5 text-indigo-400" />
          <span>Print / PDF Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Executive Report Card */}
        <a
          href={execUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-4 rounded-lg bg-[#070d1e] border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-950/10 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                <FileText className="w-4 h-4" />
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
              Executive Assessment
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              High-level posture scorecard, key findings summary, AI traffic classification, and strategic remediation roadmap for leadership.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-400 font-medium">
            Open Interactive Report →
          </div>
        </a>

        {/* Technical Report Card */}
        <a
          href={techUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-4 rounded-lg bg-[#070d1e] border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/10 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                <FileCode2 className="w-4 h-4" />
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
              Technical Audit Log
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Deep cryptographic proposals, 28 flow metadata features, mathematical score deduction table, and ground-truth validation matrix.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 font-medium">
            Open Interactive Report →
          </div>
        </a>

        {/* JSON Export Card */}
        <a
          href={jsonUrl}
          download={`abhedyax_analysis_${analysisId}.json`}
          className="group flex flex-col justify-between p-4 rounded-lg bg-[#070d1e] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded bg-slate-800 text-slate-300">
                <Download className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">JSON</span>
            </div>
            <div className="font-semibold text-sm text-white group-hover:text-slate-200 transition-colors">
              Canonical JSON Export
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete machine-readable AnalysisResult object for SIEM/SOAR ingestion, programmatic pipelines, and offline archiving.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 font-medium">
            Download JSON File ↓
          </div>
        </a>
      </div>
    </div>
  );
};
