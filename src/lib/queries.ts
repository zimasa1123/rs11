import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql, desc, count, and, lt, isNull, inArray, ne, or } from "drizzle-orm";
import type { SessionUser } from "@/lib/auth";

export async function getDashboardData(user: SessionUser, filters: { days?: number; country?: string } = {}) {
  const days = filters.days || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [
    totalLeads,
    qualifiedLeads,
    openOpps,
    pipelineValue,
    quotations,
    quotationValue,
    wonDeals,
    lostDeals,
    orders,
    shipments,
    openTasks,
    overdueTasks,
  ] = await Promise.all([
    db.select({ count: count() }).from(schema.leads),
    db.select({ count: count() }).from(schema.leads).where(eq(schema.leads.status, "qualified")),
    db.select({ count: count() }).from(schema.opportunities).where(inArray(schema.opportunities.stage, ["new_lead", "contacted", "qualified", "requirement_received", "sourcing", "quotation_preparation", "quotation_sent", "negotiation", "verbal_agreement"])),
    db.select({ total: sql<number>`COALESCE(SUM(estimated_value::numeric), 0)` }).from(schema.opportunities).where(inArray(schema.opportunities.stage, ["new_lead", "contacted", "qualified", "requirement_received", "sourcing", "quotation_preparation", "quotation_sent", "negotiation", "verbal_agreement"])),
    db.select({ count: count() }).from(schema.quotations),
    db.select({ total: sql<number>`COALESCE(SUM(grand_total::numeric), 0)` }).from(schema.quotations),
    db.select({ count: count() }).from(schema.opportunities).where(eq(schema.opportunities.stage, "won")),
    db.select({ count: count() }).from(schema.opportunities).where(eq(schema.opportunities.stage, "lost")),
    db.select({ count: count() }).from(schema.orders),
    db.select({ count: count() }).from(schema.shipments),
    db.select({ count: count() }).from(schema.tasks).where(inArray(schema.tasks.status, ["pending", "in_progress"])),
    db.select({ count: count() }).from(schema.tasks).where(and(inArray(schema.tasks.status, ["pending", "in_progress"]), lt(schema.tasks.dueDate, new Date()))),
  ]);

  // Pipeline by stage
  const pipelineByStage = await db
    .select({
      stage: schema.opportunities.stage,
      count: count(),
      value: sql<number>`COALESCE(SUM(estimated_value::numeric), 0)`,
    })
    .from(schema.opportunities)
    .groupBy(schema.opportunities.stage);

  // Leads by status
  const leadsByStatus = await db
    .select({
      status: schema.leads.status,
      count: count(),
    })
    .from(schema.leads)
    .groupBy(schema.leads.status);

  // Pipeline by country (top 8)
  const pipelineByCountry = await db
    .select({
      country: schema.opportunities.country,
      count: count(),
      value: sql<number>`COALESCE(SUM(estimated_value::numeric), 0)`,
    })
    .from(schema.opportunities)
    .where(or(isNull(schema.opportunities.stage), ne(schema.opportunities.stage, "lost")))
    .groupBy(schema.opportunities.country)
    .orderBy(desc(sql`COALESCE(SUM(estimated_value::numeric), 0)`))
    .limit(8);

  // Pipeline by business line
  const pipelineByBusinessLine = await db
    .select({
      businessLine: schema.businessLines.name,
      count: count(),
      value: sql<number>`COALESCE(SUM(${schema.opportunities.estimatedValue}::numeric), 0)`,
    })
    .from(schema.opportunities)
    .leftJoin(schema.businessLines, eq(schema.opportunities.businessLineId, schema.businessLines.id))
    .where(or(isNull(schema.opportunities.stage), ne(schema.opportunities.stage, "lost")))
    .groupBy(schema.businessLines.name)
    .orderBy(desc(sql`COALESCE(SUM(${schema.opportunities.estimatedValue}::numeric), 0)`))
    .limit(8);

  // Leads by source
  const leadsBySource = await db
    .select({
      source: schema.leadSources.name,
      count: count(),
    })
    .from(schema.leads)
    .leftJoin(schema.leadSources, eq(schema.leads.sourceId, schema.leadSources.id))
    .groupBy(schema.leadSources.name)
    .orderBy(desc(count()))
    .limit(10);

  // Recent activities
  const recentActivities = await db
    .select({
      id: schema.activities.id,
      type: schema.activities.type,
      subject: schema.activities.subject,
      occurredAt: schema.activities.occurredAt,
      ownerName: schema.profiles.fullName,
      companyName: schema.companies.name,
    })
    .from(schema.activities)
    .leftJoin(schema.profiles, eq(schema.activities.ownerId, schema.profiles.id))
    .leftJoin(schema.companies, eq(schema.activities.companyId, schema.companies.id))
    .orderBy(desc(schema.activities.occurredAt))
    .limit(8);

  // Overdue follow-ups
  const overdueFollowUps = await db
    .select({
      id: schema.leads.id,
      companyId: schema.leads.companyId,
      nextFollowUp: schema.leads.nextFollowUp,
      status: schema.leads.status,
      companyName: schema.companies.name,
      ownerName: schema.profiles.fullName,
    })
    .from(schema.leads)
    .leftJoin(schema.companies, eq(schema.leads.companyId, schema.companies.id))
    .leftJoin(schema.profiles, eq(schema.leads.ownerId, schema.profiles.id))
    .where(and(lt(schema.leads.nextFollowUp, new Date()), inArray(schema.leads.status, ["new", "contacted", "qualified", "requirement_received", "sourcing", "quotation_sent", "negotiation"])))
    .orderBy(schema.leads.nextFollowUp)
    .limit(8);

  // Shipment status counts
  const shipmentStatusCounts = await db
    .select({
      status: schema.shipments.status,
      count: count(),
    })
    .from(schema.shipments)
    .groupBy(schema.shipments.status);

  return {
    kpis: {
      totalLeads: totalLeads[0].count,
      qualifiedLeads: qualifiedLeads[0].count,
      openOpportunities: openOpps[0].count,
      pipelineValue: Number(pipelineValue[0].total || 0),
      quotations: quotations[0].count,
      quotationValue: Number(quotationValue[0].total || 0),
      wonDeals: wonDeals[0].count,
      lostDeals: lostDeals[0].count,
      orders: orders[0].count,
      shipments: shipments[0].count,
      openTasks: openTasks[0].count,
      overdueTasks: overdueTasks[0].count,
    },
    pipelineByStage,
    leadsByStatus,
    pipelineByCountry,
    pipelineByBusinessLine,
    leadsBySource,
    recentActivities,
    overdueFollowUps,
    shipmentStatusCounts,
  };
}
