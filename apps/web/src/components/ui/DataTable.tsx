import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-[#252B35] bg-[#0F1218]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#252B35] bg-[#141820]/70 text-[#9AA4B2] select-none font-medium">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap text-[11px]", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252B35]/60 text-[#F4F7FA]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[#687384]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={(e) => {
                    if (!onRowClick) return;
                    const target = e.target as HTMLElement | null;
                    if (target?.closest("a, button, input, select, textarea, [role='button']")) {
                      return;
                    }
                    onRowClick(row);
                  }}
                  className={cn(
                    "transition-colors duration-100",
                    onRowClick
                      ? "cursor-pointer hover:bg-[#141820]/80 active:bg-[#141820]"
                      : "hover:bg-[#141820]/50"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5", col.className)}>
                      {col.render
                        ? col.render(row, idx)
                        : (row as Record<string, unknown>)[col.key]?.toString() ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
