import Sidebar from "../../components/Sidebar";
import DashboardLinks from "@/components/DashboardLinks";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import { createClient } from "@/lib/supabase-server";
import DashboardChart from "@/components/DashboardChart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return (
      <pre style={{ color: "white", padding: "20px" }}>
        {JSON.stringify(await supabase.auth.getUser(), null, 2)}
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
    links?.reduce((sum, item) => sum + item.scans, 0) || 0;

  const mostPopular =
    links?.reduce(
      (best, current) =>
        !best || current.scans > best.scans ? current : best,
      null as any
    ) || null;

  const { data: recentScans, error: scansError } = await supabase
    .from("qr_scans")
    .select("*")
    .order("scanned_at", {
      ascending: false,
    })
    .limit(10);

  const protectedLinks =
    links?.filter((item) => item.pin).length || 0;

  const countriesCount =
    new Set(
      recentScans?.map((scan) => scan.country).filter(Boolean)
    ).size || 0;

  const chartData = Object.entries(
    recentScans?.reduce(
      (acc: Record<string, number>, scan) => {
        const day = new Date(scan.scanned_at)
          .toISOString()
          .split("T")[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {}
    ) || {}
  )
    .sort()
    .map(([date, scans]) => ({
      date,
      scans,
    }));

  console.log("SCANS ERROR:", scansError);

  const stats = [
    { label: "Total QR Codes", value: totalLinks, icon: "▣", tint: "rgba(139,92,246,.15)", color: "#a78bfa" },
    { label: "Total Scans", value: totalScans, icon: "◎", tint: "rgba(34,211,238,.12)", color: "#22d3ee" },
    { label: "Protected QR", value: protectedLinks, icon: "🛡", tint: "rgba(52,211,153,.12)", color: "#34d399" },
    { label: "Countries", value: countriesCount, icon: "🌍", tint: "rgba(251,191,36,.12)", color: "#fbbf24" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-10 max-w-[1500px]">
        {/* Header */}
        <div className="qx-rise">
          <h1
            className="font-display text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Dashboard
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Welcome to QRix Control Center
          </p>
        </div>

        {/* Most Popular */}
        {mostPopular && (
          <div className="qx-card qx-rise qx-rise-1 mt-7 p-6 relative overflow-hidden">
            <div
              className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at right, rgba(139,92,246,.12), transparent 70%)",
              }}
            />
            <span className="qx-badge mb-3">★ Most Popular QR</span>
            <div
              className="font-display text-2xl font-bold mt-2"
              style={{ color: "var(--text)" }}
            >
              {mostPopular.slug}
            </div>
            <div className="qx-stat !text-xl mt-1">
              {mostPopular.scans} scans
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`qx-card qx-card-lift qx-rise qx-rise-${i + 1} p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: stat.tint, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <h3 className="qx-stat">{stat.value.toLocaleString()}</h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity + Quick Tools */}
        <div className="grid lg:grid-cols-2 gap-5 mt-7">
          <div className="qx-card p-6">
            <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>
              Recent Activity
            </h2>
            <div className="space-y-2.5">
              {links?.slice(0, 5).map((item) => (
                <div
                  key={item.id ?? item.slug}
                  className="p-4 rounded-2xl transition-colors"
                  style={{
                    background: "var(--surface-hover)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text)" }}
                      >
                        {item.slug}
                      </span>
                      <span
                        className="ml-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.scans} scans
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <CopyButton slug={item.slug} />
                    <DeleteButton slug={item.slug} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="qx-card p-6">
            <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>
              Quick Tools
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/url-qr" className="qx-tile">
                <span
                  className="qx-tile-icon"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  🔗
                </span>
                URL QR
              </a>
              <a href="/wifi-qr" className="qx-tile">
                <span
                  className="qx-tile-icon"
                  style={{ background: "linear-gradient(135deg,#0891b2,#22d3ee)" }}
                >
                  📶
                </span>
                WiFi QR
              </a>
              <a href="/pdf-tools" className="qx-tile">
                <span
                  className="qx-tile-icon"
                  style={{ background: "linear-gradient(135deg,#dc2626,#f97316)" }}
                >
                  📄
                </span>
                PDF Tools
              </a>
              <a href="/image-tools" className="qx-tile">
                <span
                  className="qx-tile-icon"
                  style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}
                >
                  🖼
                </span>
                Image Tools
              </a>
            </div>
          </div>
        </div>

        {/* Scan Trend */}
        <div className="qx-card mt-5 p-6">
          <h2 className="qx-title mb-6" style={{ color: "var(--text)" }}>
            Scan Trend
          </h2>
          <DashboardChart data={chartData} />
        </div>

        {/* Recent Scans */}
        <div className="qx-card mt-5 p-6">
          <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>
            Recent Scans
          </h2>
          <div className="overflow-x-auto">
            <table className="qx-table">
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Country</th>
                  <th>Device</th>
                  <th>Browser</th>
                </tr>
              </thead>
              <tbody>
                {recentScans?.map((scan) => (
                  <tr key={scan.id}>
                    <td>{scan.slug}</td>
                    <td>{scan.country || "-"}</td>
                    <td>{scan.device || "-"}</td>
                    <td>{scan.browser || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic QR Links */}
        <div className="qx-card mt-5 p-6">
          <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>
            Dynamic QR Links
          </h2>
          <DashboardLinks links={links || []} />
        </div>
      </main>
    </div>
  );
}
