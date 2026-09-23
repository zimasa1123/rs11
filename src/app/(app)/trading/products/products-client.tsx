"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, Textarea, StatusBadge } from "@/components/ui";
import { formatCurrency, label } from "@/lib/utils";
import { createProduct } from "@/lib/actions";

export function ProductsClient({ result, searchParams, businessLines }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ currency: "USD", active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createProduct(form);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setOpen(false);
    setForm({ currency: "USD", active: true });
  }

  const columns = [
    {
      key: "name", label: "Product",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.sku}</div>
        </div>
      ),
    },
    { key: "businessLine", label: "Business Line", render: (r: any) => r.businessLine || "—" },
    { key: "unit", label: "Unit", render: (r: any) => r.unit || "—" },
    { key: "origin", label: "Origin", render: (r: any) => r.origin || "—" },
    {
      key: "referencePrice", label: "Reference Price",
      render: (r: any) => r.referencePrice ? <span className="font-medium">{formatCurrency(r.referencePrice, r.currency)}</span> : "—",
    },
    { key: "moq", label: "MOQ", render: (r: any) => r.moq || "—" },
    { key: "leadTimeDays", label: "Lead Time", render: (r: any) => r.leadTimeDays ? `${r.leadTimeDays}d` : "—" },
    { key: "active", label: "Status", render: (r: any) => <StatusBadge status={r.active ? "active" : "cancelled"} /> },
  ];

  return (
    <>
      <ListPage
        title="Products"
        subtitle={`${result.total} products in catalog`}
        columns={columns}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        search={searchParams.search}
        filters={[
          { name: "businessLineId", label: "Business Line", value: searchParams.businessLineId || "", options: businessLines.map((b: any) => ({ value: b.id, label: b.name })) },
        ]}
        onCreateClick={() => setOpen(true)}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create Product" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="SKU" value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Product Name" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Business Line" value={form.businessLineId || ""} onChange={(e) => setForm({ ...form, businessLineId: e.target.value })}>
              <option value="">Select...</option>
              {businessLines.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="PC, KG, TON..." />
            <Input label="Origin" value={form.origin || ""} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            <Input label="MOQ" type="number" value={form.moq || ""} onChange={(e) => setForm({ ...form, moq: parseInt(e.target.value) })} />
            <Input label="Lead Time (days)" type="number" value={form.leadTimeDays || ""} onChange={(e) => setForm({ ...form, leadTimeDays: parseInt(e.target.value) })} />
            <Select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="EGP">EGP</option><option value="AED">AED</option><option value="CNY">CNY</option>
            </Select>
          </div>
          <Textarea label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Reference Cost" type="number" step="0.01" value={form.referenceCost || ""} onChange={(e) => setForm({ ...form, referenceCost: e.target.value })} />
            <Input label="Reference Price" type="number" step="0.01" value={form.referencePrice || ""} onChange={(e) => setForm({ ...form, referencePrice: e.target.value })} />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Product</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
