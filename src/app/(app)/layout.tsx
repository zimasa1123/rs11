import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Sidebar, TopBar } from "@/components/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return (
    <div className="flex min-h-screen">
      <Sidebar currentUser={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} />
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
