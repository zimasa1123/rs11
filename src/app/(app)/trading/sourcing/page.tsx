import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { SourcingClient } from "./sourcing-client";

export const dynamic = "force-dynamic";

export default async function SourcingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const rows = await db
    .select({
      id: schema.sourcingRequests.id,
      specifications: schema.sourcingRequests.specifications,
      quantity: schema.sourcingRequests.quantity,
      unit: schema.sourcingRequests.unit,
      destination: schema.sourcingRequests.destination,
      targetPrice: schema.sourcingRequests.targetPrice,
      requiredDate: schema.sourcingRequests.requiredDate,
      status: schema.sourcingRequests.status,
      createdAt: schema.sourcingRequests.createdAt,
      product: schema.products.name,
      customer: schema.companies.name,
      owner: schema.profiles.fullName,
      quoteCount: sql<number>`(SELECT COUNT(*) FROM ${schema.supplierQuotes} WHERE ${schema.supplierQuotes.sourcingRequestId} = ${schema.sourcingRequests.id})`,
    })
    .from(schema.sourcingRequests)
    .leftJoin(schema.products, eq(schema.sourcingRequests.productId, schema.products.id))
    .leftJoin(schema.companies, eq(schema.sourcingRequests.customerId, schema.companies.id))
    .leftJoin(schema.profiles, eq(schema.sourcingRequests.ownerId, schema.profiles.id))
    .orderBy(desc(schema.sourcingRequests.createdAt))
    .limit(100);

  const products = await db.select().from(schema.products).limit(200);
  const companies = await db.select().from(schema.companies).limit(200);

  return <SourcingClient rows={rows as any} products={products} companies={companies} />;
}
