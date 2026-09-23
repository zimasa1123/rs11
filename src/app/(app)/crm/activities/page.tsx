import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ListPage } from "@/components/list-page";
import { StatusBadge } from "@/components/ui";
import { formatDateTime, label } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const activities = await db
    .select({
      id: schema.activities.id, type: schema.activities.type, subject: schema.activities.subject,
      description: schema.activities.description, occurredAt: schema.activities.occurredAt,
      ownerName: schema.profiles.fullName, companyName: schema.companies.name,
      contactName: schema.contacts.firstName, leadId: schema.activities.leadId,
      opportunityId: schema.activities.opportunityId,
    })
    .from(schema.activities)
    .leftJoin(schema.profiles, eq(schema.activities.ownerId, schema.profiles.id))
    .leftJoin(schema.companies, eq(schema.activities.companyId, schema.companies.id))
    .leftJoin(schema.contacts, eq(schema.activities.contactId, schema.contacts.id))
    .orderBy(desc(schema.activities.occurredAt))
    .limit(100);

  const columns = [
    { key: "type", label: "Type", render: (r: any) => <StatusBadge status={r.type || ""} /> },
    {
      key: "subject", label: "Activity",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.subject}</div>
          {r.description && <div className="text-xs text-slate-500 truncate max-w-sm">{r.description}</div>}
        </div>
      ),
    },
    { key: "companyName", label: "Company", render: (r: any) => r.companyName || "—" },
    { key: "ownerName", label: "Owner", render: (r: any) => r.ownerName || "—" },
    { key: "occurredAt", label: "When", render: (r: any) => <span className="text-xs">{formatDateTime(r.occurredAt)}</span> },
  ];

  return (
    <ListPage
      title="Activities"
      subtitle={`${activities.length} recent activities across all records`}
      columns={columns}
      rows={activities}
      total={activities.length}
      page={1}
      pageSize={100}
      totalPages={1}
    />
  );
}
