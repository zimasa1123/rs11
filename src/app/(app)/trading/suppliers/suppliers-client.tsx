"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, Textarea, StatusBadge, Badge } from "@/components/ui";
import { label } from "@/lib/utils";
import { createSupplier } from "@/lib/actions";
import { ShieldCheck } from "lucide-react";

const VERIFICATIONS = ["unverified", "under_review", "verified", "suspended"];
const SUPPLIER_COUNTRIES = ["China", "India", "Turkey", "Egypt", "UAE", "Italy", "Vietnam", "Thailand", "Germany", "USA"];

export function SuppliersClient({ result, searchParams }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ verificationStatus: "unverified", isManufacturer: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createSupplier(form);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setOpen(false);
    setForm({ verificationStatus: "unverified", isManufacturer: false });
  }

  const columns = [
    {
      key: "name", label: "Supplier",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.contactName || ""}</div>
        </div>
      ),
    },
    { key: "country", label: "Country", render: (r: any) => `${r.country || "—"}${r.city ? `, ${r.city}` : ""}` },
    { key: "email", label: "Email", render: (r: any) => <span className="text-xs">{r.email || "—"}</span> },
    {
      key: "isManufacturer", label: "Type",
      render: (r: any) => <Badge>{r.isManufacturer ? "Manufacturer" : "Trader"}</Badge>,
    },
    { key: "moq", label: "MOQ", render: (r: any) => r.moq || "—" },
    { key: "leadTimeDays", label: "Lead Time", render: (r: any) => r.leadTimeDays ? `${r.leadTimeDays}d` : "—" },
    {
      key: "verificationStatus", label: "Verification",
      render: (r: any) => <StatusBadge status={r.verificationStatus || ""} />,
    },
  ];

  const verified = result.rows.filter((r: any) => r.verificationStatus === "verified").length;

  return (
    <>
      <ListPage
        title="Suppliers"
        subtitle={`${result.total} suppliers • ${verified} verified`}
        columns={columns}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        search={searchParams.search}
        filters={[
          { name: "verificationStatus", label: "Verification", value: searchParams.verificationStatus || "", options: VERIFICATIONS.map((v) => ({ value: v, label: label(v) })) },
        ]}
        onCreateClick={() => setOpen(true)}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Add Supplier" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Supplier Name" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Contact Name" value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            <Select label="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Select...</option>
              {SUPPLIER_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="City" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="Email" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="WhatsApp" value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <Input label="Website" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <Select label="Type" value={form.isManufacturer ? "m" : "t"} onChange={(e) => setForm({ ...form, isManufacturer: e.target.value === "m" })}>
              <option value="m">Manufacturer</option><option value="t">Trader</option>
            </Select>
            <Select label="Verification" value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}>
              {VERIFICATIONS.map((v) => <option key={v} value={v}>{label(v)}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="MOQ" type="number" value={form.moq || ""} onChange={(e) => setForm({ ...form, moq: parseInt(e.target.value) })} />
            <Input label="Lead Time (days)" type="number" value={form.leadTimeDays || ""} onChange={(e) => setForm({ ...form, leadTimeDays: parseInt(e.target.value) })} />
          </div>
          <Textarea label="Payment Terms" value={form.paymentTerms || ""} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Add Supplier</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
