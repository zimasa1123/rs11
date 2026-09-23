"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, Textarea, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createLead } from "@/lib/actions";

const LEAD_STATUSES = ["new", "contacted", "qualified", "requirement_received", "sourcing", "quotation_preparation", "quotation_sent", "negotiation", "won", "lost", "nurture"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const COUNTRIES = ["Egypt", "Rwanda", "Tanzania", "Libya", "India", "Mauritania", "China", "UAE", "Palestine", "Saudi Arabia"];

export function LeadsPageClient({ result, searchParams, referenceData }: {
  result: any;
  searchParams: any;
  referenceData: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({
    status: "new", priority: "normal", country: "", currency: "USD",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createLead(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setForm({ status: "new", priority: "normal", country: "", currency: "USD" });
  }

  const columns = [
    {
      key: "company",
      label: "Company",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.company || "Unknown"}</div>
          <div className="text-xs text-slate-500">{r.contact}</div>
        </div>
      ),
    },
    {
      key: "country",
      label: "Country",
      render: (r: any) => <span>{r.country || "—"}</span>,
    },
    {
      key: "businessLine",
      label: "Business Line",
      render: (r: any) => <span className="text-xs">{r.businessLine || "—"}</span>,
    },
    {
      key: "product",
      label: "Product Interest",
      render: (r: any) => <span className="text-xs text-slate-700 truncate max-w-[200px] block">{r.product || "—"}</span>,
    },
    {
      key: "estimatedValue",
      label: "Est. Value",
      render: (r: any) => r.estimatedValue ? <span className="font-medium">{formatCurrency(r.estimatedValue, r.currency)}</span> : <span className="text-slate-400">—</span>,
    },
    {
      key: "priority",
      label: "Priority",
      render: (r: any) => r.priority ? <StatusBadge status={r.priority} /> : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r: any) => <StatusBadge status={r.status || ""} />,
    },
    {
      key: "owner",
      label: "Owner",
      render: (r: any) => <span className="text-xs">{r.owner || "—"}</span>,
    },
    {
      key: "expectedCloseDate",
      label: "Expected Close",
      render: (r: any) => <span className="text-xs">{r.expectedCloseDate ? formatDate(r.expectedCloseDate) : "—"}</span>,
    },
  ];

  return (
    <>
      <ListPage
        title="Leads"
        subtitle={`${result.total} total leads • From Lead to Shipment`}
        columns={columns}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        search={searchParams.search}
        filters={[
          {
            name: "status", label: "Status", value: searchParams.status || "",
            options: LEAD_STATUSES.map((s) => ({ value: s, label: s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") })),
          },
          {
            name: "businessLineId", label: "Business Line", value: searchParams.businessLineId || "",
            options: referenceData.businessLines.map((b: any) => ({ value: b.id, label: b.name })),
          },
          {
            name: "country", label: "Country", value: searchParams.country || "",
            options: COUNTRIES.map((c) => ({ value: c, label: c })),
          },
          {
            name: "ownerId", label: "Owner", value: searchParams.ownerId || "",
            options: referenceData.owners.map((o: any) => ({ value: o.id, label: o.fullName })),
          },
        ]}
        onCreateClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create New Lead" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Company" value={form.companyId || ""} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">Select company...</option>
              {referenceData.companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Contact" value={form.contactId || ""} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
              <option value="">Select contact...</option>
              {referenceData.contacts.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </Select>
            <Select label="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Select...</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="City" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Select label="Business Line" value={form.businessLineId || ""} onChange={(e) => setForm({ ...form, businessLineId: e.target.value })}>
              <option value="">Select...</option>
              {referenceData.businessLines.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select label="Product Interest" value={form.productId || ""} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select...</option>
              {referenceData.products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select label="Source" value={form.sourceId || ""} onChange={(e) => setForm({ ...form, sourceId: e.target.value })}>
              <option value="">Select...</option>
              {referenceData.sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Campaign" value={form.campaignId || ""} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
              <option value="">Select...</option>
              {referenceData.campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <Textarea label="Requirement" value={form.requirement || ""} onChange={(e) => setForm({ ...form, requirement: e.target.value })} placeholder="Describe the customer's requirement..." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input label="Quantity" type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="PC, KG..." />
            <Input label="Budget" type="number" value={form.budget || ""} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <Select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="EGP">EGP</option><option value="AED">AED</option><option value="CNY">CNY</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input label="Estimated Value" type="number" value={form.estimatedValue || ""} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            <Input label="Expected Close" type="date" value={form.expectedCloseDate || ""} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Owner" value={form.ownerId || ""} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
              <option value="">Unassigned</option>
              {referenceData.owners.map((o: any) => <option key={o.id} value={o.id}>{o.fullName}</option>)}
            </Select>
            <Select label="Branch" value={form.branchId || ""} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">Default</option>
              {referenceData.branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Lead</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
