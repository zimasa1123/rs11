"use client";

import { useState } from "react";
import { ListPage } from "@/components/list-page";
import { Button, Modal, Input, Select, StatusBadge, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency, formatDate, label } from "@/lib/utils";
import { createCampaign } from "@/lib/actions";
import { TrendingUp } from "lucide-react";

const CHANNELS = ["google_ads", "meta_ads", "linkedin_ads", "seo", "website", "email", "whatsapp", "direct_outreach", "exhibitions", "referral", "other"];
const STATUSES = ["draft", "planned", "active", "paused", "completed", "cancelled"];
const COUNTRIES = ["Egypt", "Rwanda", "Tanzania", "Libya", "India", "Mauritania", "China", "UAE", "Palestine", "Saudi Arabia"];

export function CampaignsClient({ campaigns, businessLines }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ status: "planned", channel: "google_ads" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await createCampaign(form);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setOpen(false);
    setForm({ status: "planned", channel: "google_ads" });
  }

  const totalBudget = campaigns.reduce((s: number, c: any) => s + parseFloat(c.budget || 0), 0);
  const totalSpend = campaigns.reduce((s: number, c: any) => s + parseFloat(c.spend || 0), 0);
  const totalLeads = campaigns.reduce((s: number, c: any) => s + (c.leadCount || 0), 0);
  const totalImpressions = campaigns.reduce((s: number, c: any) => s + (c.impressions || 0), 0);
  const activeCampaigns = campaigns.filter((c: any) => c.status === "active").length;

  const columns = [
    {
      key: "name", label: "Campaign",
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.audience || "—"}</div>
        </div>
      ),
    },
    { key: "channel", label: "Channel", render: (r: any) => <Badge>{label(r.channel || "")}</Badge> },
    { key: "businessLine", label: "Business Line", render: (r: any) => r.businessLine || "—" },
    { key: "country", label: "Country", render: (r: any) => r.country || "—" },
    {
      key: "budget", label: "Budget / Spend",
      render: (r: any) => (
        <div className="text-xs">
          <div>{formatCurrency(r.budget)}</div>
          <div className="text-slate-500">Spend: {formatCurrency(r.spend)}</div>
        </div>
      ),
    },
    {
      key: "impressions", label: "Reach",
      render: (r: any) => (
        <div className="text-xs">
          <div>{(r.impressions || 0).toLocaleString()} imp.</div>
          <div className="text-slate-500">{(r.clicks || 0).toLocaleString()} clicks</div>
        </div>
      ),
    },
    { key: "leadCount", label: "Leads", render: (r: any) => <Badge variant="success">{r.leadCount || 0}</Badge> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status || ""} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="text-xs text-slate-500">Active</div>
          <div className="text-2xl font-bold text-slate-900">{activeCampaigns}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Total Budget</div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totalBudget)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Total Spend</div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totalSpend)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Leads Generated</div>
          <div className="text-xl font-bold text-emerald-600">{totalLeads}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Impressions</div>
          <div className="text-xl font-bold text-slate-900">{totalImpressions.toLocaleString()}</div>
        </Card>
      </div>

      <ListPage
        title="Campaigns"
        subtitle={`${campaigns.length} campaigns • Marketing attribution from source to revenue`}
        columns={columns}
        rows={campaigns}
        total={campaigns.length}
        page={1}
        pageSize={50}
        totalPages={1}
        onCreateClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create Campaign" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Campaign Name" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {CHANNELS.map((c) => <option key={c} value={c}>{label(c)}</option>)}
            </Select>
            <Select label="Business Line" value={form.businessLineId || ""} onChange={(e) => setForm({ ...form, businessLineId: e.target.value })}>
              <option value="">Select...</option>
              {businessLines.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select label="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Select...</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Target Audience" value={form.audience || ""} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            <Input label="Budget" type="number" value={form.budget || ""} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </Select>
            <Input label="Start Date" type="date" value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Campaign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
