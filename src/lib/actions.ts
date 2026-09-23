"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth, canEdit, canAdmin } from "@/lib/auth";

async function audit(userId: string, action: string, entityType: string, entityId: string, oldValue: any = null, newValue: any = null) {
  try {
    await db.insert(schema.auditLogs).values({
      userId, action, entityType, entityId, oldValue, newValue,
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

// ============ LEADS ============
export async function createLead(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = {
      ...data,
      ownerId: data.ownerId || user.id,
      branchId: data.branchId || user.branchId,
    };
    if (payload.estimatedValue) payload.estimatedValue = String(payload.estimatedValue);
    if (payload.budget) payload.budget = String(payload.budget);
    if (payload.quantity) payload.quantity = String(payload.quantity);
    const [inserted] = await db.insert(schema.leads).values(payload).returning();
    await audit(user.id, "create", "lead", inserted.id, null, payload);
    revalidatePath("/crm/leads");
    revalidatePath("/dashboard");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: e.message || "Failed to create lead" };
  }
}

export async function updateLead(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const [existing] = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
    const payload: any = { ...data, updatedAt: new Date() };
    if (payload.estimatedValue !== undefined) payload.estimatedValue = payload.estimatedValue ? String(payload.estimatedValue) : null;
    if (payload.budget !== undefined) payload.budget = payload.budget ? String(payload.budget) : null;
    if (payload.quantity !== undefined) payload.quantity = payload.quantity ? String(payload.quantity) : null;
    await db.update(schema.leads).set(payload).where(eq(schema.leads.id, id));
    await audit(user.id, "update", "lead", id, existing, payload);
    revalidatePath("/crm/leads");
    revalidatePath(`/crm/leads/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canAdmin(user)) return { ok: false, error: "No permission" };
    await db.delete(schema.leads).where(eq(schema.leads.id, id));
    await audit(user.id, "delete", "lead", id);
    revalidatePath("/crm/leads");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ COMPANIES ============
export async function createCompany(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data, ownerId: data.ownerId || user.id, branchId: data.branchId || user.branchId };
    const [inserted] = await db.insert(schema.companies).values(payload).returning();
    await audit(user.id, "create", "company", inserted.id, null, payload);
    revalidatePath("/crm/companies");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateCompany(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const [existing] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    await db.update(schema.companies).set({ ...data, updatedAt: new Date() }).where(eq(schema.companies.id, id));
    await audit(user.id, "update", "company", id, existing, data);
    revalidatePath("/crm/companies");
    revalidatePath(`/crm/companies/${id}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ CONTACTS ============
export async function createContact(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const [inserted] = await db.insert(schema.contacts).values(data).returning();
    await audit(user.id, "create", "contact", inserted.id);
    revalidatePath("/crm/contacts");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ OPPORTUNITIES ============
export async function createOpportunity(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data, ownerId: data.ownerId || user.id, branchId: data.branchId || user.branchId };
    if (payload.estimatedValue) payload.estimatedValue = String(payload.estimatedValue);
    if (payload.quantity) payload.quantity = String(payload.quantity);
    const [inserted] = await db.insert(schema.opportunities).values(payload).returning();
    await audit(user.id, "create", "opportunity", inserted.id);
    revalidatePath("/crm/opportunities");
    revalidatePath("/dashboard");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateOpportunity(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const [existing] = await db.select().from(schema.opportunities).where(eq(schema.opportunities.id, id));
    const payload: any = { ...data, updatedAt: new Date() };
    if (payload.estimatedValue !== undefined) payload.estimatedValue = payload.estimatedValue ? String(payload.estimatedValue) : null;
    await db.update(schema.opportunities).set(payload).where(eq(schema.opportunities.id, id));
    await audit(user.id, "update", "opportunity", id, existing, payload);
    revalidatePath("/crm/opportunities");
    revalidatePath(`/crm/opportunities/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ PRODUCTS ============
export async function createProduct(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data };
    if (payload.referenceCost) payload.referenceCost = String(payload.referenceCost);
    if (payload.referencePrice) payload.referencePrice = String(payload.referencePrice);
    const [inserted] = await db.insert(schema.products).values(payload).returning();
    await audit(user.id, "create", "product", inserted.id);
    revalidatePath("/trading/products");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ SUPPLIERS ============
export async function createSupplier(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const [inserted] = await db.insert(schema.suppliers).values(data as any).returning();
    await audit(user.id, "create", "supplier", inserted.id);
    revalidatePath("/trading/suppliers");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ QUOTATIONS ============
export async function createQuotation(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data };
    // Auto-generate number
    const [last] = await db.select({ n: schema.quotations.quotationNumber }).from(schema.quotations).orderBy(sql`${schema.quotations.quotationNumber} DESC`).limit(1);
    const num = last?.n ? parseInt(last.n.replace(/\D/g, "")) + 1 : 10001;
    payload.quotationNumber = `QT-${String(num).padStart(5, "0")}`;
    // Totals
    const subtotal = parseFloat(payload.subtotal || "0");
    const discountAmount = parseFloat(payload.discountAmount || "0");
    const shippingAmount = parseFloat(payload.shippingAmount || "0");
    const taxAmount = parseFloat(payload.taxAmount || "0");
    payload.grandTotal = (subtotal - discountAmount + shippingAmount + taxAmount).toFixed(2);
    payload.subtotal = subtotal.toFixed(2);
    payload.discountAmount = discountAmount.toFixed(2);
    payload.shippingAmount = shippingAmount.toFixed(2);
    payload.taxAmount = taxAmount.toFixed(2);
    if (payload.discountPct) payload.discountPct = String(payload.discountPct);
    if (payload.taxPct) payload.taxPct = String(payload.taxPct);
    const [inserted] = await db.insert(schema.quotations).values(payload).returning();
    await audit(user.id, "create", "quotation", inserted.id);
    revalidatePath("/trading/quotations");
    revalidatePath("/dashboard");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateQuotationStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    await db.update(schema.quotations).set({ status: status as any, updatedAt: new Date() }).where(eq(schema.quotations.id, id));
    await audit(user.id, "update_status", "quotation", id, null, { status });
    revalidatePath("/trading/quotations");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ ORDERS ============
export async function createOrder(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data, ownerId: data.ownerId || user.id, branchId: data.branchId || user.branchId };
    const [last] = await db.select({ n: schema.orders.orderNumber }).from(schema.orders).orderBy(sql`${schema.orders.orderNumber} DESC`).limit(1);
    const num = last?.n ? parseInt(last.n.replace(/\D/g, "")) + 1 : 50001;
    payload.orderNumber = `ORD-${String(num).padStart(5, "0")}`;
    if (payload.totalAmount) payload.totalAmount = String(payload.totalAmount);
    const [inserted] = await db.insert(schema.orders).values(payload).returning();
    await audit(user.id, "create", "order", inserted.id);
    revalidatePath("/ops/orders");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ SHIPMENTS ============
export async function createShipment(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data };
    const [last] = await db.select({ n: schema.shipments.shipmentNumber }).from(schema.shipments).orderBy(sql`${schema.shipments.shipmentNumber} DESC`).limit(1);
    const num = last?.n ? parseInt(last.n.replace(/\D/g, "")) + 1 : 20001;
    payload.shipmentNumber = `SHP-${String(num).padStart(5, "0")}`;
    const [inserted] = await db.insert(schema.shipments).values(payload).returning();
    await audit(user.id, "create", "shipment", inserted.id);
    revalidatePath("/ops/shipments");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ TASKS ============
export async function createTask(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const payload: any = { ...data, ownerId: data.ownerId || user.id };
    const [inserted] = await db.insert(schema.tasks).values(payload).returning();
    revalidatePath("/crm/tasks");
    revalidatePath("/dashboard");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateTask(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const payload: any = { ...data };
    if (payload.status === "completed") payload.completedAt = new Date();
    await db.update(schema.tasks).set(payload).where(eq(schema.tasks.id, id));
    revalidatePath("/crm/tasks");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ ACTIVITIES ============
export async function createActivity(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const payload: any = { ...data, ownerId: data.ownerId || user.id, occurredAt: data.occurredAt || new Date() };
    const [inserted] = await db.insert(schema.activities).values(payload).returning();
    revalidatePath("/crm/activities");
    if (data.leadId) revalidatePath(`/crm/leads/${data.leadId}`);
    if (data.opportunityId) revalidatePath(`/crm/opportunities/${data.opportunityId}`);
    if (data.companyId) revalidatePath(`/crm/companies/${data.companyId}`);
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ CAMPAIGNS ============
export async function createCampaign(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data, ownerId: data.ownerId || user.id };
    if (payload.budget) payload.budget = String(payload.budget);
    if (payload.spend) payload.spend = String(payload.spend);
    const [inserted] = await db.insert(schema.campaigns).values(payload).returning();
    revalidatePath("/marketing/campaigns");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ SOURCING ============
export async function createSourcingRequest(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canEdit(user)) return { ok: false, error: "No permission" };
    const payload: any = { ...data, ownerId: data.ownerId || user.id };
    if (payload.quantity) payload.quantity = String(payload.quantity);
    if (payload.targetPrice) payload.targetPrice = String(payload.targetPrice);
    const [inserted] = await db.insert(schema.sourcingRequests).values(payload).returning();
    revalidatePath("/trading/sourcing");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ LEAVE REQUESTS ============
export async function createLeaveRequest(data: Record<string, any>): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(schema.leaveRequests).values(data as any).returning();
    revalidatePath("/team/leave");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateLeaveStatus(id: string, status: "approved" | "rejected", notes?: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    await db.update(schema.leaveRequests).set({
      status, approverId: user.id, decisionAt: new Date(), decisionNotes: notes || null,
    }).where(eq(schema.leaveRequests.id, id));
    await audit(user.id, "leave_decision", "leave_request", id, null, { status, notes });
    revalidatePath("/team/leave");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ ATTENDANCE ============
export async function checkIn(data: { employeeId: string; lat?: string; lng?: string; accuracy?: string; type: string }): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const today = new Date().toISOString().slice(0, 10);
    const [existing] = await db.select().from(schema.attendanceRecords)
      .where(sql`${schema.attendanceRecords.employeeId} = ${data.employeeId} AND ${schema.attendanceRecords.date} = ${today}`);
    if (existing?.checkInAt) return { ok: false, error: "Already checked in today" };
    // Default location (Cairo HQ)
    const officeLat = 30.0444;
    const officeLng = 31.2357;
    let distance = 0;
    let status: any = "present";
    if (data.lat && data.lng && data.type === "office") {
      const dLat = parseFloat(data.lat) - officeLat;
      const dLng = parseFloat(data.lng) - officeLng;
      distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
      if (distance > 200) status = "requires_review";
    }
    const now = new Date();
    if (now.getHours() >= 9 || (now.getHours() === 8 && now.getMinutes() > 15)) {
      if (status === "present") status = "late";
    }
    if (existing) {
      await db.update(schema.attendanceRecords).set({
        checkInAt: now, checkInType: data.type as any,
        checkInLat: data.lat || null, checkInLng: data.lng || null,
        checkInAccuracy: data.accuracy || null,
        checkInDistance: distance.toFixed(2),
        status,
      }).where(eq(schema.attendanceRecords.id, existing.id));
    } else {
      await db.insert(schema.attendanceRecords).values({
        employeeId: data.employeeId, date: today,
        checkInAt: now, checkInType: data.type as any,
        checkInLat: data.lat || null, checkInLng: data.lng || null,
        checkInAccuracy: data.accuracy || null,
        checkInDistance: distance.toFixed(2),
        status,
      });
    }
    revalidatePath("/team/attendance");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function checkOut(data: { employeeId: string; lat?: string; lng?: string; accuracy?: string }): Promise<ActionResult> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [existing] = await db.select().from(schema.attendanceRecords)
      .where(sql`${schema.attendanceRecords.employeeId} = ${data.employeeId} AND ${schema.attendanceRecords.date} = ${today}`);
    if (!existing?.checkInAt) return { ok: false, error: "Must check in first" };
    if (existing.checkOutAt) return { ok: false, error: "Already checked out" };
    await db.update(schema.attendanceRecords).set({
      checkOutAt: new Date(),
      checkOutLat: data.lat || null, checkOutLng: data.lng || null,
      checkOutAccuracy: data.accuracy || null,
    }).where(eq(schema.attendanceRecords.id, existing.id));
    revalidatePath("/team/attendance");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ============ USERS ============
export async function createUser(data: { email: string; password: string; fullName: string; role: string; branchId?: string }): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!canAdmin(user)) return { ok: false, error: "No permission" };
    const { hashPassword } = await import("@/lib/auth");
    const passwordHash = await hashPassword(data.password);
    const [inserted] = await db.insert(schema.profiles).values({
      email: data.email, passwordHash, fullName: data.fullName,
      role: data.role, branchId: data.branchId || null,
    }).returning();
    await audit(user.id, "create", "user", inserted.id);
    revalidatePath("/admin/users");
    return { ok: true, id: inserted.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
