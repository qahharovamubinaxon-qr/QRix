import Sidebar from "../../components/Sidebar";
import DashboardLinks from "@/components/DashboardLinks";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const requestCookies = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: requestCookies,
    }
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
  return (
  <pre style={{ color: "white", padding: "20px" }}>
    {JSON.stringify(
      await supabase.auth.getUser(),
      null,
      2
    )}
  </pre>
);
}

  const userId = session.user.id;

  const { data: links } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  const totalLinks = links?.length || 0;

  const totalScans =
    links?.reduce(
      (sum, item) => sum + item.scans,
      0
    ) || 0;

  return (
    <div className="flex min-h-screen bg-black text-white">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-5xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-400 mt-3">
          Welcome to QRix Control Center
        </p>

        <div className="grid md:grid-cols-4 gap-6 mt-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-cyan-400 text-4xl font-bold">
              {totalLinks}
            </h3>

            <p className="text-gray-400 mt-2">
              QR Generated
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-cyan-400 text-4xl font-bold">
              {totalScans}
            </h3>

            <p className="text-gray-400 mt-2">
              Users
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-cyan-400 text-4xl font-bold">
              99.9%
            </h3>

            <p className="text-gray-400 mt-2">
              Uptime
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-cyan-400 text-4xl font-bold">
              24/7
            </h3>

            <p className="text-gray-400 mt-2">
              Availability
            </p>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">
              {links?.slice(0, 5).map((item) => (
                <div
                  key={item.id ?? item.slug}
                  className="p-3 bg-black rounded-xl"
                >
                  <span>{item.slug}</span>
                  <span>{" • "}</span>
                  <span>{item.scans}</span>
                  <span>{" scans"}</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <CopyButton slug={item.slug} />
                    <DeleteButton slug={item.slug} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-4">
              Quick Tools
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-black rounded-xl p-4">
                URL QR
              </div>

              <div className="bg-black rounded-xl p-4">
                WiFi QR
              </div>

              <div className="bg-black rounded-xl p-4">
                PDF Tools
              </div>

              <div className="bg-black rounded-xl p-4">
                Image Tools
              </div>

            </div>

          </div>

        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20 mt-6">
          <h2 className="text-2xl font-bold mb-4">
            Dynamic QR Links
          </h2>

          <DashboardLinks links={links || []} />
        </div>

      </main>

    </div>
  );
}
