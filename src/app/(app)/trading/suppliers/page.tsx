import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listSuppliers } from "@/lib/data";
import { SuppliersClient } from "./suppliers-client";

export const dynamic = "force-dynamic";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; verificationStatus?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const result = await listSuppliers({ page: parseInt(sp.page || "1"), pageSize: 20, search: sp.search, verificationStatus: sp.verificationStatus });
  return <SuppliersClient result={result} searchParams={sp} />;
}
