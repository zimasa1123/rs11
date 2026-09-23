import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ListPage } from "@/components/list-page";
import { StatusBadge, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const rows = await db.select().from(schema.shipments).orderBy(desc(schema.shipments.createdAt)).limit(100);

  const columns = [
    { key: "shipmentNumber", label: "Shipment #", render: (r: any) => <div className="font-mono font-medium">{r.shipmentNumber}</div> },
    { key: "origin", label: "Origin", render: (r: any) => r.origin || "—" },
    { key: "destination", label: "Destination", render: (r: any) => r.destination || "—" },
    { key: "carrier", label: "Carrier", render: (r: any) => r.carrier || "—" },
    { key: "container", label: "Container", render: (r: any) => <span className="font-mono text-xs">{r.container || "—"}</span> },
    { key: "etd", label: "ETD", render: (r: any) => <span className="text-xs">{formatDate(r.etd)}</span> },
    { key: "eta", label: "ETA", render: (r: any) => <span className="text-xs">{formatDate(r.eta)}</span> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
  ];

  return (
    <ListPage
      title="Shipments"
      subtitle={`${rows.length} shipments tracked • Internal status only`}
      columns={columns}
      rows={rows as any}
      total={rows.length}
      page={1}
      pageSize={100}
      totalPages={1}
    />
  );
}
