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
          <h2 className="text-base font-black tracking-tight text-black">
            Upload Packet Capture
          </h2>
          <p className="text-xs text-zinc-700 font-medium">
            Target capture file containing IPsec exchanges (IKEv1/v2 UDP 500/4500, ESP Proto 50)
          </p>
        </div>
      </div>

      {/* Notice Pill */}
      <div className="p-3.5 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-black stroke-[2.5] shrink-0 mt-0.5" />
        <div className="text-xs text-black">
          <span className="font-black uppercase font-mono mr-1">Notice:</span>
          <span>
            AbhedyaX integrates deep packet dissection via <strong>TShark</strong> alongside deterministic scenario verification for rapid evaluation.
          </span>
        </div>
      </div>

      {selectedFile ? (
        /* Selected File Card */
        <div className="p-5 bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-mono font-black text-black">
                {selectedFile.name}
              </div>
              <div className="text-xs text-black font-mono font-bold mt-0.5">
                Size: {formatFileSize(selectedFile.size)} • Status: Ready to Analyze
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectFile(null)}
            className="p-1.5 bg-white hover:bg-[#FF4B4B] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Remove file"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      ) : (
        /* Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "p-8 sm:p-10 border-2 border-dashed border-black bg-white shadow-[4px_4px_0px_0px_#000] text-center flex flex-col items-center justify-center transition-colors cursor-pointer",
            isDragging ? "bg-[#FFFDF0]" : "hover:bg-[#FAF8F5]"
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

          <div className="p-3.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black mb-3">
            <UploadCloud className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h3 className="text-base font-black text-black mb-1">
            Drag and drop capture file, or click to browse
          </h3>
          <p className="text-xs text-zinc-600 max-w-sm mb-4 font-mono font-bold">
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
          <span className="text-xs font-mono font-bold text-black uppercase">
            Or analyze a pre-configured benchmark capture from datasets:
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                "p-3.5 border-2 border-black text-left transition-all flex flex-col justify-between cursor-pointer",
                selectedFile?.name === sample.name
                  ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-black">
                  {sample.label}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-zinc-100 text-black border border-black">
                  {sample.name.split(".")[0]}
                </span>
              </div>
              <p className="text-[11px] text-zinc-700 font-mono font-medium">{sample.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
