import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listQuotations } from "@/lib/data";
import { QuotationsClient } from "./quotations-client";

export const dynamic = "force-dynamic";

export default async function QuotationsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const result = await listQuotations({ page: parseInt(sp.page || "1"), pageSize: 20, search: sp.search, status: sp.status });
  const companies = await db.select().from(schema.companies).limit(200);
  const contacts = await db.select().from(schema.contacts).limit(200);
  return <QuotationsClient result={result} searchParams={sp} companies={companies} contacts={contacts} />;
}
