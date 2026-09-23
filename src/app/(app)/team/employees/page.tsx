import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ListPage } from "@/components/list-page";
import { StatusBadge, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const employees = await db.select().from(schema.employees).orderBy(desc(schema.employees.createdAt));
  const columns = [
    { key: "name", label: "Employee", render: (r: any) => (
      <div>
        <div className="font-medium text-slate-900">{r.name}</div>
        <div className="text-xs text-slate-500">{r.employeeCode}</div>
      </div>
    )},
    { key: "department", label: "Department", render: (r: any) => <Badge>{r.department || "—"}</Badge> },
    { key: "role", label: "Role", render: (r: any) => r.role || "—" },
    { key: "email", label: "Email", render: (r: any) => <span className="text-xs">{r.email || "—"}</span> },
    { key: "phone", label: "Phone", render: (r: any) => <span className="text-xs">{r.phone || "—"}</span> },
    { key: "joinDate", label: "Joined", render: (r: any) => <span className="text-xs">{formatDate(r.joinDate)}</span> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
  ];
  return <ListPage title="Employees" subtitle={`${employees.length} team members`} columns={columns} rows={employees as any} total={employees.length} page={1} pageSize={100} totalPages={1} />;
}
