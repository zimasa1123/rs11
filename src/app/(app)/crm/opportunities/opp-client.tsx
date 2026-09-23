"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPage } from "@/components/list-page";
import { Button, Card, Modal, Input, Select, Textarea, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate, label, toDecimal } from "@/lib/utils";
import { createOpportunity, updateOpportunity } from "@/lib/actions";
import { LayoutGrid, List, GripVertical, Plus } from "lucide-react";

const STAGES = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "requirement_received", label: "Requirement" },
  { id: "sourcing", label: "Sourcing" },
  { id: "quotation_preparation", label: "Qt Prep" },
  { id: "quotation_sent", label: "Qt Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "verbal_agreement", label: "Verbal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

const COUNTRIES = ["Egypt", "Rwanda", "Tanzania", "Libya", "India", "Mauritania", "China", "UAE", "Palestine", "Saudi Arabia"];

export function OpportunitiesClient({ result, searchParams, view, referenceData }: any) {
  const router = useRouter();
  const sp = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<any>({ stage: "new_lead", probability: 10, currency: "USD" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createOpportunity({ ...form, name: form.name || `New Opportunity` });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setCreateOpen(false);
    setForm({ stage: "new_lead", probability: 10, currency: "USD" });
  }

  async function handleStageChange(id: string, stage: string) {
    await updateOpportunity(id, { stage });
  }

  const pipelineByStage = STAGES.map((s) => {
    const opps = result.rows.filter((r: any) => r.stage === s.id);
    const value = opps.reduce((sum: number, o: any) => sum + toDecimal(o.estimatedValue), 0);
    const weighted = opps.reduce((sum: number, o: any) => sum + toDecimal(o.estimatedValue) * (toDecimal(o.probability) / 100), 0);
    return { ...s, opps, value, weighted };
  });

  const totalPipeline = pipelineByStage.filter((s) => !["won", "lost"].includes(s.id)).reduce((s, p) => s + p.value, 0);
  const weightedPipeline = pipelineByStage.filter((s) => !["won", "lost"].includes(s.id)).reduce((s, p) => s + p.weighted, 0);

  if (view === "kanban") {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1">
              {result.total} opportunities • Pipeline: {formatCurrency(totalPipeline)} • Weighted: {formatCurrency(weightedPipeline)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-300 rounded-md overflow-hidden">
              <button onClick={() => router.push(`/crm/opportunities?view=list`)} className="px-3 py-1.5 text-sm bg-white hover:bg-slate-50 flex items-center gap-1.5 border-r border-slate-300">
                <List size={14} /> List
              </button>
              <button onClick={() => router.push(`/crm/opportunities?view=kanban`)} className="px-3 py-1.5 text-sm bg-slate-900 text-white flex items-center gap-1.5">
                <LayoutGrid size={14} /> Kanban
              </button>
            </div>
            <Button onClick={() => setCreateOpen(true)}><Plus size={16} /> New</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-3 pb-4" style={{ minWidth: "max-content" }}>
            {pipelineByStage.map((stage) => (
              <div key={stage.id} className="w-72 bg-slate-100 rounded-lg flex flex-col" style={{ maxHeight: "calc(100vh - 220px)" }}>
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-slate-900">{stage.label}</div>
                    <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{stage.opps.length}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatCurrency(stage.value)} • W: {formatCurrency(stage.weighted)}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stage.opps.map((o: any) => (
                    <div
                      key={o.id}
                      onClick={() => router.push(`/crm/opportunities/${o.id}`)}
                      className="bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                    >
                      <div className="flex items-start gap-1">
                        <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{o.name}</div>
                          <div className="text-xs text-slate-500 truncate">{o.company || "No company"}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs font-semibold text-slate-900">
                              {formatCurrency(o.estimatedValue, o.currency)}
                            </div>
                            <div className="text-xs text-slate-500">{o.probability}%</div>
                          </div>
                          {(o.product || o.businessLine) && (
                            <div className="text-xs text-slate-500 mt-1 truncate">
                              {o.product || o.businessLine}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500">{o.country || "—"}</span>
                            <span className="text-xs text-slate-500">{o.owner?.split(" ")[0] || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stage.opps.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-6">No opportunities</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <CreateOppModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={loading} error={error} form={form} setForm={setForm} referenceData={referenceData} />
      </div>
    );
  }

  // List view
  const columns = [
    {
      key: "name", label: "Opportunity",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.company || "—"}</div>
        </div>
      ),
    },
    { key: "stage", label: "Stage", render: (r: any) => <StatusBadge status={r.stage || ""} /> },
    { key: "country", label: "Country", render: (r: any) => r.country || "—" },
    { key: "product", label: "Product", render: (r: any) => <span className="text-xs">{r.product || "—"}</span> },
    {
      key: "estimatedValue", label: "Value",
      render: (r: any) => r.estimatedValue ? <span className="font-medium">{formatCurrency(r.estimatedValue, r.currency)}</span> : "—",
    },
    { key: "probability", label: "Prob.", render: (r: any) => <span>{r.probability || 0}%</span> },
    {
      key: "weighted", label: "Weighted",
      render: (r: any) => <span className="text-xs font-medium">{formatCurrency(toDecimal(r.estimatedValue) * (toDecimal(r.probability) / 100), r.currency)}</span>,
    },
    { key: "expectedCloseDate", label: "Close", render: (r: any) => <span className="text-xs">{r.expectedCloseDate ? formatDate(r.expectedCloseDate) : "—"}</span> },
    { key: "owner", label: "Owner", render: (r: any) => <span className="text-xs">{r.owner || "—"}</span> },
  ];

  return (
    <>
      <ListPage
        title="Opportunities"
        subtitle={`${result.total} opportunities • Pipeline: ${formatCurrency(totalPipeline)} • Weighted: ${formatCurrency(weightedPipeline)}`}
        columns={columns}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        search={searchParams.search}
        filters={[
          { name: "stage", label: "Stage", value: searchParams.stage || "", options: STAGES.map((s) => ({ value: s.id, label: s.label })) },
          { name: "ownerId", label: "Owner", value: searchParams.ownerId || "", options: referenceData.owners.map((o: any) => ({ value: o.id, label: o.fullName })) },
        ]}
        onCreateClick={() => setCreateOpen(true)}
      />
      <div className="mt-2 flex justify-end">
        <button onClick={() => router.push(`/crm/opportunities?view=kanban`)} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
          <LayoutGrid size={14} /> Switch to Kanban
        </button>
      </div>
      <CreateOppModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={loading} error={error} form={form} setForm={setForm} referenceData={referenceData} />
    </>
  );
}

function CreateOppModal({ open, onClose, onSubmit, loading, error, form, setForm, referenceData }: any) {
  return (
    <Modal open={open} onClose={onClose} title="Create Opportunity" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Opportunity Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="Company" value={form.companyId || ""} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
            <option value="">Select...</option>
            {referenceData.companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Product" value={form.productId || ""} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select...</option>
            {referenceData.products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Business Line" value={form.businessLineId || ""} onChange={(e) => setForm({ ...form, businessLineId: e.target.value })}>
            <option value="">Select...</option>
            {referenceData.businessLines.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <Select label="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}>
            <option value="">Select...</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Input label="Probability %" type="number" min={0} max={100} value={form.probability || 10} onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) })} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Quantity" type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <Input label="Estimated Value" type="number" value={form.estimatedValue || ""} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
          <Select label="Currency" value={form.currency || "USD"} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="EGP">EGP</option><option value="AED">AED</option>
          </Select>
        </div>
        <Input label="Expected Close Date" type="date" value={form.expectedCloseDate || ""} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
        <Select label="Owner" value={form.ownerId || ""} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
          <option value="">Select...</option>
          {referenceData.owners.map((o: any) => <option key={o.id} value={o.id}>{o.fullName}</option>)}
        </Select>
        <Textarea label="Requirement" value={form.requirement || ""} onChange={(e) => setForm({ ...form, requirement: e.target.value })} />
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Opportunity</Button>
        </div>
      </form>
    </Modal>
  );
}
