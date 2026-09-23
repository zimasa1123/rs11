"use client";

import { useState } from "react";
import { Card, Button, Modal, Input, Select, Textarea, StatusBadge, Badge } from "@/components/ui";
import { formatDate, priorityColor, formatDateTime } from "@/lib/utils";
import { createTask, updateTask } from "@/lib/actions";
import { Plus, CheckSquare, Clock, AlertCircle, Check } from "lucide-react";

export function TasksClient({ tasks, searchParams, owners }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ priority: "normal", status: "pending" });
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createTask(form);
    setLoading(false);
    setOpen(false);
    setForm({ priority: "normal", status: "pending" });
  }

  async function toggleComplete(task: any) {
    await updateTask(task.id, { status: task.status === "completed" ? "pending" : "completed" });
  }

  const pending = tasks.filter((t: any) => t.status === "pending");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const completed = tasks.filter((t: any) => t.status === "completed");
  const overdue = tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {tasks.length} total • {overdue.length} overdue • {pending.length} pending
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> New Task</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Clock size={14} /> Pending</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{pending.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><CheckSquare size={14} /> In Progress</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{inProgress.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Check size={14} /> Completed</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{completed.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><AlertCircle size={14} /> Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{overdue.length}</div>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {tasks.length === 0 && (
            <div className="p-12 text-center text-slate-500">No tasks</div>
          )}
          {tasks.map((t: any) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed";
            return (
              <div key={t.id} className="flex items-start gap-3 p-4 hover:bg-slate-50">
                <button
                  onClick={() => toggleComplete(t)}
                  className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    t.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {t.status === "completed" && <Check size={12} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${t.status === "completed" ? "line-through text-slate-400" : "text-slate-900"}`}>
                    {t.title}
                  </div>
                  {t.description && <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {t.priority && <Badge className={priorityColor(t.priority)}>{t.priority.toUpperCase()}</Badge>}
                    {t.entityType && <Badge>{t.entityType}</Badge>}
                    {t.dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                        Due {formatDate(t.dueDate)} {isOverdue && "• Overdue"}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">• {t.ownerName || "Unassigned"}</span>
                  </div>
                </div>
                <StatusBadge status={t.status || ""} />
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Task" size="md">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
            </Select>
            <Input label="Due Date" type="datetime-local" value={form.dueDate || ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <Select label="Assign To" value={form.ownerId || ""} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
            <option value="">Myself</option>
            {owners.map((o: any) => <option key={o.id} value={o.id}>{o.fullName}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
