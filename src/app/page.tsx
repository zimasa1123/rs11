import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white space-y-6 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              RS
            </div>
            <div>
              <div className="text-2xl font-bold">RS Nexus</div>
              <div className="text-sm text-slate-300">Global Trade CRM</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            From Lead to Shipment.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            A complete Business Operating System built for international B2B trading,
            sourcing, and distribution. Connect markets, products, customers, suppliers,
            and shipments in one unified platform.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { k: "15", v: "Business Lines" },
              { k: "10+", v: "Markets" },
              { k: "End-to-End", v: "Pipeline Tracking" },
              { k: "AI-Powered", v: "Sales Intelligence" },
            ].map((s) => (
              <div key={s.v} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{s.k}</div>
                <div className="text-xs text-slate-400">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">RS</div>
            <div>
              <div className="font-bold text-slate-900">RS Nexus</div>
              <div className="text-xs text-slate-500">Global Trade CRM</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to access your workspace.</p>
          <LoginForm />
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 font-medium">Demo Credentials:</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>admin@rsnexus.com</span><span className="text-slate-400">admin123</span></div>
              <div className="flex justify-between"><span>sales@rsnexus.com</span><span className="text-slate-400">sales123</span></div>
              <div className="flex justify-between"><span>gm@rsnexus.com</span><span className="text-slate-400">gm123</span></div>
              <div className="flex justify-between"><span>marketing@rsnexus.com</span><span className="text-slate-400">mkt123</span></div>
              <div className="flex justify-between"><span>sourcing@rsnexus.com</span><span className="text-slate-400">src123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
