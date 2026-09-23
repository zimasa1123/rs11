"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Input, Select, Card, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, EmptyState, StatusBadge } from "@/components/ui";
import { cn, label, formatDate, formatCurrency, priorityColor } from "@/lib/utils";

export function ListPage({
  title, subtitle, columns, rows, total, page, pageSize, totalPages,
  filters, onCreateClick, search,
}: {
  title: string;
  subtitle?: string;
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters?: { name: string; label: string; value: string; options: { value: string; label: string }[] }[];
  onCreateClick?: () => void;
  search?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search || "");

  function buildQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    return `?${params.toString()}`;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildQuery({ search: searchInput, page: "1" }));
  };

  const setFilter = (name: string, value: string) => {
    router.push(buildQuery({ [name]: value, page: "1" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onCreateClick && (
            <Button onClick={onCreateClick}>
              <Plus size={16} /> New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>
          {filters && filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <select
                  key={f.name}
                  value={f.value}
                  onChange={(e) => setFilter(f.name, e.target.value)}
                  className="h-8 px-2.5 border border-slate-300 rounded-md text-sm bg-white"
                >
                  <option value="">{f.label}: All</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <EmptyState
            title="No records found"
            description="Try adjusting your search or filters, or create a new record."
            icon={<Filter size={32} />}
            action={onCreateClick ? <Button onClick={onCreateClick}>Create First Record</Button> : undefined}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => router.push(`${window.location.pathname}/${row.id}`)}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => router.push(buildQuery({ page: String(page - 1) }))}
                >
                  <ChevronLeft size={14} /> Prev
                </Button>
                <span className="px-3 text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => router.push(buildQuery({ page: String(page + 1) }))}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export { StatusBadge };
