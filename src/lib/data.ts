import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql, desc, count, and, like, ilike, or, inArray } from "drizzle-orm";

// Generic paginated list with search + filters
export async function listRecords<T extends Record<string, any>>(opts: {
  table: any;
  page: number;
  pageSize: number;
  search?: string;
  searchFields?: string[];
  filters?: Record<string, any>;
  orderBy?: any;
  joins?: Array<{ table: any; on: any; as: string }>;
  select?: Record<string, any>;
}) {
  const { table, page, pageSize, search, searchFields, filters, orderBy } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];

  if (search && searchFields && searchFields.length > 0) {
    const searchClauses = searchFields.map((f) => {
      const field = table[f];
      return field ? ilike(field, `%${search}%`) : undefined;
    }).filter(Boolean);
    if (searchClauses.length > 0) {
      where.push(or(...(searchClauses as any[])));
    }
  }

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === "") continue;
      const field = table[key];
      if (field) where.push(eq(field, value));
    }
  }

  const whereClause = where.length > 0 ? and(...where) : undefined;

  const totalResult = await db
    .select({ count: count() })
    .from(table)
    .where(whereClause);
  const total = totalResult[0].count;

  const rows = await db
    .select()
    .from(table)
    .where(whereClause)
    .orderBy(orderBy || desc(table.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// Leads with company + contact + owner joined
export async function listLeads(opts: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  ownerId?: string;
  businessLineId?: string;
  country?: string;
}) {
  const { page, pageSize, search, status, ownerId, businessLineId, country } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (status) where.push(eq(schema.leads.status, status as any));
  if (ownerId) where.push(eq(schema.leads.ownerId, ownerId));
  if (businessLineId) where.push(eq(schema.leads.businessLineId, businessLineId));
  if (country) where.push(eq(schema.leads.country, country));
  if (search) {
    where.push(
      or(
        ilike(schema.leads.country, `%${search}%`),
        ilike(schema.leads.requirement, `%${search}%`),
        ilike(schema.leads.city, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;

  const total = (await db.select({ count: count() }).from(schema.leads).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.leads.id,
      country: schema.leads.country,
      status: schema.leads.status,
      priority: schema.leads.priority,
      businessLine: schema.businessLines.name,
      product: schema.products.name,
      company: schema.companies.name,
      contact: sql<string>`CONCAT(COALESCE(${schema.contacts.firstName},''), ' ', COALESCE(${schema.contacts.lastName},''))`,
      owner: schema.profiles.fullName,
      estimatedValue: schema.leads.estimatedValue,
      currency: schema.leads.currency,
      expectedCloseDate: schema.leads.expectedCloseDate,
      nextFollowUp: schema.leads.nextFollowUp,
      createdAt: schema.leads.createdAt,
    })
    .from(schema.leads)
    .leftJoin(schema.companies, eq(schema.leads.companyId, schema.companies.id))
    .leftJoin(schema.contacts, eq(schema.leads.contactId, schema.contacts.id))
    .leftJoin(schema.profiles, eq(schema.leads.ownerId, schema.profiles.id))
    .leftJoin(schema.businessLines, eq(schema.leads.businessLineId, schema.businessLines.id))
    .leftJoin(schema.products, eq(schema.leads.productId, schema.products.id))
    .where(whereClause)
    .orderBy(desc(schema.leads.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listCompanies(opts: {
  page: number;
  pageSize: number;
  search?: string;
  companyType?: string;
  country?: string;
}) {
  const { page, pageSize, search, companyType, country } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (companyType) where.push(eq(schema.companies.companyType, companyType as any));
  if (country) where.push(eq(schema.companies.country, country));
  if (search) {
    where.push(
      or(
        ilike(schema.companies.name, `%${search}%`),
        ilike(schema.companies.city, `%${search}%`),
        ilike(schema.companies.industry, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.companies).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.companies.id,
      name: schema.companies.name,
      country: schema.companies.country,
      city: schema.companies.city,
      companyType: schema.companies.companyType,
      industry: schema.companies.industry,
      owner: schema.profiles.fullName,
      branch: schema.branches.name,
      createdAt: schema.companies.createdAt,
    })
    .from(schema.companies)
    .leftJoin(schema.profiles, eq(schema.companies.ownerId, schema.profiles.id))
    .leftJoin(schema.branches, eq(schema.companies.branchId, schema.branches.id))
    .where(whereClause)
    .orderBy(desc(schema.companies.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listContacts(opts: {
  page: number;
  pageSize: number;
  search?: string;
  companyId?: string;
}) {
  const { page, pageSize, search, companyId } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (companyId) where.push(eq(schema.contacts.companyId, companyId));
  if (search) {
    where.push(
      or(
        ilike(schema.contacts.firstName, `%${search}%`),
        ilike(schema.contacts.lastName, `%${search}%`),
        ilike(schema.contacts.email, `%${search}%`),
        ilike(schema.contacts.jobTitle, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.contacts).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.contacts.id,
      firstName: schema.contacts.firstName,
      lastName: schema.contacts.lastName,
      jobTitle: schema.contacts.jobTitle,
      email: schema.contacts.email,
      phone: schema.contacts.phone,
      country: schema.contacts.country,
      company: schema.companies.name,
      isDecisionMaker: schema.contacts.isDecisionMaker,
      createdAt: schema.contacts.createdAt,
    })
    .from(schema.contacts)
    .leftJoin(schema.companies, eq(schema.contacts.companyId, schema.companies.id))
    .where(whereClause)
    .orderBy(desc(schema.contacts.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listOpportunities(opts: {
  page: number;
  pageSize: number;
  search?: string;
  stage?: string;
  ownerId?: string;
}) {
  const { page, pageSize, search, stage, ownerId } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (stage) where.push(eq(schema.opportunities.stage, stage as any));
  if (ownerId) where.push(eq(schema.opportunities.ownerId, ownerId));
  if (search) {
    where.push(
      or(
        ilike(schema.opportunities.name, `%${search}%`),
        ilike(schema.opportunities.country, `%${search}%`),
        ilike(schema.opportunities.requirement, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.opportunities).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.opportunities.id,
      name: schema.opportunities.name,
      stage: schema.opportunities.stage,
      country: schema.opportunities.country,
      estimatedValue: schema.opportunities.estimatedValue,
      currency: schema.opportunities.currency,
      probability: schema.opportunities.probability,
      expectedCloseDate: schema.opportunities.expectedCloseDate,
      company: schema.companies.name,
      owner: schema.profiles.fullName,
      product: schema.products.name,
      businessLine: schema.businessLines.name,
      createdAt: schema.opportunities.createdAt,
    })
    .from(schema.opportunities)
    .leftJoin(schema.companies, eq(schema.opportunities.companyId, schema.companies.id))
    .leftJoin(schema.profiles, eq(schema.opportunities.ownerId, schema.profiles.id))
    .leftJoin(schema.products, eq(schema.opportunities.productId, schema.products.id))
    .leftJoin(schema.businessLines, eq(schema.opportunities.businessLineId, schema.businessLines.id))
    .where(whereClause)
    .orderBy(desc(schema.opportunities.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listQuotations(opts: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const { page, pageSize, search, status } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (status) where.push(eq(schema.quotations.status, status as any));
  if (search) {
    where.push(
      or(
        ilike(schema.quotations.quotationNumber, `%${search}%`),
        ilike(schema.quotations.notes, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.quotations).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.quotations.id,
      quotationNumber: schema.quotations.quotationNumber,
      status: schema.quotations.status,
      company: schema.companies.name,
      grandTotal: schema.quotations.grandTotal,
      currency: schema.quotations.currency,
      incoterm: schema.quotations.incoterm,
      validUntil: schema.quotations.validUntil,
      issuedAt: schema.quotations.issuedAt,
      createdAt: schema.quotations.createdAt,
    })
    .from(schema.quotations)
    .leftJoin(schema.companies, eq(schema.quotations.companyId, schema.companies.id))
    .where(whereClause)
    .orderBy(desc(schema.quotations.createdAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listProducts(opts: {
  page: number;
  pageSize: number;
  search?: string;
  businessLineId?: string;
}) {
  const { page, pageSize, search, businessLineId } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (businessLineId) where.push(eq(schema.products.businessLineId, businessLineId));
  if (search) {
    where.push(
      or(
        ilike(schema.products.name, `%${search}%`),
        ilike(schema.products.sku, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.products).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.products.id,
      sku: schema.products.sku,
      name: schema.products.name,
      businessLine: schema.businessLines.name,
      unit: schema.products.unit,
      origin: schema.products.origin,
      referencePrice: schema.products.referencePrice,
      currency: schema.products.currency,
      moq: schema.products.moq,
      leadTimeDays: schema.products.leadTimeDays,
      active: schema.products.active,
    })
    .from(schema.products)
    .leftJoin(schema.businessLines, eq(schema.products.businessLineId, schema.businessLines.id))
    .where(whereClause)
    .orderBy(desc(schema.products.createdAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listSuppliers(opts: {
  page: number;
  pageSize: number;
  search?: string;
  verificationStatus?: string;
}) {
  const { page, pageSize, search, verificationStatus } = opts;
  const offset = (page - 1) * pageSize;
  const where = [];
  if (verificationStatus) where.push(eq(schema.suppliers.verificationStatus, verificationStatus as any));
  if (search) {
    where.push(
      or(
        ilike(schema.suppliers.name, `%${search}%`),
        ilike(schema.suppliers.country, `%${search}%`),
        ilike(schema.suppliers.city, `%${search}%`),
      ),
    );
  }
  const whereClause = where.length > 0 ? and(...where) : undefined;
  const total = (await db.select({ count: count() }).from(schema.suppliers).where(whereClause))[0].count;
  const rows = await db
    .select({
      id: schema.suppliers.id,
      name: schema.suppliers.name,
      country: schema.suppliers.country,
      city: schema.suppliers.city,
      contactName: schema.suppliers.contactName,
      email: schema.suppliers.email,
      isManufacturer: schema.suppliers.isManufacturer,
      verificationStatus: schema.suppliers.verificationStatus,
      moq: schema.suppliers.moq,
      leadTimeDays: schema.suppliers.leadTimeDays,
    })
    .from(schema.suppliers)
    .where(whereClause)
    .orderBy(desc(schema.suppliers.createdAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
