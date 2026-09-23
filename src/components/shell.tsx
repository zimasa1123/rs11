"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Building2, UserCircle, Target, Activity, CheckSquare,
  Package, Truck, FileText, Megaphone, Globe, Building, UserCog, Clock, Calendar,
  BarChart3, Sparkles, Settings, ChevronDown, ChevronRight, LogOut, Search, Bell,
  Briefcase, DollarSign, ArrowLeftRight, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children?: { label: string; href: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[];
};

const navigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "CRM",
    icon: Target,
    children: [
      { label: "Leads", href: "/crm/leads", icon: Target },
      { label: "Companies", href: "/crm/companies", icon: Building2 },
      { label: "Contacts", href: "/crm/contacts", icon: UserCircle },
      { label: "Opportunities", href: "/crm/opportunities", icon: TrendingUp },
      { label: "Activities", href: "/crm/activities", icon: Activity },
      { label: "Tasks", href: "/crm/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Products & Trading",
    icon: Package,
    children: [
      { label: "Products", href: "/trading/products", icon: Package },
      { label: "Suppliers", href: "/trading/suppliers", icon: Truck },
      { label: "Sourcing Requests", href: "/trading/sourcing", icon: ArrowLeftRight },
      { label: "Supplier Quotes", href: "/trading/supplier-quotes", icon: FileText },
      { label: "Quotations", href: "/trading/quotations", icon: DollarSign },
    ],
  },
  {
    label: "Operations",
    icon: Briefcase,
    children: [
      { label: "Orders", href: "/ops/orders", icon: Briefcase },
      { label: "Shipments", href: "/ops/shipments", icon: Truck },
      { label: "Documents", href: "/ops/documents", icon: FileText },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    children: [
      { label: "Campaigns", href: "/marketing/campaigns", icon: Megaphone },
      { label: "Lead Sources", href: "/marketing/sources", icon: Globe },
      { label: "Content Calendar", href: "/marketing/content", icon: Calendar },
      { label: "Marketing Analytics", href: "/analytics/marketing", icon: BarChart3 },
    ],
  },
  {
    label: "Markets",
    icon: Globe,
    children: [
      { label: "Countries", href: "/markets/countries", icon: Globe },
      { label: "Markets", href: "/markets/markets", icon: Globe },
      { label: "Branches", href: "/markets/branches", icon: Building },
    ],
  },
  {
    label: "Team",
    icon: UserCog,
    children: [
      { label: "Employees", href: "/team/employees", icon: Users },
      { label: "Attendance", href: "/team/attendance", icon: Clock },
      { label: "Leave", href: "/team/leave", icon: Calendar },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "Sales Analytics", href: "/analytics/sales", icon: BarChart3 },
      { label: "Product Analytics", href: "/analytics/products", icon: Package },
      { label: "Market Analytics", href: "/analytics/markets", icon: Globe },
      { label: "Supplier Analytics", href: "/analytics/suppliers", icon: Truck },
      { label: "Executive Reports", href: "/analytics/executive", icon: TrendingUp },
    ],
  },
  { label: "RS AI", href: "/ai", icon: Sparkles },
  {
    label: "Administration",
    icon: Settings,
    children: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Audit Logs", href: "/admin/audit", icon: Activity },
    ],
  },
];

export function Sidebar({ currentUser }: { currentUser: { fullName: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((n) => {
      if (n.children && n.children.some((c) => pathname.startsWith(c.href))) {
        initial[n.label] = true;
      }
    });
    return initial;
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={cn(
      "bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 transition-all",
      collapsed ? "w-16" : "w-64",
    )}>
      <div className={cn("flex items-center gap-2.5 p-4 border-b border-slate-800", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          RS
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm leading-tight truncate">RS Nexus</div>
            <div className="text-xs text-slate-400 leading-tight truncate">Global Trade CRM</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navigation.map((item) => {
          if (!item.children) {
            const active = pathname === item.href;
            const Icon = item.icon!;
            return (
              <Link
                key={item.label}
                href={item.href!}
                title={item.label}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                  collapsed && "justify-center",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          }

          const isOpen = openGroups[item.label];
          const Icon = item.icon!;
          const hasActiveChild = item.children.some((c) => pathname.startsWith(c.href));

          return (
            <div key={item.label}>
              <button
                onClick={() => !collapsed && toggleGroup(item.label)}
                title={item.label}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                  hasActiveChild ? "text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                  collapsed && "justify-center",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="mt-0.5 ml-2 space-y-0.5 border-l border-slate-800 pl-2">
                  {item.children.map((child) => {
                    const active = pathname.startsWith(child.href);
                    const CIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                          active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                        )}
                      >
                        {CIcon && <CIcon size={14} className="shrink-0" />}
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-slate-800 p-2", collapsed && "px-1")}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white"
        >
          <ChevronRight size={18} className={cn("shrink-0 transition-transform", !collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {currentUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{currentUser.fullName}</div>
              <div className="text-xs text-slate-400 truncate capitalize">{currentUser.role.replace(/_/g, " ")}</div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" title="Logout" className="text-slate-400 hover:text-white">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}

export function TopBar({ user }: { user: { fullName: string; email: string; role: string } }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies, leads, opportunities..."
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-semibold">
          {user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
