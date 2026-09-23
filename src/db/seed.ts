import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import type { InferInsertModel } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { BUSINESS_LINE_SEEDS, LEAD_SOURCE_SEEDS } from "../lib/utils";

type CompanyType = InferInsertModel<typeof schema.companies>["companyType"];
type LeadStatus = InferInsertModel<typeof schema.leads>["status"];
type OpportunityStage = InferInsertModel<typeof schema.opportunities>["stage"];
type QuotationStatus = InferInsertModel<typeof schema.quotations>["status"];
type OrderStatus = InferInsertModel<typeof schema.orders>["status"];
type ShipmentStatus = InferInsertModel<typeof schema.shipments>["status"];
type ActivityType = InferInsertModel<typeof schema.activities>["type"];
type TaskStatus = InferInsertModel<typeof schema.tasks>["status"];

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const COUNTRIES = [
  "Egypt", "Rwanda", "Tanzania", "Libya", "India", "Mauritania",
  "China", "UAE", "Palestine", "Saudi Arabia",
];

const INDUSTRIES = [
  "Construction", "Food & Beverage", "Manufacturing", "Retail",
  "Wholesale", "Agriculture", "Automotive", "Electronics", "Textiles",
];

const FIRST_NAMES = [
  "Ahmed", "Mohamed", "Khalid", "Omar", "Youssef", "Hassan", "Ali", "Ibrahim",
  "Tariq", "Amir", "Sara", "Fatima", "Layla", "Nour", "Maryam", "Huda",
  "Jean", "Pierre", "Michael", "David", "Priya", "Raj", "Wei", "Li",
];

const LAST_NAMES = [
  "El-Sayed", "Mansour", "Hassan", "Ali", "Khan", "Singh", "Patel", "Wang",
  "Chen", "Ahmed", "Ibrahim", "Mwangi", "Nkosi", "Okafor", "Diallo", "Kamara",
];

const COMPANY_PREFIXES = [
  "Al-Noor", "Royal", "Global", "Premium", "Elite", "Golden", "Star", "Atlas",
  "Nile", "Sahara", "Delta", "Prime", "Apex", "Summit", "Ocean", "Desert",
];

const COMPANY_SUFFIXES = [
  "Trading Co.", "Import/Export", "Industries Ltd.", "Distribution",
  "Wholesale", "International", "Group", "Enterprises", "Solutions",
];

const COMPANY_TYPES: CompanyType[] = [
  "customer", "prospect", "importer", "distributor", "wholesaler", "manufacturer",
];

const PRODUCT_NAMES: Record<string, string[]> = {
  BLDG: ["Portland Cement 42.5", "Steel Rebar 12mm", "Ceramic Floor Tiles 60x60", "PVC Pipes 110mm", "Gypsum Board 12mm"],
  MRBL: ["Carrara White Marble Slab", "Black Galaxy Granite", "Travertine Beige", "Emperador Dark Marble"],
  SNTR: ["Wall-Hung Toilet Set", "Ceramic Wash Basin", "Chrome Shower Mixer", "Stainless Steel Sink"],
  ELCB: ["Copper Cable 3x2.5mm", "Armored Cable 4x16mm", "XLPE Power Cable", "PVC Insulated Cable"],
  ELMT: ["LED Panel Light 60x60", "Circuit Breaker 63A", "Distribution Board 12-Way", "Electrical Socket"],
  AGRI: ["Yellow Maize Grade 2", "White Rice 5% Broken", "Raw Sugar ICUMSA 45", "Wheat Grain"],
  FOOD: ["Extra Virgin Olive Oil 1L", "Premium Basmati Rice", "Canned Tomato Paste", "Sunflower Oil 5L"],
  MACH: ["CNC Lathe Machine", "Hydraulic Press 100T", "Industrial Generator 500KVA", "Diesel Forklift 3T"],
  MCMP: ["Ball Bearing 6205", "Hydraulic Cylinder", "Gear Reducer Motor", "Stainless Steel Flange"],
  METL: ["H-Beam Steel 200x200", "Aluminum Ingot 99.7%", "Copper Cathode", "Galvanized Steel Coil"],
  AUTO: ["Brake Pad Set", "Oil Filter", "Car Battery 70Ah", "Shock Absorber"],
  HCFT: ["Handwoven Basket", "Carpet Handmade 2x3m", "Ceramic Vase Set", "Wooden Carving"],
  GEN: ["Office Furniture Set", "Hospital Bed", "School Desk", "Kitchen Appliance Set"],
  IMPEX: ["Container Shipping Service", "Customs Clearance", "Freight Forwarding"],
  SRC: ["Supplier Sourcing - Industrial", "Supplier Sourcing - Agricultural"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log("🌱 Seeding RS Nexus database...");

  // 1. Business Lines
  console.log("  → Business Lines");
  const bizLineIds: Record<string, string> = {};
  for (const bl of BUSINESS_LINE_SEEDS) {
    const [inserted] = await db.insert(schema.businessLines).values({
      name: bl.name, code: bl.code, description: `DEMO: ${bl.name} business line`,
    }).returning();
    bizLineIds[bl.code] = inserted.id;
  }

  // 2. Currencies
  console.log("  → Currencies");
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", exchangeRate: "1", isBase: true },
    { code: "EUR", name: "Euro", symbol: "€", exchangeRate: "0.92" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£", exchangeRate: "48.5" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", exchangeRate: "3.67" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", exchangeRate: "7.24" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", exchangeRate: "83.5" },
    { code: "GBP", name: "British Pound", symbol: "£", exchangeRate: "0.79" },
  ];
  for (const c of currencies) {
    await db.insert(schema.currencies).values(c).onConflictDoNothing();
  }

  // 3. Lead Sources
  console.log("  → Lead Sources");
  const sourceIds: string[] = [];
  for (const s of LEAD_SOURCE_SEEDS) {
    const [inserted] = await db.insert(schema.leadSources).values({ name: s }).returning();
    sourceIds.push(inserted.id);
  }

  // 4. Branches
  console.log("  → Branches");
  const branchesData = [
    { name: "Cairo HQ", country: "Egypt", city: "Cairo", currency: "USD", timezone: "Africa/Cairo" },
    { name: "Kigali Office", country: "Rwanda", city: "Kigali", currency: "USD", timezone: "Africa/Kigali" },
    { name: "Dubai Office", country: "UAE", city: "Dubai", currency: "AED", timezone: "Asia/Dubai" },
    { name: "Guangzhou Sourcing", country: "China", city: "Guangzhou", currency: "CNY", timezone: "Asia/Shanghai" },
  ];
  const branchIds: string[] = [];
  for (const b of branchesData) {
    const [inserted] = await db.insert(schema.branches).values(b).returning();
    branchIds.push(inserted.id);
  }

  // 5. Markets
  console.log("  → Markets");
  for (const c of COUNTRIES) {
    await db.insert(schema.markets).values({
      country: c, region: c === "China" ? "Asia" : c === "India" ? "Asia" : c === "UAE" || c === "Saudi Arabia" ? "Middle East" : "Africa",
      priority: pick(["low", "normal", "high", "urgent"] as const),
      active: true,
    });
  }

  // 6. Products (25+)
  console.log("  → Products");
  const productIds: string[] = [];
  const productRecords: Array<{ id: string; businessLineId: string; name: string }> = [];
  for (const [code, names] of Object.entries(PRODUCT_NAMES)) {
    const blId = bizLineIds[code];
    if (!blId) continue;
    for (const name of names) {
      const price = rand(10, 5000);
      const [inserted] = await db.insert(schema.products).values({
        sku: `DEMO-${code}-${productIds.length + 1}`,
        name,
        businessLineId: blId,
        unit: pick(["PC", "KG", "TON", "M", "M2", "SET", "BOX", "ROLL", "BAG", "CTN"]),
        origin: pick(["China", "India", "Turkey", "Egypt", "UAE", "Italy"]),
        moq: randInt(10, 1000),
        leadTimeDays: randInt(7, 60),
        referenceCost: (price * 0.7).toFixed(2),
        referencePrice: price.toFixed(2),
        currency: "USD",
        active: true,
      }).returning();
      productIds.push(inserted.id);
      productRecords.push({ id: inserted.id, businessLineId: blId, name });
    }
  }

  // 7. Profiles (admin + users)
  console.log("  → Profiles");
  const adminPassword = await hashPassword("admin123");
  const [admin] = await db.insert(schema.profiles).values({
    email: "admin@rsnexus.com", passwordHash: adminPassword,
    fullName: "System Administrator", role: "super_admin", branchId: branchIds[0],
  }).returning();

  const salesPassword = await hashPassword("sales123");
  const [salesUser] = await db.insert(schema.profiles).values({
    email: "sales@rsnexus.com", passwordHash: salesPassword,
    fullName: "Ahmed Mansour", role: "sales", branchId: branchIds[0],
  }).returning();

  const [gmUser] = await db.insert(schema.profiles).values({
    email: "gm@rsnexus.com", passwordHash: await hashPassword("gm123"),
    fullName: "Khalid Ibrahim", role: "general_manager", branchId: branchIds[0],
  }).returning();

  const [mktUser] = await db.insert(schema.profiles).values({
    email: "marketing@rsnexus.com", passwordHash: await hashPassword("mkt123"),
    fullName: "Sara El-Sayed", role: "marketing", branchId: branchIds[0],
  }).returning();

  const [srcUser] = await db.insert(schema.profiles).values({
    email: "sourcing@rsnexus.com", passwordHash: await hashPassword("src123"),
    fullName: "Mohamed Ali", role: "sourcing", branchId: branchIds[2],
  }).returning();

  const ownerIds = [admin.id, salesUser.id, gmUser.id, mktUser.id, srcUser.id];

  // 8. Companies (30)
  console.log("  → Companies");
  const companyIds: string[] = [];
  for (let i = 0; i < 30; i++) {
    const country = pick(COUNTRIES);
    const [inserted] = await db.insert(schema.companies).values({
      name: `DEMO: ${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)} ${i + 1}`,
      legalName: `${pick(COMPANY_PREFIXES)} International Ltd.`,
      country, city: pick(["Capital City", "Industrial Zone", "Port District"]),
      industry: pick(INDUSTRIES),
      companyType: pick(COMPANY_TYPES),
      website: `https://demo-company-${i + 1}.example.com`,
      branchId: pick(branchIds),
      ownerId: pick(ownerIds),
      notes: "DEMO company record for RS Nexus evaluation.",
    }).returning();
    companyIds.push(inserted.id);
  }

  // 9. Contacts (50)
  console.log("  → Contacts");
  const contactIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const [inserted] = await db.insert(schema.contacts).values({
      companyId: pick(companyIds),
      firstName: first, lastName: last,
      jobTitle: pick(["Procurement Manager", "CEO", "Import Director", "Purchasing Officer", "Operations Manager", "General Manager"]),
      department: pick(["Procurement", "Management", "Operations", "Purchasing"]),
      email: `demo.${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `+${randInt(10, 99)} ${randInt(100, 999)} ${randInt(1000000, 9999999)}`,
      whatsapp: `+${randInt(10, 99)} ${randInt(100, 999)} ${randInt(1000000, 9999999)}`,
      country: pick(COUNTRIES),
      preferredLanguage: pick(["English", "Arabic", "French", "Chinese", "Hindi"]),
      isDecisionMaker: Math.random() > 0.6,
      influenceLevel: pick(["high", "medium", "low"]),
    }).returning();
    contactIds.push(inserted.id);
  }

  // 10. Campaigns
  console.log("  → Campaigns");
  const campaignIds: string[] = [];
  const campaignNames = [
    "Q1 Building Materials Push", "Ramadan Food Campaign", "East Africa Expansion",
    "LinkedIn B2B Outreach", "Google Search - Electrical Cables", "Exhibition Cairo 2026",
    "Marble & Granite UAE", "Machinery India Campaign",
  ];
  for (const name of campaignNames) {
    const [inserted] = await db.insert(schema.campaigns).values({
      name, businessLineId: pick(Object.values(bizLineIds)),
      country: pick(COUNTRIES), audience: "B2B Importers",
      channel: pick(["google_ads", "meta_ads", "linkedin_ads", "exhibitions", "email"] as const),
      budget: rand(5000, 50000).toFixed(2),
      spend: rand(1000, 30000).toFixed(2),
      impressions: randInt(5000, 200000), clicks: randInt(200, 5000),
      startDate: toIsoDate(daysAgo(randInt(10, 90))),
      endDate: toIsoDate(daysFromNow(randInt(10, 60))),
      ownerId: pick(ownerIds),
      status: pick(["active", "planned", "completed"] as const),
    }).returning();
    campaignIds.push(inserted.id);
  }

  // 11. Leads (100)
  console.log("  → Leads");
  const leadIds: string[] = [];
  const leadStatuses: LeadStatus[] = [
    "new", "contacted", "qualified", "requirement_received", "sourcing",
    "quotation_sent", "negotiation", "won", "lost", "nurture",
  ];
  for (let i = 0; i < 100; i++) {
    const status = pick(leadStatuses);
    const estimatedValue = rand(5000, 500000);
    const product = pick(productRecords);
    const [inserted] = await db.insert(schema.leads).values({
      companyId: pick(companyIds), contactId: pick(contactIds),
      country: pick(COUNTRIES), city: "Capital City",
      industry: pick(INDUSTRIES),
      customerType: pick(["Importer", "Distributor", "Wholesaler", "Contractor"]),
      businessLineId: product.businessLineId, productId: product.id,
      requirement: `DEMO: Looking for ${product.name} in bulk quantities for import.`,
      quantity: randInt(100, 10000).toString(), unit: "PC",
      budget: estimatedValue.toFixed(2), currency: "USD",
      sourceId: pick(sourceIds), campaignId: pick(campaignIds),
      ownerId: pick(ownerIds), branchId: pick(branchIds),
      priority: pick(["low", "normal", "high", "urgent"] as const),
      status, estimatedValue: estimatedValue.toFixed(2),
      expectedCloseDate: toIsoDate(daysFromNow(randInt(-30, 120))),
      lastActivityAt: daysAgo(randInt(0, 30)),
      nextFollowUp: daysFromNow(randInt(0, 14)),
      utmSource: pick(["google", "linkedin", "facebook", "direct"]),
      utmCampaign: "demo-campaign",
    }).returning();
    leadIds.push(inserted.id);
  }

  // 12. Suppliers (20)
  console.log("  → Suppliers");
  const supplierIds: string[] = [];
  const supplierCountries = ["China", "India", "Turkey", "Egypt", "UAE", "Italy", "Vietnam"];
  for (let i = 0; i < 20; i++) {
    const [inserted] = await db.insert(schema.suppliers).values({
      name: `DEMO: ${pick(COMPANY_PREFIXES)} Industries ${i + 1}`,
      country: pick(supplierCountries), city: "Industrial Zone",
      contactName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `supplier${i + 1}@demo.example.com`,
      phone: `+${randInt(10, 99)} ${randInt(100, 999)} ${randInt(1000000, 9999999)}`,
      isManufacturer: Math.random() > 0.4,
      businessLineIds: [pick(Object.values(bizLineIds)), pick(Object.values(bizLineIds))],
      productIds: [pick(productIds), pick(productIds)],
      moq: randInt(50, 5000), leadTimeDays: randInt(7, 45),
      paymentTerms: pick(["30% advance, 70% against BL", "LC at sight", "TT 100% in advance", "CAD"]),
      shippingCapability: "FOB, CIF, CFR", exportCapability: "Worldwide",
      certifications: pick([["ISO 9001"], ["ISO 9001", "CE"], ["CE", "RoHS"], ["ISO 9001", "ISO 14001"]]),
      verificationStatus: pick(["verified", "under_review", "verified", "verified", "unverified"] as const),
      verificationExpiry: toIsoDate(daysFromNow(randInt(30, 365))),
    }).returning();
    supplierIds.push(inserted.id);
  }

  // 13. Opportunities (40)
  console.log("  → Opportunities");
  const opportunityIds: string[] = [];
  const stages: OpportunityStage[] = [
    "new_lead", "contacted", "qualified", "requirement_received", "sourcing",
    "quotation_preparation", "quotation_sent", "negotiation", "verbal_agreement", "won", "lost",
  ];
  for (let i = 0; i < 40; i++) {
    const stage = pick(stages);
    const estimatedValue = rand(10000, 750000);
    const probability = stage === "won" ? 100 : stage === "lost" ? 0 : randInt(10, 90);
    const product = pick(productRecords);
    const [inserted] = await db.insert(schema.opportunities).values({
      name: `DEMO: ${product.name} deal - ${pick(COUNTRIES)}`,
      companyId: pick(companyIds), contactId: pick(contactIds),
      leadId: pick(leadIds), productId: product.id,
      businessLineId: product.businessLineId, country: pick(COUNTRIES),
      quantity: randInt(100, 10000).toString(), unit: "PC",
      estimatedValue: estimatedValue.toFixed(2), currency: "USD",
      probability, expectedCloseDate: toIsoDate(daysFromNow(randInt(-10, 120))),
      ownerId: pick(ownerIds), branchId: pick(branchIds),
      sourceId: pick(sourceIds), campaignId: pick(campaignIds),
      supplierId: stage !== "new_lead" && stage !== "contacted" ? pick(supplierIds) : undefined,
      requirement: `DEMO: Bulk purchase requirement for ${product.name}`,
      stage,
      lostReason: stage === "lost" ? pick(["Price too high", "Competitor won", "Customer cancelled", "Requirements unclear"]) : undefined,
      lastActivityAt: daysAgo(randInt(0, 20)),
    }).returning();
    opportunityIds.push(inserted.id);
  }

  // 14. Sourcing Requests
  console.log("  → Sourcing Requests");
  const sourcingIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const product = pick(productRecords);
    const [inserted] = await db.insert(schema.sourcingRequests).values({
      customerId: pick(companyIds), opportunityId: pick(opportunityIds),
      productId: product.id, specifications: `DEMO: Looking for ${product.name} with quality certifications`,
      quantity: randInt(100, 5000).toString(), unit: "PC",
      destination: pick(COUNTRIES), targetPrice: rand(10, 500).toFixed(2),
      requiredDate: toIsoDate(daysFromNow(randInt(15, 90))),
      ownerId: pick([srcUser.id, admin.id]),
      status: pick(["new", "searching", "suppliers_identified", "quotes_received", "selected", "completed"] as const),
    }).returning();
    sourcingIds.push(inserted.id);
  }

  // 15. Supplier Quotes
  console.log("  → Supplier Quotes");
  for (const srcId of sourcingIds) {
    const nQuotes = randInt(2, 4);
    for (let j = 0; j < nQuotes; j++) {
      await db.insert(schema.supplierQuotes).values({
        sourcingRequestId: srcId, supplierId: pick(supplierIds),
        price: rand(10, 500).toFixed(2), currency: "USD",
        moq: randInt(50, 1000), leadTimeDays: randInt(7, 45),
        paymentTerms: pick(["30% advance", "LC at sight", "TT"]),
        selected: j === 0 && Math.random() > 0.5,
      });
    }
  }

  // 16. Quotations (20)
  console.log("  → Quotations");
  const quotationIds: string[] = [];
  const qtStatuses: QuotationStatus[] = [
    "draft", "internal_review", "sent", "viewed", "negotiation", "accepted", "rejected", "expired",
  ];
  for (let i = 0; i < 20; i++) {
    const subtotal = rand(5000, 200000);
    const discountPct = rand(0, 10);
    const discountAmount = subtotal * discountPct / 100;
    const shipping = rand(500, 5000);
    const taxPct = rand(0, 14);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * taxPct / 100;
    const grandTotal = afterDiscount + shipping + taxAmount;
    const [inserted] = await db.insert(schema.quotations).values({
      quotationNumber: `DEMO-QT-${String(1000 + i).padStart(5, "0")}`,
      companyId: pick(companyIds), contactId: pick(contactIds),
      opportunityId: pick(opportunityIds), branchId: pick(branchIds),
      currency: "USD", subtotal: subtotal.toFixed(2),
      discountPct: discountPct.toFixed(2), discountAmount: discountAmount.toFixed(2),
      shippingAmount: shipping.toFixed(2),
      taxPct: taxPct.toFixed(2), taxAmount: taxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      incoterm: pick(["FOB", "CIF", "CFR", "EXW", "DAP"]),
      paymentTerms: "30% advance, 70% against BL copy",
      validityDays: 30, deliveryEstimate: "30-45 days after order confirmation",
      status: pick(qtStatuses),
      issuedAt: daysAgo(randInt(0, 60)),
      validUntil: toIsoDate(daysFromNow(randInt(-10, 30))),
    }).returning();
    quotationIds.push(inserted.id);

    // Items
    const nItems = randInt(1, 4);
    for (let j = 0; j < nItems; j++) {
      const product = pick(productRecords);
      const qty = randInt(10, 500);
      const price = rand(50, 2000);
      await db.insert(schema.quotationItems).values({
        quotationId: inserted.id, productId: product.id,
        description: product.name, quantity: qty.toString(),
        unit: "PC", unitPrice: price.toFixed(2), total: (qty * price).toFixed(2),
      });
    }
  }

  // 17. Orders (15)
  console.log("  → Orders");
  const orderIds: string[] = [];
  const acceptedQuotations = quotationIds.slice(0, 15);
  const ordStatuses: OrderStatus[] = [
    "draft", "confirmed", "processing", "ready_to_ship", "shipped", "delivered",
  ];
  for (let i = 0; i < 15; i++) {
    const [inserted] = await db.insert(schema.orders).values({
      orderNumber: `DEMO-ORD-${String(5000 + i).padStart(5, "0")}`,
      companyId: pick(companyIds), quotationId: acceptedQuotations[i],
      opportunityId: pick(opportunityIds), branchId: pick(branchIds),
      ownerId: pick(ownerIds), currency: "USD",
      totalAmount: rand(10000, 200000).toFixed(2),
      paymentStatus: pick(["unpaid", "partial", "paid"] as const),
      status: pick(ordStatuses),
      expectedDelivery: toIsoDate(daysFromNow(randInt(10, 90))),
    }).returning();
    orderIds.push(inserted.id);
  }

  // 18. Shipments
  console.log("  → Shipments");
  const shpStatuses: ShipmentStatus[] = [
    "preparing", "booked", "in_transit", "arrived", "customs", "delivered", "delayed",
  ];
  for (let i = 0; i < 12; i++) {
    await db.insert(schema.shipments).values({
      shipmentNumber: `DEMO-SHP-${String(2000 + i).padStart(5, "0")}`,
      orderId: pick(orderIds), companyId: pick(companyIds),
      origin: pick(["Shanghai, China", "Mundra, India", "Istanbul, Turkey", "Alexandria, Egypt"]),
      destination: pick(["Kigali, Rwanda", "Dar es Salaam, Tanzania", "Dubai, UAE", "Cairo, Egypt"]),
      carrier: pick(["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "COSCO"]),
      container: `MSKU${randInt(1000000, 9999999)}`,
      trackingReference: `TRK${randInt(10000000, 99999999)}`,
      etd: toIsoDate(daysFromNow(randInt(-10, 30))),
      eta: toIsoDate(daysFromNow(randInt(10, 60))),
      status: pick(shpStatuses),
    });
  }

  // 19. Activities (spread across records)
  console.log("  → Activities");
  const activityTypes: ActivityType[] = [
    "call", "email", "whatsapp", "meeting", "follow_up", "note",
  ];
  for (let i = 0; i < 120; i++) {
    await db.insert(schema.activities).values({
      type: pick(activityTypes),
      subject: pick([
        "Initial discovery call", "Follow-up email sent", "WhatsApp conversation",
        "Requirements meeting", "Quotation discussion", "Site visit scheduled",
        "Price negotiation", "Sample review", "Contract review",
      ]),
      description: "DEMO activity record",
      companyId: pick(companyIds), contactId: pick(contactIds),
      leadId: Math.random() > 0.5 ? pick(leadIds) : undefined,
      opportunityId: Math.random() > 0.5 ? pick(opportunityIds) : undefined,
      supplierId: Math.random() > 0.7 ? pick(supplierIds) : undefined,
      ownerId: pick(ownerIds),
      occurredAt: daysAgo(randInt(0, 60)),
    });
  }

  // 20. Tasks (30)
  console.log("  → Tasks");
  const taskStatuses: TaskStatus[] = [
    "pending", "in_progress", "completed",
  ];
  for (let i = 0; i < 30; i++) {
    await db.insert(schema.tasks).values({
      title: pick([
        "Follow up with client on quotation", "Send product catalog",
        "Schedule demo meeting", "Prepare sourcing brief",
        "Review supplier credentials", "Update CRM records",
        "Send weekly report", "Call logistics partner",
        "Draft email introduction", "Prepare presentation",
      ]),
      description: "DEMO task for RS Nexus evaluation",
      ownerId: pick(ownerIds),
      dueDate: daysFromNow(randInt(-10, 30)),
      priority: pick(["low", "normal", "high", "urgent"] as const),
      status: pick(taskStatuses),
      entityType: pick(["lead", "opportunity", "company"]),
      entityId: pick([...leadIds, ...opportunityIds, ...companyIds]),
    });
  }

  // 21. Employees
  console.log("  → Employees");
  const employeeIds: string[] = [];
  const empData = [
    { name: "Ahmed Mansour", code: "EMP001", department: "Sales", role: "Senior Sales Executive" },
    { name: "Sara El-Sayed", code: "EMP002", department: "Marketing", role: "Marketing Manager" },
    { name: "Mohamed Ali", code: "EMP003", department: "Sourcing", role: "Sourcing Specialist" },
    { name: "Khalid Ibrahim", code: "EMP004", department: "Management", role: "General Manager" },
    { name: "Fatima Hassan", code: "EMP005", department: "Finance", role: "Finance Officer" },
    { name: "Omar Nkosi", code: "EMP006", department: "Sales", role: "Sales Executive - Africa" },
    { name: "Layla Wang", code: "EMP007", department: "Sourcing", role: "Sourcing - China" },
    { name: "Tariq Khan", code: "EMP008", department: "Logistics", role: "Logistics Coordinator" },
  ];
  for (const e of empData) {
    const [inserted] = await db.insert(schema.employees).values({
      ...e, email: `${e.code.toLowerCase()}@rsnexus.com`,
      phone: `+20 1${randInt(0, 9)} ${randInt(10000000, 99999999)}`,
      branchId: pick(branchIds), joinDate: toIsoDate(daysAgo(randInt(100, 1500))),
      status: "active",
    }).returning();
    employeeIds.push(inserted.id);
  }

  // 22. Attendance Locations
  console.log("  → Attendance");
  const [loc1] = await db.insert(schema.attendanceLocations).values({
    name: "Cairo HQ Office", branchId: branchIds[0],
    latitude: "30.0444", longitude: "31.2357", radiusMeters: 100, active: true,
  }).returning();
  await db.insert(schema.attendanceLocations).values({
    name: "Dubai Office", branchId: branchIds[2],
    latitude: "25.2048", longitude: "55.2708", radiusMeters: 100, active: true,
  });

  // Attendance records (last 30 days for all employees)
  for (const empId of employeeIds) {
    for (let d = 0; d < 25; d++) {
      // Skip weekends
      const date = daysAgo(d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const checkIn = new Date(date);
      checkIn.setHours(8 + (Math.random() > 0.85 ? 1 : 0), Math.floor(Math.random() * 60), 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      await db.insert(schema.attendanceRecords).values({
        employeeId: empId, date: toIsoDate(date),
        checkInAt: checkIn, checkOutAt: checkOut,
        checkInType: "office",
        checkInLat: "30.0444", checkInLng: "31.2357",
        checkInAccuracy: (Math.random() * 15).toFixed(2),
        checkInDistance: (Math.random() * 50).toFixed(2),
        locationId: loc1.id,
        status: checkIn.getHours() >= 9 ? "late" : "present",
      }).catch(() => {});
    }
  }

  // 23. Leave Types
  console.log("  → Leave Types");
  const leaveTypeIds: string[] = [];
  for (const name of ["Annual", "Sick", "Emergency", "Unpaid", "Business Trip"]) {
    const [inserted] = await db.insert(schema.leaveTypes).values({ name }).returning();
    leaveTypeIds.push(inserted.id);
  }

  // Leave requests
  for (let i = 0; i < 8; i++) {
    await db.insert(schema.leaveRequests).values({
      employeeId: pick(employeeIds), leaveTypeId: pick(leaveTypeIds),
      startDate: toIsoDate(daysAgo(randInt(-5, 30))),
      endDate: toIsoDate(daysFromNow(randInt(1, 10))),
      reason: pick(["Family event", "Medical", "Vacation", "Personal matter"]),
      status: pick(["pending", "approved", "rejected"] as const),
    });
  }

  // 24. App Settings
  console.log("  → App Settings");
  const settings = [
    { key: "company_name", value: { value: "RS Holding Company Ltd." } },
    { key: "company_address", value: { value: "Cairo, Egypt" } },
    { key: "company_email", value: { value: "info@rsholding.com" } },
    { key: "company_phone", value: { value: "+20 2 1234 5678" } },
    { key: "base_currency", value: { value: "USD" } },
    { key: "quotation_prefix", value: { value: "QT-" } },
    { key: "order_prefix", value: { value: "ORD-" } },
    { key: "attendance_grace_minutes", value: { value: 15 } },
    { key: "ai_provider", value: { value: "mock" } },
  ];
  for (const s of settings) {
    await db.insert(schema.appSettings).values(s).onConflictDoNothing();
  }

  // 25. Content Calendar
  console.log("  → Content Calendar");
  for (let i = 0; i < 15; i++) {
    await db.insert(schema.contentCalendar).values({
      publishDate: toIsoDate(daysFromNow(randInt(-10, 30))),
      channel: pick(["LinkedIn", "Instagram", "Facebook", "Website Blog", "Email Newsletter"]),
      businessLineId: pick(Object.values(bizLineIds)),
      country: pick(COUNTRIES),
      topic: pick([
        "New Product Launch: Building Materials",
        "Case Study: Export to Rwanda",
        "Industry Insights: Marble Market 2026",
        "Behind the Scenes: Sourcing from China",
        "Customer Testimonial: Dubai Distribution",
      ]),
      contentType: pick(["post", "article", "video", "carousel", "story"]),
      ownerId: pick(ownerIds),
      status: pick(["idea", "planned", "in_production", "approved", "published"] as const),
    });
  }

  console.log("✅ Seed completed!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
