"use client";

import { User, ArrowDown, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

// ── Column definition ────────────────────────────────────────
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

// ── Props ────────────────────────────────────────────────────
interface TenderTableProps<T extends { id: string }> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectChange?: (ids: Set<string>) => void;
  onRowAction?: (row: T) => void;
  rowActionLabel?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  emptyMessage?: string;
  showMenu?: boolean;
  onMenuClick?: (row: T) => void;
}

export default function TenderTable<T extends { id: string; createdBy?: string; createdByRole?: string }>({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  selectable = true,
  selectedIds = new Set(),
  onSelectChange,
  onRowAction,
  rowActionLabel,
  sortColumn,
  sortDirection = "desc",
  onSort,
  emptyMessage = "No data available. Data will appear once the backend is connected.",
  showMenu = true,
  onMenuClick,
}: TenderTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const toggleAll = () => {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(data.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectChange(next);
  };

  if (loading) {
    return (
      <div className="dash-table-wrap">
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="dash-table-wrap" id="tender-table">
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-100 bg-white">
          {title && (
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <table className="dash-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  className="dash-table-checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.sortable ? "sortable" : ""} ${col.className ?? ""}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {sortColumn === col.key && (
                  <ArrowDown
                    size={12}
                    style={{
                      display: "inline",
                      marginLeft: 4,
                      transform: sortDirection === "asc" ? "rotate(180deg)" : undefined,
                    }}
                  />
                )}
              </th>
            ))}
            {(rowActionLabel || showMenu) && <th style={{ width: 80 }} />}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (rowActionLabel || showMenu ? 1 : 0)}
                style={{ textAlign: "center", padding: "6rem 1rem", color: "var(--te-gray-4)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id}>
                {selectable && (
                  <td>
                    <input
                      type="checkbox"
                      className="dash-table-checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? (
                      col.render(row)
                    ) : col.key === "id" ? (
                      <div className="dash-table-user">
                        <div className="dash-table-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="dash-table-name">
                            {row.createdBy ?? "—"}
                          </div>
                          <div className="dash-table-role">
                            {row.createdByRole ?? ""}
                          </div>
                        </div>
                      </div>
                    ) : (
                      String((row as Record<string, unknown>)[col.key] ?? "—")
                    )}
                  </td>
                ))}
                {(rowActionLabel || showMenu) && (
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem" }}>
                      {rowActionLabel && (
                        <button
                          className="dash-table-action"
                          onClick={() => onRowAction?.(row)}
                        >
                          {rowActionLabel}
                        </button>
                      )}
                      {showMenu && (
                        <button
                          className="dash-table-menu-btn"
                          onClick={() => onMenuClick?.(row)}
                          aria-label="Row menu"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
