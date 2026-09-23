import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listProducts } from "@/lib/data";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; businessLineId?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const result = await listProducts({ page: parseInt(sp.page || "1"), pageSize: 20, search: sp.search, businessLineId: sp.businessLineId });
  const businessLines = await db.select().from(schema.businessLines);
  return <ProductsClient result={result} searchParams={sp} businessLines={businessLines} />;
}
