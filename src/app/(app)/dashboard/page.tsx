import { getSessionUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ days?: string; country?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const days = sp.days ? parseInt(sp.days) : 30;
  const data = await getDashboardData(user, { days, country: sp.country });
  return <DashboardClient data={data} initialDays={days} />;
}
