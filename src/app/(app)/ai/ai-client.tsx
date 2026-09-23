"use client";

import { useState } from "react";
import { Card, Button, Badge, StatusBadge } from "@/components/ui";
import { Sparkles, Send, Lightbulb, Target, TrendingUp, Users, Package, AlertCircle, CheckCircle2 } from "lucide-react";

type Message = { role: "user" | "ai"; content: string; timestamp: Date };

const EXAMPLE_PROMPTS = [
  "Show open opportunities in Rwanda for building materials.",
  "Which leads have not been followed up for 7 days?",
  "Summarize the top 5 customers by value.",
  "Which products have generated the most quotations?",
  "Draft a WhatsApp follow-up to a lead who hasn't responded.",
  "Show me opportunities with no activity in the last 14 days.",
  "Why are we losing opportunities?",
  "Suggest next best actions for the sales team today.",
];

// Mock AI that processes queries against real CRM patterns
function processQuery(q: string): string {
  const lower = q.toLowerCase();

  if (lower.includes("lead") && lower.includes("follow") && (lower.includes("7 day") || lower.includes("overdue"))) {
    return `## Leads Needing Follow-up

Based on CRM analysis:

- **12 leads** have not been contacted in the last 7 days
- **4 leads** are marked "New" with no activity since creation
- **3 leads** in "Quotation Sent" status awaiting response

**Suggested Next Actions:**
1. Prioritize leads with estimated value > $50,000
2. Send personalized WhatsApp follow-ups to high-priority leads
3. Schedule calls with leads in negotiation stage

*Use the Leads page with filter "Next Follow-up < Today" to see the full list.*`;
  }

  if (lower.includes("opportunity") && lower.includes("rwanda")) {
    return `## Opportunities in Rwanda

I found **3 active opportunities** in Rwanda:

| Opportunity | Stage | Value | Owner |
|-------------|-------|-------|-------|
| Building Materials Bulk Order | Negotiation | $85,000 | Ahmed M. |
| Electrical Cables - Kigali | Quotation Sent | $42,000 | Omar N. |
| Agricultural Products Distribution | Qualified | $125,000 | Ahmed M. |

**Total pipeline value in Rwanda:** $252,000
**Weighted value:** $147,500

**Recommendation:** Focus on the agricultural opportunity - it has the highest value and is in early stages, so proactive engagement could accelerate closure.`;
  }

  if (lower.includes("losing") || lower.includes("lost") && lower.includes("opportunity")) {
    return `## Lost Opportunity Analysis

**Top reasons for lost deals (last 90 days):**

1. **Price too high** (38% of lost deals)
   - Suggestion: Review supplier costs, explore alternative suppliers
2. **Competitor won** (25%)
   - Suggestion: Gather competitive intelligence, differentiate on service
3. **Customer cancelled** (20%)
   - Suggestion: Earlier engagement, clearer requirements gathering
4. **Requirements unclear** (17%)
   - Suggestion: Improve discovery process, use standardized forms

**Action Items:**
- Implement a "win/loss review" process for deals over $50,000
- Create a competitive pricing matrix for key products
- Train sales team on value-based selling techniques`;
  }

  if (lower.includes("whatsapp") || lower.includes("draft") || lower.includes("email")) {
    return `## Suggested WhatsApp Follow-up

**Template:**

> Hi [Contact Name],
>
> Hope this message finds you well. I'm following up on our discussion about [Product Name] for your [Country] operations.
>
> We've prepared a competitive offer with:
> ✓ Best-in-class pricing
> ✓ [X]-day delivery guarantee
> ✓ Full quality certification
>
> Would you be available for a 15-minute call this week to discuss next steps?
>
> Best regards,
> [Your Name] - RS Nexus

**Tips:**
- Send between 9-11 AM local time
- Personalize with a reference to last conversation
- Include a specific call-to-action`;
  }

  if (lower.includes("product") && lower.includes("quotation")) {
    return `## Top Products by Quotation Count (Last 90 Days)

| Product | Quotations | Total Value | Win Rate |
|---------|------------|-------------|----------|
| Portland Cement 42.5 | 18 | $420,000 | 35% |
| Copper Cable 3x2.5mm | 14 | $285,000 | 42% |
| Carrara White Marble | 11 | $380,000 | 28% |
| LED Panel Light 60x60 | 9 | $125,000 | 55% |
| Steel Rebar 12mm | 8 | $195,000 | 30% |

**Insights:**
- LED panels have the highest win rate - consider expanding this line
- Marble has high value but lower conversion - investigate pricing
- Electrical cables are consistent performers across multiple markets`;
  }

  if (lower.includes("customer") || lower.includes("top")) {
    return `## Top 5 Customers by Value

| Company | Country | Orders | Total Value | Status |
|---------|---------|--------|-------------|--------|
| Al-Noor Distribution | UAE | 12 | $1,250,000 | Active |
| Royal Imports Ltd. | Rwanda | 8 | $890,000 | Active |
| Global Trading Co. | Egypt | 15 | $780,000 | Active |
| Prime Wholesale | Tanzania | 6 | $620,000 | Active |
| Atlas Industries | India | 9 | $545,000 | Active |

**Customer Health:**
- All top customers are active
- Average order value: $78,500
- Repeat business rate: 72%

**Recommendation:** Schedule quarterly reviews with top 5 customers to strengthen relationships and identify upsell opportunities.`;
  }

  if (lower.includes("next best action") || lower.includes("suggest") || lower.includes("today")) {
    return `## Suggested Actions for Today

### 🔥 High Priority
1. **Follow up with 3 overdue leads** (combined value: $180,000)
2. **Review 2 quotations expiring in 48 hours**
3. **Prepare for client meeting tomorrow** (Dubai - $250K deal)

### 📋 Important
4. **Update CRM** - 5 opportunities missing next follow-up dates
5. **Verify supplier credentials** - 2 suppliers with expiring certifications
6. **Review shipment delays** - 1 delayed shipment needs customer communication

### 💡 Growth Opportunities
7. **Reactivate dormant customer** - no activity for 90 days, $200K historical
8. **Cross-sell opportunity** - existing customer inquiring about new product line
9. **Marketing lead** - hot lead from LinkedIn campaign needs quick response

*Prioritize by estimated value and urgency.*`;
  }

  if (lower.includes("shipment") || lower.includes("delay")) {
    return `## Shipment Status Summary

**Active Shipments:** 12
- In Transit: 5
- At Customs: 2
- Arrived: 3
- Delayed: 1 ⚠️
- Preparing: 1

**Delayed Shipment:**
- SHP-2008 to Kigali (originally due 5 days ago)
- Cause: Customs documentation delay
- Action: Contact freight forwarder, update customer with new ETA

**Recommendation:** Set up automated alerts for shipments approaching ETA to proactively communicate with customers.`;
  }

  // Default response
  return `## AI Assistant Response

I analyzed your query: "${q}"

I'm currently operating in **Mock Mode** (development). In production, I would:

- Query the real CRM database
- Generate insights from actual records
- Provide data-driven recommendations
- Draft personalized communications

**Available Capabilities:**
- Lead & opportunity analysis
- Customer summaries & segmentation
- Pipeline forecasting
- Follow-up suggestions
- Communication drafting (email/WhatsApp)
- Lost deal analysis
- Supplier matching
- Product recommendations

Try asking about: leads, opportunities, customers, products, quotations, shipments, or next best actions.`;
}

export function AICommandCenter({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: `# 👋 Welcome to RS AI Command Center

I'm your AI-powered business intelligence assistant. I can help you:

- 🔍 **Analyze** your CRM data (leads, opportunities, customers)
- 📊 **Generate insights** from sales pipeline and marketing
- ✍️ **Draft** professional communications (email, WhatsApp)
- 💡 **Suggest** next best actions based on real data
- 📈 **Forecast** sales and identify trends

**How can I help you today?**

Try one of the example prompts below, or ask your own question.

*Note: Currently running in Mock Mode. Real AI integration available via provider configuration.*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(query?: string) {
    const q = query || input;
    if (!q.trim()) return;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: q, timestamp: new Date() }]);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 800));
    const response = processQuery(q);
    setMessages((prev) => [...prev, { role: "ai", content: response, timestamp: new Date() }]);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RS AI Command Center</h1>
              <p className="text-sm text-slate-500">Intelligent insights from your CRM data</p>
            </div>
          </div>
        </div>
        <Badge>Mock Mode</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-3">
          <Card className="min-h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "ai" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Sparkles size={14} />
                    </div>
                  )}
                  <div className={`flex-1 ${m.role === "user" ? "max-w-[80%]" : ""}`}>
                    <div
                      className={`rounded-lg p-4 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-slate-900 text-white ml-auto"
                          : "bg-slate-50 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {m.content.split("\n").map((line, j) => {
                        if (line.startsWith("# ")) return <h2 key={j} className="text-lg font-bold mb-2">{line.replace("# ", "")}</h2>;
                        if (line.startsWith("## ")) return <h3 key={j} className="text-base font-bold mt-3 mb-2">{line.replace("## ", "")}</h3>;
                        if (line.startsWith("### ")) return <h4 key={j} className="text-sm font-bold mt-2 mb-1">{line.replace("### ", "")}</h4>;
                        if (line.startsWith("> ")) return <blockquote key={j} className="border-l-2 border-purple-300 pl-3 my-2 italic text-slate-600">{line.replace("> ", "")}</blockquote>;
                        if (line.startsWith("| ")) return <div key={j} className="font-mono text-xs bg-white px-2 py-1 my-0.5 rounded">{line}</div>;
                        if (line.startsWith("- **")) {
                          const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
                          if (match) return <div key={j} className="ml-4 my-1">• <strong>{match[1]}</strong>{match[2]}</div>;
                        }
                        if (line.startsWith("- ")) return <div key={j} className="ml-4 my-0.5">• {line.replace("- ", "")}</div>;
                        if (/^\d+\./.test(line)) return <div key={j} className="ml-4 my-0.5">{line}</div>;
                        if (line.trim() === "") return <div key={j} className="h-2" />;
                        return <div key={j}>{line}</div>;
                      })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask RS AI anything about your business..."
                  className="flex-1 h-10 px-4 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={loading}
                />
                <Button type="submit" loading={loading} disabled={!input.trim()}>
                  <Send size={16} /> Send
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb size={14} /> Example Prompts
            </h3>
            <div className="space-y-2">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  className="w-full text-left text-xs text-slate-700 p-2 rounded border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Capabilities</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2"><Target size={12} /> Lead scoring & summaries</div>
              <div className="flex items-center gap-2"><TrendingUp size={12} /> Sales forecasting</div>
              <div className="flex items-center gap-2"><Users size={12} /> Customer insights</div>
              <div className="flex items-center gap-2"><Package size={12} /> Product matching</div>
              <div className="flex items-center gap-2"><AlertCircle size={12} /> Risk identification</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={12} /> Next best actions</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
