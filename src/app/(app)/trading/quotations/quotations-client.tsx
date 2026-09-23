"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, StatusBadge, Badge } from "@/components/ui";
import { formatCurrency, formatDate, label } from "@/lib/utils";
import { createQuotation } from "@/lib/actions";

const QT_STATUSES = ["draft", "internal_review", "sent", "viewed", "negotiation", "accepted", "rejected", "expired", "cancelled"];
const INCOTERMS = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];

export function QuotationsClient({ result, searchParams, companies, contacts }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ currency: "USD", status: "draft", validityDays: 30, discountPct: 0, taxPct: 0, shippingAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = parseFloat(form.subtotal || "0");
  const discountPct = parseFloat(form.discountPct || "0");
  const discountAmount = subtotal * discountPct / 100;
  const shipping = parseFloat(form.shippingAmount || "0");
  const taxPct = parseFloat(form.taxPct || "0");
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * taxPct / 100;
  const grandTotal = afterDiscount + shipping + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createQuotation({
      ...form,
      subtotal, discountAmount, shippingAmount: shipping, taxAmount, grandTotal,
    });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setOpen(false);
    setForm({ currency: "USD", status: "draft", validityDays: 30, discountPct: 0, taxPct: 0, shippingAmount: 0 });
  }

  const columns = [
    {
      key: "quotationNumber", label: "Number",
      render: (r: any) => <div className="font-mono font-medium text-slate-900">{r.quotationNumber}</div>,
    },
    { key: "company", label: "Customer", render: (r: any) => r.company || "—" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
    { key: "incoterm", label: "Incoterm", render: (r: any) => r.incoterm ? <Badge>{r.incoterm}</Badge> : "—" },
    {
      key: "grandTotal", label: "Total",
      render: (r: any) => <span className="font-medium">{formatCurrency(r.grandTotal, r.currency)}</span>,
    },
    { key: "validUntil", label: "Valid Until", render: (r: any) => <span className="text-xs">{formatDate(r.validUntil)}</span> },
    { key: "issuedAt", label: "Issued", render: (r: any) => <span className="text-xs">{formatDate(r.issuedAt)}</span> },
  ];

  return (
    <>
      <ListPage
        title="Quotations"
        subtitle={`${result.total} quotations • Total value: ${formatCurrency(result.rows.reduce((s: number, r: any) => s + parseFloat(r.grandTotal || 0), 0))}`}
        columns={columns}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        search={searchParams.search}
        filters={[
          { name: "status", label: "Status", value: searchParams.status || "", options: QT_STATUSES.map((s) => ({ value: s, label: label(s) })) },
        ]}
        onCreateClick={() => setOpen(true)}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create Quotation" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Customer" required value={form.companyId || ""} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">Select...</option>
              {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Contact" value={form.contactId || ""} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
              <option value="">Select...</option>
              {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </Select>
            <Select label="Incoterm" value={form.incoterm || ""} onChange={(e) => setForm({ ...form, incoterm: e.target.value })}>
              <option value="">Select...</option>
              {INCOTERMS.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
            <Select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="EGP">EGP</option><option value="AED">AED</option>
            </Select>
            <Input label="Validity (days)" type="number" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) })} />
            <Input label="Payment Terms" value={form.paymentTerms || ""} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
          </div>
          <div className="p-3 bg-slate-50 rounded-md grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input label="Subtotal" type="number" step="0.01" value={form.subtotal || ""} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
            <Input label="Discount %" type="number" step="0.01" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} />
            <Input label="Shipping" type="number" step="0.01" value={form.shippingAmount} onChange={(e) => setForm({ ...form, shippingAmount: e.target.value })} />
            <Input label="Tax %" type="number" step="0.01" value={form.taxPct} onChange={(e) => setForm({ ...form, taxPct: e.target.value })} />
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Grand Total</span>
              <span className="text-xl font-bold">{formatCurrency(grandTotal, form.currency)}</span>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Quotation</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
