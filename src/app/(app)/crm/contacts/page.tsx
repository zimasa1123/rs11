import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listContacts } from "@/lib/data";
import { ListPage } from "@/components/list-page";
import { StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const result = await listContacts({ page: parseInt(sp.page || "1"), pageSize: 20, search: sp.search });

  const columns = [
    {
      key: "name", label: "Name",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.firstName} {r.lastName}</div>
          <div className="text-xs text-slate-500">{r.jobTitle || "—"}</div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (r: any) => r.email || "—" },
    { key: "phone", label: "Phone", render: (r: any) => r.phone || "—" },
    { key: "company", label: "Company", render: (r: any) => r.company || "—" },
    { key: "country", label: "Country", render: (r: any) => r.country || "—" },
    {
      key: "isDecisionMaker", label: "Decision Maker",
      render: (r: any) => r.isDecisionMaker ? <StatusBadge status="verified" /> : <span className="text-xs text-slate-500">—</span>,
    },
    { key: "createdAt", label: "Added", render: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <ListPage
      title="Contacts"
      subtitle={`${result.total} total contacts`}
      columns={columns}
      rows={result.rows}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      search={sp.search}
    />
  );
}
