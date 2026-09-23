import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listLeads } from "@/lib/data";
import { LeadsPageClient } from "./leads-client";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; ownerId?: string; businessLineId?: string; country?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const result = await listLeads({
    page,
    pageSize: 20,
    search: sp.search,
    status: sp.status,
    ownerId: sp.ownerId,
    businessLineId: sp.businessLineId,
    country: sp.country,
  });

  const [owners, businessLines, companies, contacts, products, sources, campaigns, branches] = await Promise.all([
    db.select().from(schema.profiles),
    db.select().from(schema.businessLines),
    db.select().from(schema.companies).limit(200),
    db.select().from(schema.contacts).limit(200),
    db.select().from(schema.products).limit(200),
    db.select().from(schema.leadSources),
    db.select().from(schema.campaigns),
    db.select().from(schema.branches),
  ]);

  return (
    <LeadsPageClient
      result={result}
      searchParams={sp}
      referenceData={{ owners, businessLines, companies, contacts, products, sources, campaigns, branches }}
    />
  );
}
