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
        "w-full overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-[#FFE600] text-black select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-mono font-black uppercase tracking-wider text-[11px] border-r-2 border-black last:border-r-0 whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-black font-mono">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-zinc-600 font-bold font-mono"
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
                      ? "cursor-pointer hover:bg-[#FFFDF0] active:bg-[#FFE600]/20"
                      : "hover:bg-[#FAF8F5]"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 border-r-2 border-black last:border-r-0 font-medium",
                        col.className
                      )}
                    >
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
