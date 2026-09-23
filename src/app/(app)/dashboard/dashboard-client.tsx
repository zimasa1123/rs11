"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target, TrendingUp, FileText, DollarSign, Briefcase, Truck, CheckSquare,
  AlertCircle, BarChart3, Activity, Sparkles, Globe, ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, KPICard, Select, StatusBadge, Badge } from "@/components/ui";
import { formatCurrency, label } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

type DashboardData = Awaited<ReturnType<typeof import("@/lib/queries").getDashboardData>>;

const COLORS = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export function DashboardClient({ data, initialDays }: { data: DashboardData; initialDays: number }) {
  const router = useRouter();
  const [days, setDays] = useState(initialDays);

  const stageOrder = ["new_lead", "contacted", "qualified", "requirement_received", "sourcing", "quotation_preparation", "quotation_sent", "negotiation", "verbal_agreement", "won"];
  const pipelineStageData = stageOrder.map((s) => {
    const found = data.pipelineByStage.find((p) => p.stage === s);
    return {
      stage: label(s).replace("Quotation ", "Qt "),
      count: found?.count || 0,
      value: Number(found?.value || 0),
    };
  });

  const leadsSourceData = data.leadsBySource.map((s, i) => ({
    name: s.source || "Unknown",
    value: s.count,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time overview of your business operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={days.toString()}
            onChange={(e) => {
              const d = parseInt(e.target.value);
              setDays(d);
              router.push(`/dashboard?days=${d}`);
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </Select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Leads"
          value={data.kpis.totalLeads}
          icon={<Target size={20} />}
          onClick={() => router.push("/crm/leads")}
        />
        <KPICard
          label="Qualified Leads"
          value={data.kpis.qualifiedLeads}
          icon={<Sparkles size={20} />}
          onClick={() => router.push("/crm/leads?status=qualified")}
        />
        <KPICard
          label="Open Opportunities"
          value={data.kpis.openOpportunities}
          icon={<TrendingUp size={20} />}
          onClick={() => router.push("/crm/opportunities")}
        />
        <KPICard
          label="Pipeline Value"
          value={formatCurrency(data.kpis.pipelineValue)}
          icon={<DollarSign size={20} />}
          onClick={() => router.push("/crm/opportunities")}
        />
        <KPICard
          label="Quotations"
          value={data.kpis.quotations}
          icon={<FileText size={20} />}
          onClick={() => router.push("/trading/quotations")}
        />
        <KPICard
          label="Quotation Value"
          value={formatCurrency(data.kpis.quotationValue)}
          icon={<DollarSign size={20} />}
          onClick={() => router.push("/trading/quotations")}
        />
        <KPICard
          label="Won Deals"
          value={data.kpis.wonDeals}
          icon={<TrendingUp size={20} />}
          change={`${data.kpis.lostDeals} lost`}
          onClick={() => router.push("/crm/opportunities?stage=won")}
        />
        <KPICard
          label="Orders"
          value={data.kpis.orders}
          icon={<Briefcase size={20} />}
          onClick={() => router.push("/ops/orders")}
        />
        <KPICard
          label="Active Shipments"
          value={data.kpis.shipments}
          icon={<Truck size={20} />}
          onClick={() => router.push("/ops/shipments")}
        />
        <KPICard
          label="Open Tasks"
          value={data.kpis.openTasks}
          icon={<CheckSquare size={20} />}
          onClick={() => router.push("/crm/tasks")}
        />
        <KPICard
          label="Overdue Tasks"
          value={data.kpis.overdueTasks}
          icon={<AlertCircle size={20} />}
          onClick={() => router.push("/crm/tasks?overdue=1")}
          change={data.kpis.overdueTasks > 0 ? "Needs attention" : undefined}
        />
        <KPICard
          label="Win Rate"
          value={`${data.kpis.wonDeals + data.kpis.lostDeals > 0
            ? Math.round((data.kpis.wonDeals / (data.kpis.wonDeals + data.kpis.lostDeals)) * 100)
            : 0}%`}
          icon={<BarChart3 size={20} />}
          change={`${data.kpis.wonDeals}W / ${data.kpis.lostDeals}L`}
        />
      </div>

      {/* Pipeline Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineStageData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => {
                      const v = typeof value === "number" ? value : Number(value);
                      return [formatCurrency(v), "Value"];
                    }}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsSourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {leadsSourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pipelineByCountry} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="country" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => formatCurrency(typeof v === "number" ? v : Number(v))} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Business Line</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pipelineByBusinessLine} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="businessLine" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => formatCurrency(typeof v === "number" ? v : Number(v))} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activities & overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <a href="/crm/activities" className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data.recentActivities.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">No activities yet</div>
              )}
              {data.recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4 hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Activity size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{a.subject}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {a.companyName && <span className="font-medium">{a.companyName}</span>}
                      {a.companyName && a.ownerName && " • "}
                      {a.ownerName && <span>{a.ownerName}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge>{label(a.type)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Overdue Follow-ups</CardTitle>
            <a href="/crm/leads" className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data.overdueFollowUps.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  <div className="text-emerald-600 font-medium">✓ All caught up</div>
                  <div className="text-xs mt-1">No overdue follow-ups</div>
                </div>
              )}
              {data.overdueFollowUps.map((l) => (
                <a key={l.id} href={`/crm/leads/${l.id}`} className="flex items-start gap-3 p-4 hover:bg-slate-50 block">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{l.companyName || "Unknown Company"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{l.ownerName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={l.status || ""} />
                    <div className="text-xs text-red-600 mt-1">
                      {l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleDateString() : ""}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shipment Status Overview</CardTitle>
            <a href="/ops/shipments" className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {data.shipmentStatusCounts.length === 0 && (
                <div className="col-span-full text-center text-sm text-slate-500 py-4">No shipments</div>
              )}
              {data.shipmentStatusCounts.map((s) => (
                <div key={s.status || "unknown"} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{s.count}</div>
                  <div className="mt-1">
                    <StatusBadge status={s.status || ""} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
