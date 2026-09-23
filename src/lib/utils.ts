import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | string | null | undefined, currency = "USD"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!n || Number.isNaN(n)) return `${currency} 0.00`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatNumber(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "0";
  return new Intl.NumberFormat("en-US").format(v);
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const da = typeof a === "string" ? new Date(a) : a;
  const db2 = typeof b === "string" ? new Date(b) : b;
  return Math.round((db2.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function toDecimal(n: number | string | null | undefined): number {
  if (n === null || n === undefined || n === "") return 0;
  const v = typeof n === "string" ? parseFloat(n) : n;
  return Number.isNaN(v) ? 0 : v;
}

export function uid(prefix = ""): string {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 10000)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0");
  return `${prefix}${ts}-${r}`;
}

export function truncate(s: string | null | undefined, len = 80): string {
  if (!s) return "";
  return s.length > len ? `${s.slice(0, len)}…` : s;
}

export function statusColor(status: string): string {
  const s = status?.toLowerCase() || "";
  if (["won", "accepted", "delivered", "completed", "paid", "active", "verified", "approved", "published"].includes(s))
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (["lost", "rejected", "cancelled", "suspended", "expired", "overdue", "delayed"].includes(s))
    return "bg-red-100 text-red-700 border-red-200";
  if (["new", "draft", "idea", "planned", "pending", "unverified"].includes(s))
    return "bg-slate-100 text-slate-700 border-slate-200";
  if (["negotiation", "in_progress", "in_transit", "processing", "searching", "comparison", "review", "in_production", "requires_review"].includes(s))
    return "bg-amber-100 text-amber-700 border-amber-200";
  if (["contacted", "qualified", "qualified_received", "requirement_received", "sourcing", "quotation_preparation", "quotation_sent", "verbal_agreement", "confirmed", "ready_to_ship", "shipped", "customs", "booked", "arrived", "sent", "viewed", "early_leave", "late", "remote"].includes(s))
    return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function priorityColor(p: string): string {
  const s = (p || "").toLowerCase();
  if (s === "urgent") return "bg-red-100 text-red-700 border-red-200";
  if (s === "high") return "bg-orange-100 text-orange-700 border-orange-200";
  if (s === "normal") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "low") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function label(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const COUNTRIES = [
  "Egypt",
  "Rwanda",
  "Tanzania",
  "Libya",
  "India",
  "Mauritania",
  "China",
  "UAE",
  "Palestine",
  "Saudi Arabia",
  "Kenya",
  "Sudan",
  "Morocco",
  "Turkey",
];

export const BUSINESS_LINE_SEEDS = [
  { code: "AGRI", name: "Agricultural Products" },
  { code: "FOOD", name: "Premium Food" },
  { code: "BLDG", name: "Building Materials" },
  { code: "MRBL", name: "Marble & Granite" },
  { code: "SNTR", name: "Sanitary Ware" },
  { code: "ELMT", name: "Electrical Materials" },
  { code: "ELCB", name: "Electrical Cables" },
  { code: "MACH", name: "Machinery & Equipment" },
  { code: "MCMP", name: "Machine Components" },
  { code: "METL", name: "Metals & Alloys" },
  { code: "AUTO", name: "Auto Parts" },
  { code: "HCFT", name: "Handicraft Items" },
  { code: "GEN", name: "General Trading" },
  { code: "IMPEX", name: "Import / Export" },
  { code: "SRC", name: "Sourcing Services" },
];

export const LEAD_SOURCE_SEEDS = [
  "Google",
  "Meta",
  "LinkedIn",
  "Website",
  "SEO",
  "Email",
  "WhatsApp",
  "Referral",
  "Exhibition",
  "Direct Outreach",
  "Existing Customer",
  "Partner",
  "Other",
];

export const STAGE_PROBABILITY: Record<string, number> = {
  new_lead: 10,
  contacted: 20,
  qualified: 30,
  requirement_received: 45,
  sourcing: 55,
  quotation_preparation: 65,
  quotation_sent: 75,
  negotiation: 85,
  verbal_agreement: 95,
  won: 100,
  lost: 0,
};
