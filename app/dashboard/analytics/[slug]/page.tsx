import Sidebar from "@/components/Sidebar";
import { supabase as db } from "@/lib/supabase"; // service-role, for the RLS-locked qr_scans
import AnalyticsChart from "@/components/AnalyticsChart";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const { data: scans } = await db
    .from("qr_scans")
    .select("*")
    .eq("slug", slug)
    .order("scanned_at", {
      ascending: false,
    });

  const totalScans = scans?.length || 0;

  const countries = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const country = scan.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {}
  );

  const devices = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const device = scan.device || "Unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {}
  );

  const browsers = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const browser = scan.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    },
    {}
  );

  const scansByDay = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const day = new Date(scan.scanned_at)
        .toISOString()
        .split("T")[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(scansByDay || {})
    .sort()
    .map(([date, scans]) => ({
      date,
      scans,
    }));

  const stats = [
    { label: "Total Scans", value: totalScans, icon: "◎", tint: "rgba(34,211,238,.12)", color: "#22d3ee" },
    { label: "Countries", value: Object.keys(countries || {}).length, icon: "🌍", tint: "rgba(251,191,36,.12)", color: "#fbbf24" },
    { label: "Devices", value: Object.keys(devices || {}).length, icon: "📱", tint: "rgba(139,92,246,.15)", color: "#a78bfa" },
    { label: "Browsers", value: Object.keys(browsers || {}).length, icon: "🌐", tint: "rgba(52,211,153,.12)", color: "#34d399" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-10 max-w-[1500px]">
        <div className="qx-rise">
          <span className="qx-badge mb-3">QR Analytics</span>
          <h1
            className="font-display text-4xl font-bold tracking-tight mt-2"
            style={{ color: "var(--text)" }}
          >
            {slug}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Live scan statistics for this QR code
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`qx-card qx-card-lift qx-rise qx-rise-${i + 1} p-6`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4"
                style={{ background: stat.tint, color: stat.color }}
              >
                {stat.icon}
              </div>
              <p className="qx-stat">{stat.value}</p>
              <h2 className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </h2>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="qx-card p-6 mt-7">
          <h2 className="qx-title mb-6" style={{ color: "var(--text)" }}>
            Scan Trend
          </h2>
          <AnalyticsChart data={chartData} />
        </div>

        {/* Recent Scans */}
        <div className="qx-card p-6 mt-7">
          <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>
            Recent Scans
          </h2>

          <div className="space-y-3">
            {scans?.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Country
                    </div>
                    <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {scan.country || "Unknown"}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Device
                    </div>
                    <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {scan.device}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Browser
                    </div>
                    <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {scan.browser}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Time
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(scan.scanned_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
