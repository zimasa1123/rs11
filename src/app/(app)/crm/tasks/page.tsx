import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, lt, desc, inArray, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { TasksClient } from "./tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string; overdue?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const sp = await searchParams;
  const where = [];
  if (sp.status) where.push(eq(schema.tasks.status, sp.status as any));
  if (sp.overdue === "1") where.push(and(lt(schema.tasks.dueDate, new Date()), inArray(schema.tasks.status, ["pending", "in_progress"])) as any);

  const tasks = await db
    .select({
      id: schema.tasks.id, title: schema.tasks.title, description: schema.tasks.description,
      ownerId: schema.tasks.ownerId, dueDate: schema.tasks.dueDate,
      priority: schema.tasks.priority, status: schema.tasks.status,
      entityType: schema.tasks.entityType, entityId: schema.tasks.entityId,
      ownerName: schema.profiles.fullName, createdAt: schema.tasks.createdAt,
    })
    .from(schema.tasks)
    .leftJoin(schema.profiles, eq(schema.tasks.ownerId, schema.profiles.id))
    .where(where.length > 0 ? (where.length === 1 ? where[0] : and(...where)) : undefined)
    .orderBy(desc(sql`CASE WHEN ${schema.tasks.status} IN ('pending', 'in_progress') THEN 0 ELSE 1 END`), schema.tasks.dueDate)
    .limit(200);

  const owners = await db.select().from(schema.profiles);
  return <TasksClient tasks={tasks} searchParams={sp} owners={owners} />;
}
