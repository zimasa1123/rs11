import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AICommandCenter } from "./ai-client";

export const dynamic = "force-dynamic";

export default async function AIPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return <AICommandCenter user={user} />;
}
