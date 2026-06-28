import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  const userId = session.user.id;

  // Реал линклар — фойдаланувчиники
  const { data: links } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Реал сканлар — охирги 1000 та (статистика учун)
  const { data: scans, error: scansError } = await supabase
    .from("qr_scans")
    .select("*")
    .order("scanned_at", { ascending: false })
    .limit(1000);

  if (scansError) console.log("SCANS ERROR:", scansError);

  return (
    <DashboardClient
      links={links || []}
      scans={scans || []}
      email={session.user.email || ""}
      now={new Date().toISOString()}
    />
  );
}
