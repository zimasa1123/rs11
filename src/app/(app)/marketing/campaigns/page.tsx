import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { CampaignsClient } from "./campaigns-client";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const campaigns = await db
    .select({
      id: schema.campaigns.id, name: schema.campaigns.name,
      channel: schema.campaigns.channel, country: schema.campaigns.country,
      budget: schema.campaigns.budget, spend: schema.campaigns.spend,
      impressions: schema.campaigns.impressions, clicks: schema.campaigns.clicks,
      startDate: schema.campaigns.startDate, endDate: schema.campaigns.endDate,
      status: schema.campaigns.status, audience: schema.campaigns.audience,
      businessLine: schema.businessLines.name, owner: schema.profiles.fullName,
      leadCount: sql<number>`(SELECT COUNT(*) FROM ${schema.leads} WHERE ${schema.leads.campaignId} = ${schema.campaigns.id})`,
    })
    .from(schema.campaigns)
    .leftJoin(schema.businessLines, eq(schema.campaigns.businessLineId, schema.businessLines.id))
    .leftJoin(schema.profiles, eq(schema.campaigns.ownerId, schema.profiles.id))
    .orderBy(desc(schema.campaigns.createdAt));
  const businessLines = await db.select().from(schema.businessLines);
  return <CampaignsClient campaigns={campaigns as any} businessLines={businessLines} />;
}
