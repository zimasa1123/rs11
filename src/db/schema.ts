import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============== ENUMS ==============
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "requirement_received",
  "sourcing",
  "quotation_preparation",
  "quotation_sent",
  "negotiation",
  "won",
  "lost",
  "nurture",
]);

export const opportunityStageEnum = pgEnum("opportunity_stage", [
  "new_lead",
  "contacted",
  "qualified",
  "requirement_received",
  "sourcing",
  "quotation_preparation",
  "quotation_sent",
  "negotiation",
  "verbal_agreement",
  "won",
  "lost",
]);

export const priorityEnum = pgEnum("priority", ["low", "normal", "high", "urgent"]);

export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",
  "internal_review",
  "sent",
  "viewed",
  "negotiation",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "confirmed",
  "processing",
  "ready_to_ship",
  "partially_shipped",
  "shipped",
  "delivered",
  "cancelled",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "preparing",
  "booked",
  "in_transit",
  "arrived",
  "customs",
  "delivered",
  "delayed",
  "cancelled",
]);

export const supplierVerificationEnum = pgEnum("supplier_verification", [
  "unverified",
  "under_review",
  "verified",
  "suspended",
]);

export const sourcingStatusEnum = pgEnum("sourcing_status", [
  "new",
  "searching",
  "suppliers_identified",
  "quotes_received",
  "comparison",
  "selected",
  "completed",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "call",
  "email",
  "whatsapp",
  "meeting",
  "follow_up",
  "note",
  "site_visit",
  "exhibition",
  "quotation",
  "task",
]);

export const campaignChannelEnum = pgEnum("campaign_channel", [
  "google_ads",
  "meta_ads",
  "linkedin_ads",
  "seo",
  "website",
  "email",
  "whatsapp",
  "direct_outreach",
  "exhibitions",
  "referral",
  "other",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "planned",
  "active",
  "paused",
  "completed",
  "cancelled",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "idea",
  "planned",
  "in_production",
  "review",
  "approved",
  "published",
  "cancelled",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "late",
  "early_leave",
  "absent",
  "remote",
  "on_leave",
  "requires_review",
]);

export const checkInTypeEnum = pgEnum("check_in_type", [
  "office",
  "remote",
  "field_work",
  "business_trip",
]);

export const companyTypeEnum = pgEnum("company_type", [
  "customer",
  "prospect",
  "importer",
  "exporter",
  "distributor",
  "wholesaler",
  "retailer",
  "contractor",
  "developer",
  "manufacturer",
  "supplier",
  "partner",
  "agent",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "partial",
  "paid",
  "overdue",
]);

// ============== CORE TABLES ==============

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("employee"),
    branchId: uuid("branch_id"),
    employeeId: uuid("employee_id"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("profiles_email_idx").on(t.email),
  }),
);

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  managerName: varchar("manager_name", { length: 255 }),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const markets = pgTable("markets", {
  id: uuid("id").defaultRandom().primaryKey(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  priority: priorityEnum("priority").default("normal"),
  businessLines: jsonb("business_lines").$type<string[]>(),
  products: jsonb("products").$type<string[]>(),
  targetCustomerTypes: jsonb("target_customer_types").$type<string[]>(),
  notes: text("notes"),
  ownerId: uuid("owner_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessLines = pgTable("business_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const currencies = pgTable("currencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 4 }).default("1"),
  isBase: boolean("is_base").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

export const leadSources = pgTable("lead_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  channel: varchar("channel", { length: 100 }),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: uuid("parent_id"),
  businessLineId: uuid("business_line_id"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: varchar("sku", { length: 100 }).unique(),
    name: varchar("name", { length: 255 }).notNull(),
    businessLineId: uuid("business_line_id"),
    categoryId: uuid("category_id"),
    subcategory: varchar("subcategory", { length: 255 }),
    description: text("description"),
    specifications: jsonb("specifications"),
    unit: varchar("unit", { length: 50 }),
    origin: varchar("origin", { length: 100 }),
    targetMarkets: jsonb("target_markets").$type<string[]>(),
    moq: integer("moq"),
    leadTimeDays: integer("lead_time_days"),
    certifications: jsonb("certifications").$type<string[]>(),
    referenceCost: numeric("reference_cost", { precision: 14, scale: 2 }),
    referencePrice: numeric("reference_price", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("USD"),
    marginPct: numeric("margin_pct", { precision: 6, scale: 2 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    skuIdx: uniqueIndex("products_sku_idx").on(t.sku),
    nameIdx: index("products_name_idx").on(t.name),
  }),
);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    companyType: companyTypeEnum("company_type").default("prospect"),
    taxNumber: varchar("tax_number", { length: 100 }),
    registrationNumber: varchar("registration_number", { length: 100 }),
    branchId: uuid("branch_id"),
    ownerId: uuid("owner_id"),
    marketId: uuid("market_id"),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("companies_name_idx").on(t.name),
    countryIdx: index("companies_country_idx").on(t.country),
  }),
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id"),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    jobTitle: varchar("job_title", { length: 100 }),
    department: varchar("department", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    linkedin: varchar("linkedin", { length: 255 }),
    country: varchar("country", { length: 100 }),
    preferredLanguage: varchar("preferred_language", { length: 50 }),
    isDecisionMaker: boolean("is_decision_maker").default(false),
    influenceLevel: varchar("influence_level", { length: 50 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("contacts_company_idx").on(t.companyId),
  }),
);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  businessLineId: uuid("business_line_id"),
  productId: uuid("product_id"),
  country: varchar("country", { length: 100 }),
  audience: varchar("audience", { length: 255 }),
  channel: campaignChannelEnum("channel"),
  budget: numeric("budget", { precision: 14, scale: 2 }),
  spend: numeric("spend", { precision: 14, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  startDate: date("start_date"),
  endDate: date("end_date"),
  ownerId: uuid("owner_id"),
  status: campaignStatusEnum("status").default("planned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id"),
    contactId: uuid("contact_id"),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    customerType: varchar("customer_type", { length: 100 }),
    businessLineId: uuid("business_line_id"),
    productId: uuid("product_id"),
    requirement: text("requirement"),
    quantity: numeric("quantity", { precision: 14, scale: 2 }),
    unit: varchar("unit", { length: 50 }),
    budget: numeric("budget", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("USD"),
    sourceId: uuid("source_id"),
    campaignId: uuid("campaign_id"),
    ownerId: uuid("owner_id"),
    branchId: uuid("branch_id"),
    priority: priorityEnum("priority").default("normal"),
    status: leadStatusEnum("status").default("new"),
    estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
    expectedCloseDate: date("expected_close_date"),
    lastActivityAt: timestamp("last_activity_at"),
    nextFollowUp: timestamp("next_follow_up"),
    notes: text("notes"),
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),
    utmContent: varchar("utm_content", { length: 100 }),
    utmTerm: varchar("utm_term", { length: 100 }),
    landingPage: varchar("landing_page", { length: 500 }),
    firstTouchSource: varchar("first_touch_source", { length: 100 }),
    lastTouchSource: varchar("last_touch_source", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("leads_status_idx").on(t.status),
    companyIdx: index("leads_company_idx").on(t.companyId),
    ownerIdx: index("leads_owner_idx").on(t.ownerId),
  }),
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    companyId: uuid("company_id"),
    contactId: uuid("contact_id"),
    leadId: uuid("lead_id"),
    productId: uuid("product_id"),
    businessLineId: uuid("business_line_id"),
    country: varchar("country", { length: 100 }),
    quantity: numeric("quantity", { precision: 14, scale: 2 }),
    unit: varchar("unit", { length: 50 }),
    estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("USD"),
    probability: integer("probability").default(10),
    expectedCloseDate: date("expected_close_date"),
    ownerId: uuid("owner_id"),
    branchId: uuid("branch_id"),
    sourceId: uuid("source_id"),
    campaignId: uuid("campaign_id"),
    supplierId: uuid("supplier_id"),
    requirement: text("requirement"),
    notes: text("notes"),
    stage: opportunityStageEnum("stage").default("new_lead"),
    lostReason: text("lost_reason"),
    lastActivityAt: timestamp("last_activity_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stageIdx: index("opportunities_stage_idx").on(t.stage),
    companyIdx: index("opportunities_company_idx").on(t.companyId),
  }),
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    companyId: uuid("company_id"),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    contactName: varchar("contact_name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    website: varchar("website", { length: 255 }),
    isManufacturer: boolean("is_manufacturer").default(false),
    businessLineIds: jsonb("business_line_ids").$type<string[]>(),
    productIds: jsonb("product_ids").$type<string[]>(),
    moq: integer("moq"),
    leadTimeDays: integer("lead_time_days"),
    paymentTerms: text("payment_terms"),
    shippingCapability: text("shipping_capability"),
    exportCapability: text("export_capability"),
    certifications: jsonb("certifications").$type<string[]>(),
    verificationStatus: supplierVerificationEnum("verification_status").default("unverified"),
    qualityNotes: text("quality_notes"),
    performanceNotes: text("performance_notes"),
    riskNotes: text("risk_notes"),
    verificationExpiry: date("verification_expiry"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("suppliers_name_idx").on(t.name),
  }),
);

export const sourcingRequests = pgTable("sourcing_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id"),
  opportunityId: uuid("opportunity_id"),
  productId: uuid("product_id"),
  specifications: text("specifications"),
  quantity: numeric("quantity", { precision: 14, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  destination: varchar("destination", { length: 100 }),
  targetPrice: numeric("target_price", { precision: 14, scale: 2 }),
  requiredDate: date("required_date"),
  ownerId: uuid("owner_id"),
  status: sourcingStatusEnum("status").default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierQuotes = pgTable("supplier_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourcingRequestId: uuid("sourcing_request_id"),
  supplierId: uuid("supplier_id"),
  price: numeric("price", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  moq: integer("moq"),
  leadTimeDays: integer("lead_time_days"),
  paymentTerms: text("payment_terms"),
  shippingTerms: text("shipping_terms"),
  qualityNotes: text("quality_notes"),
  certifications: text("certifications"),
  notes: text("notes"),
  selected: boolean("selected").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotations = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationNumber: varchar("quotation_number", { length: 50 }).unique(),
  companyId: uuid("company_id"),
  contactId: uuid("contact_id"),
  opportunityId: uuid("opportunity_id"),
  branchId: uuid("branch_id"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  discountPct: numeric("discount_pct", { precision: 6, scale: 2 }).default("0"),
  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }).default("0"),
  shippingAmount: numeric("shipping_amount", { precision: 14, scale: 2 }).default("0"),
  taxPct: numeric("tax_pct", { precision: 6, scale: 2 }).default("0"),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).default("0"),
  grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).default("0"),
  incoterm: varchar("incoterm", { length: 50 }),
  paymentTerms: text("payment_terms"),
  validityDays: integer("validity_days").default(30),
  deliveryEstimate: text("delivery_estimate"),
  notes: text("notes"),
  status: quotationStatusEnum("status").default("draft"),
  issuedAt: timestamp("issued_at"),
  validUntil: date("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").notNull(),
  productId: uuid("product_id"),
  description: text("description"),
  quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  discountPct: numeric("discount_pct", { precision: 6, scale: 2 }).default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).unique(),
  companyId: uuid("company_id"),
  quotationId: uuid("quotation_id"),
  opportunityId: uuid("opportunity_id"),
  branchId: uuid("branch_id"),
  ownerId: uuid("owner_id"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid"),
  status: orderStatusEnum("status").default("draft"),
  expectedDelivery: date("expected_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull(),
  productId: uuid("product_id"),
  description: text("description"),
  quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
});

export const shipments = pgTable("shipments", {
  id: uuid("id").defaultRandom().primaryKey(),
  shipmentNumber: varchar("shipment_number", { length: 50 }).unique(),
  orderId: uuid("order_id"),
  companyId: uuid("company_id"),
  origin: varchar("origin", { length: 255 }),
  destination: varchar("destination", { length: 255 }),
  carrier: varchar("carrier", { length: 255 }),
  container: varchar("container", { length: 100 }),
  trackingReference: varchar("tracking_reference", { length: 255 }),
  etd: date("etd"),
  eta: date("eta"),
  actualDeparture: date("actual_departure"),
  actualArrival: date("actual_arrival"),
  status: shipmentStatusEnum("status").default("preparing"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: activityTypeEnum("type").notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description"),
    companyId: uuid("company_id"),
    contactId: uuid("contact_id"),
    leadId: uuid("lead_id"),
    opportunityId: uuid("opportunity_id"),
    quotationId: uuid("quotation_id"),
    orderId: uuid("order_id"),
    supplierId: uuid("supplier_id"),
    ownerId: uuid("owner_id"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("activities_company_idx").on(t.companyId),
    leadIdx: index("activities_lead_idx").on(t.leadId),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    ownerId: uuid("owner_id"),
    dueDate: timestamp("due_date"),
    priority: priorityEnum("priority").default("normal"),
    status: taskStatusEnum("status").default("pending"),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: uuid("entity_id"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    ownerIdx: index("tasks_owner_idx").on(t.ownerId),
    dueIdx: index("tasks_due_idx").on(t.dueDate),
  }),
);

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  employeeCode: varchar("employee_code", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  department: varchar("department", { length: 100 }),
  role: varchar("role", { length: 100 }),
  branchId: uuid("branch_id"),
  managerId: uuid("manager_id"),
  joinDate: date("join_date"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceLocations = pgTable("attendance_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  branchId: uuid("branch_id"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  radiusMeters: integer("radius_meters").notNull().default(100),
  active: boolean("active").notNull().default(true),
});

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id").notNull(),
    date: date("date").notNull(),
    checkInAt: timestamp("check_in_at"),
    checkOutAt: timestamp("check_out_at"),
    checkInType: checkInTypeEnum("check_in_type"),
    checkInLat: numeric("check_in_lat", { precision: 10, scale: 7 }),
    checkInLng: numeric("check_in_lng", { precision: 10, scale: 7 }),
    checkInAccuracy: numeric("check_in_accuracy", { precision: 8, scale: 2 }),
    checkInDistance: numeric("check_in_distance", { precision: 8, scale: 2 }),
    checkInPhoto: varchar("check_in_photo", { length: 500 }),
    checkOutLat: numeric("check_out_lat", { precision: 10, scale: 7 }),
    checkOutLng: numeric("check_out_lng", { precision: 10, scale: 7 }),
    checkOutAccuracy: numeric("check_out_accuracy", { precision: 8, scale: 2 }),
    checkOutDistance: numeric("check_out_distance", { precision: 8, scale: 2 }),
    checkOutPhoto: varchar("check_out_photo", { length: 500 }),
    locationId: uuid("location_id"),
    status: attendanceStatusEnum("status").default("present"),
    anomalyNotes: text("anomaly_notes"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    empDateIdx: uniqueIndex("attendance_emp_date_idx").on(t.employeeId, t.date),
  }),
);

export const leaveTypes = pgTable("leave_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  paid: boolean("paid").default(true),
  active: boolean("active").notNull().default(true),
});

export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").notNull(),
  leaveTypeId: uuid("leave_type_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("pending"),
  approverId: uuid("approver_id"),
  decisionAt: timestamp("decision_at"),
  decisionNotes: text("decision_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    link: varchar("link", { length: 500 }),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("notifications_user_idx").on(t.userId),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    ip: varchar("ip", { length: 50 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    userIdx: index("audit_logs_user_idx").on(t.userId),
    createdAtIdx: index("audit_logs_created_idx").on(t.createdAt),
  }),
);

export const appSettings = pgTable("app_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contentCalendar = pgTable("content_calendar", {
  id: uuid("id").defaultRandom().primaryKey(),
  publishDate: date("publish_date"),
  channel: varchar("channel", { length: 100 }),
  businessLineId: uuid("business_line_id"),
  productId: uuid("product_id"),
  country: varchar("country", { length: 100 }),
  topic: varchar("topic", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 100 }),
  ownerId: uuid("owner_id"),
  status: contentStatusEnum("status").default("idea"),
  assetUrl: varchar("asset_url", { length: 500 }),
  caption: text("caption"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== RELATIONS ==============
export const companiesRelations = relations(companies, ({ many, one }) => ({
  contacts: many(contacts),
  leads: many(leads),
  opportunities: many(opportunities),
  quotations: many(quotations),
  orders: many(orders),
  branch: one(branches, { fields: [companies.branchId], references: [branches.id] }),
  owner: one(profiles, { fields: [companies.ownerId], references: [profiles.id] }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  company: one(companies, { fields: [leads.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [leads.contactId], references: [contacts.id] }),
  owner: one(profiles, { fields: [leads.ownerId], references: [profiles.id] }),
  businessLine: one(businessLines, { fields: [leads.businessLineId], references: [businessLines.id] }),
  product: one(products, { fields: [leads.productId], references: [products.id] }),
  source: one(leadSources, { fields: [leads.sourceId], references: [leadSources.id] }),
  campaign: one(campaigns, { fields: [leads.campaignId], references: [campaigns.id] }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  company: one(companies, { fields: [opportunities.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [opportunities.contactId], references: [contacts.id] }),
  owner: one(profiles, { fields: [opportunities.ownerId], references: [profiles.id] }),
  product: one(products, { fields: [opportunities.productId], references: [products.id] }),
  businessLine: one(businessLines, { fields: [opportunities.businessLineId], references: [businessLines.id] }),
  supplier: one(suppliers, { fields: [opportunities.supplierId], references: [suppliers.id] }),
}));
