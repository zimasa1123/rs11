import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listOpportunities } from "@/lib/data";
import { OpportunitiesClient } from "./opp-client";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; stage?: string; view?: string; ownerId?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const view = sp.view || "list";
  const result = await listOpportunities({ page: parseInt(sp.page || "1"), pageSize: 50, search: sp.search, stage: sp.stage, ownerId: sp.ownerId });
  const [owners, companies, products, businessLines] = await Promise.all([
    db.select().from(schema.profiles),
    db.select().from(schema.companies).limit(200),
    db.select().from(schema.products).limit(200),
    db.select().from(schema.businessLines),
  ]);
  return <OpportunitiesClient result={result} searchParams={sp} view={view} referenceData={{ owners, companies, products, businessLines }} />;
}
