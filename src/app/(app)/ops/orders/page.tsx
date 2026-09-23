import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ListPage } from "@/components/list-page";
import { StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const rows = await db
    .select({
      id: schema.orders.id, orderNumber: schema.orders.orderNumber,
      status: schema.orders.status, paymentStatus: schema.orders.paymentStatus,
      totalAmount: schema.orders.totalAmount, currency: schema.orders.currency,
      expectedDelivery: schema.orders.expectedDelivery, createdAt: schema.orders.createdAt,
      company: schema.companies.name, owner: schema.profiles.fullName,
    })
    .from(schema.orders)
    .leftJoin(schema.companies, sql`${schema.orders.companyId} = ${schema.companies.id}`)
    .leftJoin(schema.profiles, sql`${schema.orders.ownerId} = ${schema.profiles.id}`)
    .orderBy(desc(schema.orders.createdAt))
    .limit(100);

  const columns = [
    { key: "orderNumber", label: "Order #", render: (r: any) => <div className="font-mono font-medium">{r.orderNumber}</div> },
    { key: "company", label: "Customer", render: (r: any) => r.company || "—" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
    { key: "paymentStatus", label: "Payment", render: (r: any) => <StatusBadge status={r.paymentStatus || ""} /> },
    { key: "totalAmount", label: "Total", render: (r: any) => <span className="font-medium">{formatCurrency(r.totalAmount, r.currency)}</span> },
    { key: "owner", label: "Owner", render: (r: any) => r.owner || "—" },
    { key: "expectedDelivery", label: "Expected", render: (r: any) => <span className="text-xs">{formatDate(r.expectedDelivery)}</span> },
    { key: "createdAt", label: "Created", render: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <ListPage
      title="Orders"
      subtitle={`${rows.length} orders in the system`}
      columns={columns}
      rows={rows as any}
      total={rows.length}
      page={1}
      pageSize={100}
      totalPages={1}
    />
  );
}


