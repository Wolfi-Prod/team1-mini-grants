import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  numeric?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty?: ReactNode;
  className?: string;
  dense?: boolean;
  sticky?: boolean;
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  empty,
  className,
  dense,
  sticky,
}: TableProps<T>) {
  const cellPad = dense ? "px-4 py-2" : "px-4 py-3";
  return (
    <div className={cn("relative w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead
          className={cn(
            "bg-[var(--color-bg-subtle)] text-[var(--color-fg)]",
            sticky && "sticky top-0 z-10",
          )}
        >
          <tr className="border-b border-[var(--color-border-muted)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-fg-muted)]",
                  col.numeric && "text-right tabular-nums",
                  col.className,
                )}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-[11px] text-[var(--color-fg-subtle)]"
              >
                {empty ?? "No results"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-muted)]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      "align-top text-[var(--color-fg)]",
                      col.numeric && "text-right tabular-nums",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
