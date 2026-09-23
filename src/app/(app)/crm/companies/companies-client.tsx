"use client";

import { ListPage } from "@/components/list-page";
import { StatusBadge } from "@/components/ui";
import { formatDate, label, COUNTRIES } from "@/lib/utils";

const TYPES = ["customer", "prospect", "importer", "exporter", "distributor", "wholesaler", "retailer", "contractor", "manufacturer", "supplier", "partner"];

export function CompaniesClient({ result, searchParams }: { result: any; searchParams: any }) {
  const columns = [
    {
      key: "name", label: "Company",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.industry || "—"}</div>
        </div>
      ),
    },
    { key: "country", label: "Country", render: (r: any) => r.country || "—" },
    { key: "city", label: "City", render: (r: any) => r.city || "—" },
    { key: "companyType", label: "Type", render: (r: any) => r.companyType ? <StatusBadge status={r.companyType} /> : "—" },
    { key: "owner", label: "Owner", render: (r: any) => r.owner || "Unassigned" },
    { key: "branch", label: "Branch", render: (r: any) => r.branch || "—" },
    { key: "createdAt", label: "Created", render: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
  ];
  return (
    <ListPage
      title="Companies"
      subtitle={`${result.total} total accounts`}
      columns={columns}
      rows={result.rows}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      search={searchParams.search}
      filters={[
        { name: "companyType", label: "Type", value: searchParams.companyType || "", options: TYPES.map((t) => ({ value: t, label: label(t) })) },
        { name: "country", label: "Country", value: searchParams.country || "", options: COUNTRIES.map((c) => ({ value: c, label: c })) },
      ]}
    />
  );
}
