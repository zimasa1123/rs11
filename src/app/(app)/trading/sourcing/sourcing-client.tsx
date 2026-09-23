"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, Textarea, StatusBadge, Badge } from "@/components/ui";
import { formatCurrency, formatDate, label } from "@/lib/utils";
import { createSourcingRequest } from "@/lib/actions";

const STATUSES = ["new", "searching", "suppliers_identified", "quotes_received", "comparison", "selected", "completed", "cancelled"];

export function SourcingClient({ rows, products, companies }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ status: "new" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createSourcingRequest(form);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setOpen(false);
    setForm({ status: "new" });
  }

  const columns = [
    {
      key: "id", label: "Request",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.product || "Custom requirement"}</div>
          <div className="text-xs text-slate-500 truncate max-w-xs">{r.specifications?.slice(0, 60)}</div>
        </div>
      ),
    },
    { key: "customer", label: "Customer", render: (r: any) => r.customer || "—" },
    { key: "quantity", label: "Qty", render: (r: any) => `${r.quantity || "—"} ${r.unit || ""}` },
    { key: "destination", label: "Destination", render: (r: any) => r.destination || "—" },
    { key: "targetPrice", label: "Target", render: (r: any) => r.targetPrice ? formatCurrency(r.targetPrice) : "—" },
    { key: "quoteCount", label: "Quotes", render: (r: any) => <Badge>{r.quoteCount || 0} quotes</Badge> },
    { key: "requiredDate", label: "Required By", render: (r: any) => <span className="text-xs">{formatDate(r.requiredDate)}</span> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
    { key: "owner", label: "Owner", render: (r: any) => <span className="text-xs">{r.owner || "—"}</span> },
  ];

  return (
    <>
      <ListPage
        title="Sourcing Requests"
        subtitle={`${rows.length} active sourcing requests with supplier comparison`}
        columns={columns}
        rows={rows}
        total={rows.length}
        page={1}
        pageSize={100}
        totalPages={1}
        onCreateClick={() => setOpen(true)}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="New Sourcing Request" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select label="Customer" value={form.customerId || ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
            <option value="">Select customer...</option>
            {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Product" value={form.productId || ""} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select product...</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Textarea label="Specifications" required value={form.specifications || ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input label="Quantity" type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="PC, TON..." />
            <Input label="Destination" value={form.destination || ""} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <Input label="Target Price (USD)" type="number" value={form.targetPrice || ""} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
          </div>
          <Input label="Required By" type="date" value={form.requiredDate || ""} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} />
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
