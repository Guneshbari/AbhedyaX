import React from "react";
import { Search } from "lucide-react";

interface FindingsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: "Severity" | "Confidence" | "Category";
  onSortChange: (sort: "Severity" | "Confidence" | "Category") => void;
}

const SEVERITIES = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
  "Informational",
];

const CATEGORIES = [
  "All",
  "Cryptography",
  "Key Exchange",
  "Authentication",
  "PFS",
  "Replay Protection",
  "Configuration",
  "Metadata Exposure",
  "Protocol",
];

export const FindingsToolbar: React.FC<FindingsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
}) => {
  return (
    <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search findings by ID, title, evidence, or category..."
          className="w-full bg-white border-2 border-black pl-9 pr-3 py-1.5 text-xs text-black font-mono font-medium placeholder-zinc-500 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-shadow"
        />
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-zinc-700 text-[11px] uppercase hidden sm:inline">
            Severity:
          </span>
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="bg-white border-2 border-black px-2.5 py-1.5 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev === "All" ? "All Severities" : sev}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-zinc-700 text-[11px] uppercase hidden sm:inline">
            Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-white border-2 border-black px-2.5 py-1.5 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-zinc-700 text-[11px] uppercase hidden sm:inline">
            Sort:
          </span>
          <select
            value={selectedSort}
            onChange={(e) =>
              onSortChange(e.target.value as "Severity" | "Confidence" | "Category")
            }
            className="bg-white border-2 border-black px-2.5 py-1.5 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="Severity">Sort by Severity</option>
            <option value="Confidence">Sort by Confidence</option>
            <option value="Category">Sort by Category</option>
          </select>
        </div>
      </div>
    </div>
  );
};
