import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { supabase as db } from "@/lib/supabase"; // service-role, for the RLS-locked link/scan tables
import DashboardClient from "@/components/DashboardClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Dashboard — Your QR Codes & Analytics",
  description: "Manage your dynamic QR codes, track scans and view analytics.",
  path: "/dashboard",
  noindex: true,
});

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/register?next=/dashboard");
  }

  const userId = session.user.id;

  // Реал линклар — фойдаланувчиники (service-role + user_id фильтри = эгалик кафолати)
  const { data: links } = await db
    .from("dynamic_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Реал сканлар — фақат шу фойдаланувчининг линкларига тегишлиси
  const slugs = (links || []).map((l) => l.slug);
  const { data: scans, error: scansError } = slugs.length
    ? await db
        .from("qr_scans")
        .select("*")
        .in("slug", slugs)
        .order("scanned_at", { ascending: false })
        .limit(1000)
    : { data: [], error: null };

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
