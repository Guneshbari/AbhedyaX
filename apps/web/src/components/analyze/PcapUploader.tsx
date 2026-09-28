"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { cn } from "@/lib/utils";

export interface SelectedPcapFile {
  name: string;
  size: number;
  rawFile?: File;
}

interface PcapUploaderProps {
  selectedFile: SelectedPcapFile | null;
  onSelectFile: (file: SelectedPcapFile | null) => void;
}

export const PcapUploader: React.FC<PcapUploaderProps> = ({
  selectedFile,
  onSelectFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    onSelectFile({
      name: file.name,
      size: file.size,
      rawFile: file,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
            Upload Packet Capture
          </h2>
          <p className="text-xs text-[#9AA4B2]">
            Target capture file containing IPsec exchanges (IKEv1/v2 UDP 500/4500, ESP Proto 50)
          </p>
        </div>
      </div>

      {/* Simulation Mode Notice */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-amber-400">Notice: </span>
          <span className="text-[#9AA4B2]">
            PCAP analysis engine is currently running in <strong>Simulation Mode</strong>. The metadata and filename will be captured by the API contract, and deterministic simulated analysis telemetry will be generated.
          </span>
        </div>
      </div>

      {selectedFile ? (
        /* Selected File Card */
        <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-mono font-semibold text-[#F4F7FA]">
                {selectedFile.name}
              </div>
              <div className="text-xs text-[#687384] font-mono mt-0.5">
                Size: {formatFileSize(selectedFile.size)} • Status: Ready to Analyze
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectFile(null)}
            className="p-1.5 rounded-lg text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820] transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "p-8 sm:p-10 rounded-xl border-2 border-dashed text-center flex flex-col items-center justify-center transition-colors cursor-pointer",
            isDragging
              ? "border-blue-500 bg-blue-500/5"
              : "border-[#252B35] bg-[#0F1218]/50 hover:border-[#3B4252] hover:bg-[#0F1218]"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pcap,.pcapng,.cap"
            className="hidden"
          />

          <div className="p-3.5 rounded-full bg-[#141820] border border-[#252B35] text-blue-400 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-[#F4F7FA] mb-1">
            Drag and drop capture file, or click to browse
          </h3>
          <p className="text-xs text-[#687384] max-w-sm mb-4">
            Supports standard Wireshark/tcpdump .pcap and .pcapng files up to 250MB
          </p>

          <PrimaryButton variant="secondary" size="sm" type="button">
            Select Capture File
          </PrimaryButton>
        </div>
      )}

      {/* Benchmark Captures Selection */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[#687384] uppercase">
            Or analyze a pre-configured benchmark capture from datasets:
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              name: "modern-ikev2-aes256gcm.pcap",
              label: "Modern IKEv2 Suite",
              desc: "AES-256-GCM • DH Group 19 (ECP-256) • ESP",
              size: 1024,
            },
            {
              name: "legacy-ikev1-3des-sha1.pcap",
              label: "Legacy IKEv1 Baseline",
              desc: "3DES-CBC • HMAC-SHA1 • DH Group 2 • 24h SA",
              size: 800,
            },
            {
              name: "natt-esp-traffic.pcap",
              label: "NAT-T Encapsulated ESP",
              desc: "UDP Port 4500 • Non-zero SPI • Traversal",
              size: 512,
            },
            {
              name: "weak-ikev2-des-md5.pcap",
              label: "Weak IKEv2 Cryptanalysis",
              desc: "Single DES • HMAC-MD5-96 • DH Group 1",
              size: 720,
            },
          ].map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => onSelectFile({ name: sample.name, size: sample.size })}
              className={cn(
                "p-3 rounded-lg border text-left transition-colors flex flex-col justify-between",
                selectedFile?.name === sample.name
                  ? "border-blue-500/50 bg-blue-500/10 text-[#F4F7FA]"
                  : "border-[#252B35] bg-[#141820]/60 hover:border-[#3B4252] hover:bg-[#141820] text-[#9AA4B2]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#F4F7FA]">
                  {sample.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#252B35] text-[#9AA4B2]">
                  {sample.name.split(".")[0]}
                </span>
              </div>
              <p className="text-[11px] text-[#687384] font-mono">{sample.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
