import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listCompanies } from "@/lib/data";
import { CompaniesClient } from "./companies-client";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; companyType?: string; country?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const result = await listCompanies({
    page: parseInt(sp.page || "1"), pageSize: 20,
    search: sp.search, companyType: sp.companyType, country: sp.country,
  });
  return <CompaniesClient result={result} searchParams={sp} />;
}
